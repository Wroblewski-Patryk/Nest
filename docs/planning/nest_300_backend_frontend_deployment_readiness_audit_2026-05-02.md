# NEST-300 Backend, Frontend, And Deployment Readiness Audit

Date: 2026-05-02
Stage: analysis
Operation mode: TESTER

## Task Contract

### Context

The user requested a broad backend and frontend analysis to check whether the
application is architecturally aligned, well implemented, and ready to support
deployment planning.

Architecture truth was checked against:

- `docs/architecture/architecture-source-of-truth.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/tech-stack.md`
- `DEPLOYMENT_GATE.md`
- `INTEGRATION_CHECKLIST.md`
- `DEFINITION_OF_DONE.md`
- `docs/security/secure-development-lifecycle.md`
- `docs/operations/service-reliability-and-observability.md`
- `docs/ux/*` canonical workflow and quality docs

### Goal

Produce a deployment-planning audit that identifies strengths, architectural
drift, risks, and the recommended implementation order across backend, web,
mobile, contracts, security, reliability, and UX parity.

### Constraints

- Analysis only; no runtime implementation changes.
- Architecture docs remain the source of truth.
- Any architecture mismatch must be surfaced as a decision point rather than
  silently coded around.
- Preserve multi-tenant isolation, human/AI actor boundaries, web/mobile API
  parity, and `en`/`pl` localization baseline.

### Definition Of Done

- Backend, frontend, mobile, contract, security, and deployment surfaces are
  inspected with file evidence.
- Relevant validation commands are run and recorded.
- Deployment blockers and next implementation slices are ordered by priority.
- Task board and project state reference this audit.

### Forbidden

- Do not create workaround-only paths.
- Do not normalize runtime drift without explicit decision.
- Do not weaken auth, tenant isolation, AI guardrails, or API contract parity.

## Executive Summary

Nest is in a stronger state than a typical MVP codebase: the Laravel API has
clear route protection, tenant-scoped tests, AI guardrails, integration
idempotency tests, observability tests, and a centralized error envelope. The
biggest deployment risk is not missing backend functionality; it is alignment
drift between the documented architecture and the current deployment/runtime
configuration, plus a few web/mobile hardening gaps.

The backend is broadly architecturally sound, but deployment should wait for an
explicit decision on PHP/Node/PostgreSQL/Redis versions and queue backing. The
web app builds cleanly and now carries the canonical visual direction, but its
auth-token storage and fail-open middleware behavior need a production decision.
Mobile compiles and exports, but its tab IA is still older than the canonical
five-pillar navigation.

## Backend Assessment

### What Is Strong

- API protection is layered through Sanctum plus route middleware such as
  delegated scope, actor context, tenant usage, entitlements, and AI surface
  guards.
- AI behavior is correctly treated as a guarded backend capability, not a
  separate source of truth. Feature tests cover disabled AI surface behavior,
  approval-before-write flows, redacted context graphs, tenant scoping, and
  policy regression checks.
- Multi-tenant safety has real evidence: feature and integration suites include
  tenant-scoped tests across tasks, calendar, habits, goals, journal,
  integrations, collaboration, notifications, and queue jobs.
- Integration architecture is mature for MVP: provider adapters, mapping
  hashes, idempotency, conflict queues, failed sync replay, SLO commands, and
  dead-letter persistence are tested.
- Centralized API error envelopes are tested and give web/mobile a stable
  client contract.

### Backend Risks And Gaps

1. Runtime stack drift blocks clean deployment confidence.
   `docs/architecture/tech-stack.md` declares PHP 8.4, PostgreSQL 17, Redis 7+
   for cache/queue, and Node 24 for frontend/tooling. Current deployment files
   use PHP 8.3 images, allow PHP `^8.2`, use Node 22 images, Postgres 16, and
   database-backed cache/session/queue in Coolify compose.

2. Queue backing is hard-coded in one integration service.
   `ListTaskIntegrationSyncService` calls `Queue::connection('database')`,
   which conflicts with the architecture default of Redis queues. This makes
   queue behavior less environment-configurable.

