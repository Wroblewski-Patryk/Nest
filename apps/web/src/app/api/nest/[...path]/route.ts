import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_TOKEN_COOKIE_KEY,
  ONBOARDING_REQUIRED_COOKIE_KEY,
} from "@/lib/route-guard";

const apiBaseUrl = process.env.NEST_API_URL ?? process.env.NEXT_PUBLIC_NEST_API_URL ?? "http://127.0.0.1:9000/api/v1";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function buildApiUrl(path: string[], request: NextRequest): string {
  const upstream = new URL(`${apiBaseUrl}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    upstream.searchParams.append(key, value);
  });

  return upstream.toString();
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

function clearSessionCookies(response: NextResponse): NextResponse {
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

function syncSessionCookies(response: NextResponse, payload: unknown, path: string[]): NextResponse {
  if (path.join("/") === "auth/logout") {
    return clearSessionCookies(response);
  }

  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    return response;
  }

  const data = (payload as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) {
    return response;
  }

  const token = (data as { token?: unknown }).token;
  if (typeof token === "string" && token.trim().length > 0) {
    response.cookies.set({
      name: AUTH_TOKEN_COOKIE_KEY,
      value: token,
      ...sessionCookieOptions(),
    });
  }

  const user = (data as { user?: unknown }).user;
  const onboardingRequired =
    typeof user === "object" && user !== null
      ? (user as { onboarding_required?: unknown }).onboarding_required
      : (data as { onboarding_required?: unknown }).onboarding_required;

  if (typeof onboardingRequired === "boolean") {
    response.cookies.set({
      name: ONBOARDING_REQUIRED_COOKIE_KEY,
      value: onboardingRequired ? "1" : "0",
      ...sessionCookieOptions(),
    });
  }

  return response;
}

function removeTokenFromPayload(payload: unknown): unknown {
  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    return payload;
  }

  const data = (payload as { data?: unknown }).data;
  if (typeof data !== "object" || data === null || !("token" in data)) {
    return payload;
  }

  return {
    ...(payload as Record<string, unknown>),
    data: {
      ...(data as Record<string, unknown>),
      token: undefined,
    },
  };
}

async function proxyNestApi(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path = [] } = await context.params;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  const headers = new Headers();
  headers.set("Accept", request.headers.get("Accept") ?? "application/json");
  headers.set("Content-Type", request.headers.get("Content-Type") ?? "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const upstreamResponse = await fetch(buildApiUrl(path, request), {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const contentType = upstreamResponse.headers.get("content-type") ?? "";
  const rawBody = await upstreamResponse.text();
  const payload = contentType.includes("application/json") && rawBody.length > 0
    ? JSON.parse(rawBody)
    : rawBody;

  const responsePayload = removeTokenFromPayload(payload);
  const response =
    upstreamResponse.status === 204
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(responsePayload, { status: upstreamResponse.status });

  return syncSessionCookies(response, payload, path);
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyNestApi(request, context);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyNestApi(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyNestApi(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyNestApi(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyNestApi(request, context);
}
