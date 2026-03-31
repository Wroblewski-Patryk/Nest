const AUTH_TOKEN_STORAGE_KEY = "nest.auth.token";
const AUTH_TOKEN_COOKIE_KEY = "nest.auth.token";
const ONBOARDING_REQUIRED_COOKIE_KEY = "nest.auth.onboarding_required";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function readCookie(key: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const entry = document.cookie
    .split(";")
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(`${key}=`));

  if (!entry) {
    return null;
  }

  const value = entry.slice(key.length + 1);
  return value.length > 0 ? decodeURIComponent(value) : null;
}

function writeCookie(key: string, value: string, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(key: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token && token.trim().length > 0) {
    return token;
  }

  return readCookie(AUTH_TOKEN_COOKIE_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  writeCookie(AUTH_TOKEN_COOKIE_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  clearCookie(AUTH_TOKEN_COOKIE_KEY);
}

export function isOnboardingRequired(): boolean | null {
  const value = readCookie(ONBOARDING_REQUIRED_COOKIE_KEY);
  if (value === "1") {
    return true;
  }
  if (value === "0") {
    return false;
  }
  return null;
}

export function setOnboardingRequired(required: boolean): void {
  writeCookie(ONBOARDING_REQUIRED_COOKIE_KEY, required ? "1" : "0");
}

export function clearOnboardingRequired(): void {
  clearCookie(ONBOARDING_REQUIRED_COOKIE_KEY);
}

export function setAuthSession(token: string, onboardingRequired: boolean): void {
  setAuthToken(token);
  setOnboardingRequired(onboardingRequired);
}

export function clearAuthSession(): void {
  clearAuthToken();
  clearOnboardingRequired();
}
