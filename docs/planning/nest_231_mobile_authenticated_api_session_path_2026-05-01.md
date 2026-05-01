# Task

## Header

- ID: NEST-231
- Title: Decide and implement mobile authenticated API session path
- Task Type: planning
- Current Stage: post-release
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-232
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

`NEST-229` found that mobile web export cannot prove real authenticated API
behavior. `apps/mobile/constants/apiClient.ts` creates `nestApiClient` without
a `getToken` provider, while the Laravel API protects core routes with
Sanctum auth middleware.

Architecture says web and mobile both consume the same API contracts, with
Laravel Sanctum for first-party clients and tenant-aware guards on every query
path.

## Goal

Record the mobile auth/session decision for the current V1 scope.

## 2026-05-02 Decision

The user explicitly paused mobile application work for V1 and clarified that
current V1 views should be implemented in the web layer. The mobile application
is V2 scope.

As a result, this task no longer blocks V1 founder readiness. The mobile
authenticated API session path should be revisited when V2 mobile work resumes.

## Architecture Mismatch

Mobile core screens are described as API-backed, but the mobile runtime has no
authenticated session source. Adding an env token, hardcoded token, or smoke-only
localStorage hook would make tests pass while violating the auth and ownership
contract.

## Decision Options

### Option A - Implement real mobile auth/onboarding now

- Add mobile login/register/onboarding/session persistence and wire
  `nestApiClient` to the stored Sanctum token.
- Pros:
  closes the mobile real-API smoke honestly and aligns mobile with the API auth
  model.
- Cons:
  larger than a tiny fix; touches UX, storage, protected routing, error states,
  and mobile parity.

### Option B - Add a scoped mobile smoke-session bridge only for web export

- Let mobile web export read an already-provided test token from browser
  storage for local smoke only, while native mobile remains unresolved.
- Pros:
  fastest way to prove exported mobile screens against real API in local smoke.
- Cons:
  cannot satisfy real mobile founder-ready; must be clearly marked as smoke
  harness and kept out of production/native claims.

### Option C - Remove mobile real-API smoke from V1 founder-ready claim

- Treat mobile as UI/parity candidate only until mobile auth is implemented.
- Pros:
  avoids fake auth and keeps release claim narrow.
- Cons:
  materially weakens the V1 founder-ready claim because mobile core CRUD cannot
  be proven through real authenticated API behavior.

## Recommendation

The 2026-05-02 user decision selects the web-first V1 path and moves mobile app
delivery to V2. Avoid Option B unless a future V2 testing plan explicitly asks
for a local smoke harness with no production/native claim.

## Acceptance Criteria

- [x] mismatch is described
- [x] valid options are documented
- [x] no workaround token path is introduced
- [x] implementation waits for V2 mobile planning

## Definition of Done

- [x] decision brief exists
- [x] task is deferred to V2 by explicit user decision
- [x] docs/context reflect the blocker

## Validation Evidence

- Static inspection:
  `apps/mobile/constants/apiClient.ts` creates `nestApiClient` without
  `getToken`.
- Architecture review:
  `docs/architecture/system-architecture.md`,
  `docs/architecture/backend_strategy.md`, and
  `docs/architecture/v1_v2_delivery_split.md` require authenticated first-party
  API usage and web/mobile API contract parity.

## Result Report

- Task summary:
  Published the mobile authenticated API session decision brief.
- Files changed:
  `docs/planning/nest_231_mobile_authenticated_api_session_path_2026-05-01.md`,
  plus planning/context docs.
- What is incomplete:
  mobile auth/session implementation is deferred until V2 mobile planning.
