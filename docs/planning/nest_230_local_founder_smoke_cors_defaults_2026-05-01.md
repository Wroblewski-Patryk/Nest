# Task

## Header

- ID: NEST-230
- Title: Fix local founder-smoke CORS defaults for web/mobile dev origins
- Task Type: implementation
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-229
- Priority: P0
- Coverage Ledger Rows:
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Process Self-Audit

- [x] All seven autonomous loop steps are represented.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

`NEST-229` browser smoke found that real local web UI calls from
`http://127.0.0.1:9001` to `http://127.0.0.1:9000/api/v1/...` are blocked by
CORS preflight because the API only allows explicitly configured
`CORS_ALLOWED_ORIGINS`, and the local `.env` has none.

## Goal

Allow the documented local founder-smoke web/mobile origins in local and
testing environments without widening production CORS behavior.

## Constraints

- preserve production CORS explicitness
- do not allow wildcard origins
- do not change auth or tenant behavior
- do not introduce a new runtime service
- keep mobile authentication as a separate `NEST-231` decision/fix

## Definition of Done

- [x] local/testing default origins include web `9001` and mobile-web `9002`
- [x] production still depends on explicit `CORS_ALLOWED_ORIGINS`
- [x] API CORS config test exists
- [x] targeted API validation passes
- [x] founder smoke can rerun web Calendar CRUD past CORS
- [x] docs/context are updated

## Forbidden

- wildcard CORS
- disabling auth middleware
- adding fake tokens or bypasses
- hiding the separate mobile auth-session blocker

## Implementation Plan

1. Add local/testing-only CORS defaults for `localhost` and `127.0.0.1` on
   ports `9001` and `9002`.
2. Add a feature test for the local/testing CORS defaults.
3. Rerun targeted API validation and the relevant browser smoke.

## Acceptance Criteria

- [x] `config('cors.allowed_origins')` contains local web/mobile origins under
  `APP_ENV=testing`
- [x] web browser Calendar create/edit/delete reaches the API rather than
  failing on CORS
- [x] no production wildcard or fake auth behavior is introduced

## Validation Evidence

- `php artisan test --filter=CorsConfigurationTest --env=testing` passed:
  1 test, 4 assertions.
- `php artisan test --filter=CalendarEventsApiTest --env=testing` passed:
  5 tests, 25 assertions.
- Local API server restarted on `http://127.0.0.1:9000`.
- Manual preflight:
  `OPTIONS http://127.0.0.1:9000/api/v1/calendar-events` with origin
  `http://127.0.0.1:9001` returned `204` and
  `Access-Control-Allow-Origin: http://127.0.0.1:9001`.
- Browser smoke rerun:
  web Calendar no longer fails on CORS. It now reaches the API and exposes the
  next blocker: `GET /api/v1/calendar-events?per_page=200` returns `422`.

## Result Report

- Task summary:
  Added local/testing-only CORS defaults for the documented web and mobile
  founder-smoke origins.
- Files changed:
  `apps/api/config/cors.php`,
  `apps/api/tests/Feature/CorsConfigurationTest.php`,
  `docs/planning/nest_230_local_founder_smoke_cors_defaults_2026-05-01.md`,
  plus planning/context docs.
- What is incomplete:
  web Calendar CRUD smoke is now blocked by a separate API/client query
  contract mismatch (`per_page=200`), not by CORS.
- Next task:
  `NEST-232` fix web Calendar event query page size to match API contract.
