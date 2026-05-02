# Open Decisions

## Decision Item
- ID:
- Context:
- Options:
- Recommendation:
- Owner:
- Due date:
- Status: OPEN | DECIDED

## Decision Item
- ID: OD-2026-03-31-01
- Context: delegated AI access needs machine credentials for user-approved
  scopes with safe rotation/revocation and clear compatibility with existing
  auth stack.
- Options:
  - Keep Laravel Sanctum personal access tokens with scoped abilities and
    metadata extension for delegation.
  - Introduce OAuth2 client-credentials grant for AI automation immediately.
- Recommendation: start with scoped Sanctum credentials for faster delivery in
  `NEST-164`, then evaluate OAuth2 migration after first real usage telemetry.
- Owner: Planning Agent
- Due date: 2026-04-03
- Status: OPEN

## Decision Item
- ID: OD-2026-03-31-02
- Context: AI write operations can run in agent-own mode or delegated-user mode
  and need predictable approval behavior for safety and usability.
- Options:
  - Require explicit per-action approval for all delegated writes.
  - Allow scope-based auto-execution for selected low-risk actions with user
    configurable policy and full audit.
- Recommendation: enforce explicit approval by default with optional future
  opt-in auto-execution for low-risk scopes only.
- Owner: Product + Review Agent
- Due date: 2026-04-05
- Status: OPEN

## Decision Item
- ID: OD-2026-04-26-01
- Context: approved product policy says users land on the main dashboard after
  onboarding/authentication, but the current mobile app still opens into the
  `Tasks` tab (`apps/mobile/app/(tabs)/index.tsx`) and has no dedicated
  dashboard route yet.
- Options:
  - Add a dedicated mobile dashboard tab/route and make it the authenticated
    landing surface, then shift `Tasks` into its own tab position.
  - Keep `Tasks` as the mobile home surface and reinterpret it as the mobile
    dashboard, then align architecture/docs to that rule explicitly.
  - Add a dedicated mobile dashboard route as the post-login landing surface,
    but keep it outside the persistent tab bar and leave `Tasks` as the central
    primary tab action.
- Recommendation: prefer a dedicated mobile dashboard route so the product
  keeps one clear post-login concept across web and mobile without turning
  `Tasks` into an overloaded home substitute.
- Owner: Founder + Planning Agent
- Due date: 2026-04-27
- Status: OPEN

## Decision Item
- ID: OD-2026-05-02-01
- Context: `NEST-300` found drift between the approved runtime architecture
  (PHP 8.4, Node 24, PostgreSQL 17, Redis-backed cache/session/queue) and the
  current deploy configuration (PHP 8.3 images, PHP `^8.2`, Node 22 images,
  Postgres 16, database-backed cache/session/queue).
- Options:
  - Align implementation/deployment to the approved architecture runtime.
  - Revise architecture docs to declare the current Coolify stack as the MVP
    deployment baseline and treat Redis/runtime upgrades as later hardening.
- Recommendation: align implementation/deployment to the approved architecture
  unless hosting constraints block it.
- Owner: Founder + Execution Agent
- Due date: 2026-05-03
- Status: DECIDED

## Decision Item
- ID: OD-2026-05-02-02
- Context: web currently stores bearer tokens in browser-readable storage and
  middleware treats `/auth/me` outages as authenticated to preserve navigation.
- Options:
  - Move web to httpOnly Secure server-set cookies or a BFF-style session
    boundary and fail closed on protected-route auth-check outages.
  - Keep browser bearer-token storage for MVP with explicit risk acceptance,
    shorter token TTL, stricter cookie flags where possible, CSP/XSS review,
    and documented fail-open behavior.
- Recommendation: prefer httpOnly Secure session handling and fail-closed
  protected routes before public production.
- Owner: Founder + Execution Agent
- Due date: 2026-05-04
- Status: DECIDED

## Decision Item
- ID: OD-2026-05-02-03
- Context: web is now closest to the canonical product shell, while mobile still
  exposes the older Tasks/Habits/Goals/Journal/Calendar tab model.
- Options:
  - Ship web-first and explicitly keep native mobile outside the next release
    claim.
  - Include mobile in the release and first align mobile IA to Dashboard,
    Planning, Calendar, Journal, Settings plus native token-storage review.
- Recommendation: ship web-first if the goal is the fastest reliable
  deployment; align mobile as a follow-up wave.
- Owner: Founder + Planning Agent
- Due date: 2026-05-04
- Status: DECIDED
