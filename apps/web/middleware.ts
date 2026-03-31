import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_TOKEN_COOKIE_KEY,
  ONBOARDING_REQUIRED_COOKIE_KEY,
  isOnboardingPath,
  isProtectedPath,
  isPublicPath,
  resolveRouteAccess,
} from "@/lib/route-guard";

const apiBaseUrl = process.env.NEXT_PUBLIC_NEST_API_URL ?? "http://127.0.0.1:9000/api/v1";
const onboardingCookieMaxAgeSeconds = 60 * 60 * 24 * 30; // 30 days

function readOnboardingCookie(raw: string | undefined): boolean | null {
  if (raw === "1") {
    return true;
  }
  if (raw === "0") {
    return false;
  }
  return null;
}

async function resolveSessionFromApi(token: string): Promise<{
  authenticated: boolean;
  onboardingRequired: boolean | null;
}> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        authenticated: false,
        onboardingRequired: null,
      };
    }

    const payload = (await response.json()) as { data?: { onboarding_required?: unknown } };

    return {
      authenticated: true,
      onboardingRequired:
        typeof payload.data?.onboarding_required === "boolean"
          ? payload.data.onboarding_required
          : null,
    };
  } catch {
    // Preserve current request behavior if API is temporarily unavailable.
    return {
      authenticated: true,
      onboardingRequired: null,
    };
  }
}

function withClearedSessionCookies(response: NextResponse): NextResponse {
  response.cookies.set({
    name: AUTH_TOKEN_COOKIE_KEY,
    value: "",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: ONBOARDING_REQUIRED_COOKIE_KEY,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}

function withOnboardingCookie(response: NextResponse, required: boolean | null): NextResponse {
  if (required === null) {
    return response;
  }

  response.cookies.set({
    name: ONBOARDING_REQUIRED_COOKIE_KEY,
    value: required ? "1" : "0",
    path: "/",
    maxAge: onboardingCookieMaxAgeSeconds,
    sameSite: "lax",
  });

  return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const pathNeedsGuard = isProtectedPath(pathname) || isPublicPath(pathname) || isOnboardingPath(pathname);

  if (!pathNeedsGuard) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value;
  const hasToken = typeof token === "string" && token.trim().length > 0;
  let onboardingRequired = readOnboardingCookie(
    request.cookies.get(ONBOARDING_REQUIRED_COOKIE_KEY)?.value
  );

  if (hasToken && onboardingRequired === null && token) {
    const resolved = await resolveSessionFromApi(token);
    if (!resolved.authenticated) {
      const unauthenticatedResult = resolveRouteAccess({
        pathname,
        hasToken: false,
        onboardingRequired: null,
      });

      if (unauthenticatedResult.redirectTo) {
        const target = new URL(unauthenticatedResult.redirectTo, request.url);
        return withClearedSessionCookies(NextResponse.redirect(target));
      }

      return withClearedSessionCookies(NextResponse.next());
    }

    onboardingRequired = resolved.onboardingRequired;
  }

  const result = resolveRouteAccess({
    pathname,
    hasToken,
    onboardingRequired,
  });

  if (result.redirectTo) {
    const target = new URL(result.redirectTo, request.url);
    return withOnboardingCookie(NextResponse.redirect(target), onboardingRequired);
  }

  return withOnboardingCookie(NextResponse.next(), onboardingRequired);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
