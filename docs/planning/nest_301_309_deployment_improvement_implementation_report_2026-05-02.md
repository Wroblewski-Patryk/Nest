# NEST-301 Through NEST-309 Deployment Improvement Implementation Report

Date: 2026-05-02
Stage: implementation + verification

## Summary

Implemented the planned deployment improvement wave from
`docs/planning/nest_deployment_improvement_plan_2026-05-02.md`.

## Completed Slices

### NEST-301 Runtime Deployment Stack Alignment

- API Docker image moved to PHP 8.4.
- Web Docker image moved to Node 24.
- Coolify compose moved to PostgreSQL 17 and Redis 7.
- API and worker production env now use Redis for cache, session, and queue.
- Redis service, volume, password support, and health check were added.
- Worker entrypoint now uses configured queue connection and queue names.
- Integration sync enqueue no longer hard-codes the database queue connection.
- API cache default now matches Redis architecture baseline.
- Composer lock was refreshed after the PHP platform requirement update.

### NEST-302 Web Session And Route-Guard Hardening

- Web API traffic now defaults to same-origin `/api/nest`.
- Added a Next.js API proxy that forwards requests to Laravel and owns the
  bearer token in `HttpOnly` cookies.
- Login/register responses set server-owned session cookies and remove the token
  from the payload returned to client components.
- Client API requests no longer read the bearer token from `localStorage`.
- Old localStorage token is cleared when auth helpers run.
- Middleware now fails closed when `/auth/me` cannot be checked.

### NEST-303 OpenAPI Strict Contract Cleanup

- Added tag descriptions, missing operation IDs, and missing 4XX responses in
  release contract files.
- Redocly lint now passes without warnings.

### NEST-304 Production Operations Checklist And Smoke Path

- Added the web-first release runbook:
  `docs/operations/nest_web_first_release_runbook_2026-05-02.md`.
- Updated `DEPLOYMENT_GATE.md` with the approved runtime baseline and runbook
  evidence requirement.
- Updated `INTEGRATION_CHECKLIST.md` with queue/worker and browser-session
  release checks.

### NEST-305 Policy Coverage Ledger And Sensitive Action Gap Fix

- Added `docs/security/policy_coverage_ledger_2026-05-02.md`.
- Added `HabitPolicy`.
- `HabitController` now layers explicit policy checks on top of existing
  tenant/user query scoping.

### NEST-306 Controller Workflow Thin-Slice Refactor

- Consolidated repeated habit tenant/user query scoping into
  `accessibleHabitQuery()`.
- Kept behavior and API contracts unchanged.

### NEST-307 Locale-Aware Web Routing First Slice

- UI language selection now writes a server-visible `nest.ui.language` cookie.
- Root layout reads the cookie/default language and sets `<html lang>` from it
  instead of hard-coding Polish.

### NEST-308 Production Showcase And Error-State Rule

- Added `docs/ux/production_showcase_error_state_rule_2026-05-02.md`.
- Dashboard, Calendar, and Journal now use showcase states for empty/sparse
  data only, not API failures.

### NEST-309 Mobile Scope Decision

- Added `docs/planning/mobile_scope_decision_web_first_release_2026-05-02.md`.
- Next release remains web-first; native mobile remains V2/out of release
  parity claim until a dedicated IA/session slice is scheduled.

## Validation Evidence

Completed during implementation and final verification:

- `composer validate --no-check-publish`: passed after lock refresh.
- `php artisan test --testsuite=Unit --env=testing`: passed, 20 tests.
- `php artisan test --testsuite=Feature --env=testing`: passed, 216 tests.
- `php artisan test --testsuite=Integration --env=testing`: passed, 11 tests.
- `php artisan security:controls:verify --json --env=testing`: passed with
  severity `ok`.
- `php artisan test --filter=HabitsAndRoutinesApiTest --env=testing`: passed
  during the habit policy slice.
- `pnpm lint` in `apps/web`: passed.
- `pnpm exec tsc --noEmit` in `apps/web`: passed.
- `pnpm build` in `apps/web`: passed.
- `pnpm test:unit` in `apps/web`: passed.
- `pnpm exec tsc --noEmit` in `apps/mobile`: passed.
- `pnpm test:unit` in `apps/mobile`: passed.
- `pnpm exec expo export --platform web` in `apps/mobile`: passed.
- Redocly lint across all five OpenAPI contract files: passed with no warnings.
- `git diff --check`: passed with CRLF warnings only.

## Residual Risk

- Local PHP is 8.3 while production target is PHP 8.4. API tests still ran in
  the local environment for the touched habit scope, but release should run the
  full API suite in the PHP 8.4 container before deployment.
- The web session proxy is now safer than browser token storage, but it should
  receive browser smoke testing in a production-like HTTPS environment to verify
  cookie behavior across the chosen domain and proxy topology.
- Mobile remains intentionally outside the next release parity claim.
