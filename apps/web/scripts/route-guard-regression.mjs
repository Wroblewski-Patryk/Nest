import assert from "node:assert/strict";
import { resolveRouteAccess } from "../src/lib/route-guard.ts";

function expectRedirect(params) {
  return resolveRouteAccess(params).redirectTo;
}

assert.equal(expectRedirect({ pathname: "/", hasToken: false, onboardingRequired: null }), "/auth");
assert.equal(expectRedirect({ pathname: "/tasks", hasToken: false, onboardingRequired: null }), "/auth");
assert.equal(expectRedirect({ pathname: "/settings", hasToken: false, onboardingRequired: null }), "/auth");
assert.equal(expectRedirect({ pathname: "/auth", hasToken: false, onboardingRequired: null }), null);
assert.equal(
  expectRedirect({ pathname: "/onboarding", hasToken: false, onboardingRequired: null }),
  "/auth"
);

assert.equal(expectRedirect({ pathname: "/", hasToken: true, onboardingRequired: true }), "/onboarding");
assert.equal(
  expectRedirect({ pathname: "/calendar", hasToken: true, onboardingRequired: true }),
  "/onboarding"
);
assert.equal(
  expectRedirect({ pathname: "/onboarding", hasToken: true, onboardingRequired: true }),
  null
);

assert.equal(expectRedirect({ pathname: "/auth", hasToken: true, onboardingRequired: false }), "/");
assert.equal(expectRedirect({ pathname: "/onboarding", hasToken: true, onboardingRequired: false }), "/");
assert.equal(expectRedirect({ pathname: "/tasks", hasToken: true, onboardingRequired: false }), null);
assert.equal(expectRedirect({ pathname: "/settings", hasToken: true, onboardingRequired: false }), null);

console.log("Route guard regression check passed.");