3. Policy coverage is good in sensitive newer areas but uneven in older core
   modules. Tasks/lists, life areas, integration conflicts, and failed syncs
   have stronger policy-layer coverage; habits, routines, calendar events, and
   journal rely mainly on controller/service query scoping. The tests show
   tenant safety, so this is not an active data-leak finding, but it is below
   the documented target of query scoping plus explicit policies for sensitive
   actions.

4. Some controllers still hold business workflow complexity directly. This is
   workable for MVP, but task assignment, lifecycle transitions, journal/life
   area operations, and org/collaboration workflows should gradually move
   toward thinner controllers and domain services/read models.

5. OpenAPI contracts are valid but not yet clean enough to be a strict release
   gate. Redocly validates all five contract files, but reports 78 warnings,
   mostly missing operation IDs, missing tag descriptions, and missing 4XX
   response declarations.

## Web Frontend Assessment

### What Is Strong

- Next 16 / React 19 app builds and typechecks cleanly.
- The shared API client handles timeouts, JSON parsing, error envelopes, and
  localized user-safe error messages.
- The current web shell and Dashboard have been brought close to the canonical
  visual direction without removing API-backed behavior.
- Route guard regression and web unit contract checks pass.

### Web Risks And Gaps

1. Browser token storage is the largest production security concern. The web
   app stores the bearer token in `localStorage` and a JS-readable cookie with
   `SameSite=Lax`, but without `HttpOnly` or `Secure`. Any future XSS bug could
   read the token.

2. Middleware currently fails open when `/auth/me` cannot be fetched. It treats
   the request as authenticated during an API outage to preserve navigation
   behavior. API calls still fail later, but deployment should decide whether
   this is acceptable or whether protected routes should fail closed.

3. Locale-aware routing is incomplete. The root app renders
   `<html lang="pl">`, while the architecture requires `en`/`pl` baseline and
   locale-aware routing behavior. Client-side language storage exists, but the
   server/root route structure does not yet express locale.

4. Several screens have route-local large components, manual `useEffect` data
   fetching, and showcase fallback states. This is acceptable for fast UX
   iteration, but before release the app needs a production rule: showcase data
   can support empty states, but must not hide API failure states.

5. UX polish is uneven outside the newly refreshed canonical surfaces. Some
   older routes still use native browser confirmation dialogs and dense
   route-local patterns that do not match the new premium Nest shell.

## Mobile Assessment

### What Is Strong

- Mobile TypeScript passes.
- Expo web export passes.
- Mobile unit contract check passes.
- Mobile uses the shared API client foundation, which is good for API parity.

### Mobile Risks And Gaps

1. Mobile IA is behind the web canonical direction. The tab layout still
   exposes Tasks, Habits, Goals, Journal, Calendar, hidden Insights, and
   Settings. The current canonical IA is Dashboard, Planning, Calendar,
   Journal, Settings.

2. Mobile UI is still mostly practical module UI, not the latest slim,
   notebook-like canonical experience. This is not a blocker if mobile remains
   V2 scope, but it is a parity blocker if mobile is expected in the same
   deployment promise as web.

3. Mobile auth/session hardening should be reviewed before production native
   release. The API client layer is thin and shared, but deployment requires a
   clear token persistence strategy for native storage.

## Deployment Decision Points

### Decision 1: Runtime Stack

Option A: Align implementation to architecture.

- Upgrade API Docker/runtime target to PHP 8.4.
- Use Node 24 for web Docker/tooling.
- Use PostgreSQL 17 in deployment compose.
- Use Redis for cache, session, queue, rate limiting, locks, and integration
  work.
- Remove hard-coded database queue connections.

Option B: Align architecture docs to the current deployable stack.

- Document PHP 8.3/Node 22/Postgres 16/database queue as the MVP deployment
  baseline.
- Keep Redis as a planned hardening migration.
- This is lower effort but less aligned with the current architecture truth.

Recommended: Option A unless hosting constraints make it impossible.

### Decision 2: Web Session Model

Option A: Move to httpOnly, Secure server-set auth cookies or a small BFF-style
session boundary for web.

Option B: Keep bearer tokens in browser storage for MVP, but add strong CSP,
XSS review, shorter token TTL, stricter cookie flags, and explicit risk
acceptance.

