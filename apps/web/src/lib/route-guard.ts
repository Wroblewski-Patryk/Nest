export const AUTH_TOKEN_COOKIE_KEY = "nest.auth.token";
export const ONBOARDING_REQUIRED_COOKIE_KEY = "nest.auth.onboarding_required";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/tasks",
  "/habits",
  "/routines",
  "/goals",
  "/targets",
  "/calendar",
  "/journal",
  "/insights",
  "/automations",
  "/billing",
  "/settings",
] as const;

const PUBLIC_PREFIXES = ["/", "/auth"] as const;

function normalizePath(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (pathname.endsWith("/") && pathname !== "/") {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === "/") {
    return pathname === "/";
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPublicPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return PUBLIC_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix));
}

export function isOnboardingPath(pathname: string): boolean {
  return matchesPrefix(normalizePath(pathname), "/onboarding");
}

export function isProtectedPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  if (isPublicPath(normalized) || isOnboardingPath(normalized)) {
    return false;
  }

  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix));
}

type RouteGuardResult = {
  redirectTo: "/auth" | "/dashboard" | null;
};

export function resolveRouteAccess(params: {
  pathname: string;
  hasToken: boolean;
  onboardingRequired: boolean | null;
}): RouteGuardResult {
  const { pathname, hasToken } = params;
  const normalized = normalizePath(pathname);

  if (!hasToken) {
    if (isProtectedPath(normalized) || isOnboardingPath(normalized)) {
      return { redirectTo: "/auth" };
    }

    return { redirectTo: null };
  }

  if (isOnboardingPath(normalized) || isPublicPath(normalized)) {
    return { redirectTo: "/dashboard" };
  }

  return { redirectTo: null };
}