Recommended: Option A before public production.

### Decision 3: Mobile Deployment Scope

Option A: Web-first deployment; mobile remains V2 and is excluded from parity
claims.

Option B: Include mobile in deployment and first align IA, auth storage, and
canonical screen parity.

Recommended: Option A if the next deployment is meant to ship quickly.

## Recommended Implementation Plan

### P0: Release Blockers

1. Resolve runtime stack decision and make code/config/docs consistent.
2. Replace hard-coded database queue usage with config-driven queue dispatch.
3. Decide and implement web session hardening or explicitly accept MVP token
   storage risk with compensating controls.
4. Decide route-guard outage behavior: fail closed for protected routes or
   document fail-open as an intentional availability tradeoff.
5. Fix OpenAPI release warnings that affect generated clients: operation IDs,
   4XX responses, and tag descriptions.
6. Capture production environment checklist for Coolify: `APP_KEY`, CORS,
   Sanctum stateful domains, API URLs, queue worker process, scheduler,
   database migration command, Redis, health checks, and rollback path.

### P1: Architecture Hardening

1. Create a policy coverage ledger for all controllers and sensitive actions.
2. Add missing policies where query scoping alone is not enough for long-term
   maintainability.
3. Move complex controller workflows into domain services/read models.
4. Add contract tests comparing backend response envelopes with shared client
   expectations.
5. Add production observability runbook: health endpoints, queue SLOs, sync SLOs,
   auth failures, worker failures, and alert routes.

### P2: Product And UX Parity

1. Align remaining web routes with the current canonical shell quality bar.
2. Add server-visible locale routing or another documented locale-aware routing
   strategy.
3. Define a production rule for showcase/empty/demo states.
4. If mobile is in scope, align tabs to Dashboard, Planning, Calendar, Journal,
   Settings and update the first two mobile screens to the canonical compact
   visual language.

## Validation Evidence

Commands run on 2026-05-02:

- API unit: `php artisan test --testsuite=Unit --env=testing` passed, 20 tests.
- API feature: `php artisan test --testsuite=Feature --env=testing` passed,
  216 tests.
- API integration: `php artisan test --testsuite=Integration --env=testing`
  passed, 11 tests.
- API security controls:
  `php artisan security:controls:verify --json --env=testing` passed with
  severity `ok`, 6 checks, 0 failed.
- Web lint: `pnpm lint` passed.
- Web typecheck: `pnpm exec tsc --noEmit` passed.
- Web build: `pnpm build` passed.
- Web unit: `pnpm test:unit` passed.
- Mobile typecheck: `pnpm exec tsc --noEmit` passed.
- Mobile unit: `pnpm test:unit` passed.
- Mobile export: `pnpm exec expo export --platform web` passed.
- Contracts:
  `pnpm --package=@redocly/cli dlx redocly lint docs/engineering/contracts/openapi_*.yaml`
  passed validity with 78 warnings.

## Key File Evidence

- Runtime architecture target: `docs/architecture/tech-stack.md`
- Runtime/deploy drift: `apps/api/composer.json`, `apps/api/Dockerfile`,
  `apps/web/Dockerfile`, `docker-compose.coolify.yml`
- Queue hard-code: `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php`
- API route/middleware shape: `apps/api/routes/api.php`, `bootstrap/app.php`
- Web auth/session: `apps/web/src/lib/auth-session.ts`
- Web route guard: `apps/web/middleware.ts`
- Web root locale: `apps/web/src/app/layout.tsx`
- Mobile IA: `apps/mobile/app/(tabs)/_layout.tsx`
- Shared API client: `packages/shared-types/src/client.js`

## Result Report

The project is not fundamentally misbuilt. The backend is strong enough to be
the stable source of truth, and current tests give meaningful confidence in
tenant isolation, actor boundaries, AI write safety, integrations, and error
contracts. The next deployment plan should focus on removing architecture drift
and production hardening gaps rather than adding new product breadth.

Recommended next slice: `NEST-301 Runtime deployment stack alignment`, followed
by `NEST-302 Web session and route-guard production hardening`, then
`NEST-303 OpenAPI strict contract cleanup`.
