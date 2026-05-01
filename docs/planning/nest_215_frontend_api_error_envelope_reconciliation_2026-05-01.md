# Task

## Header

- ID: NEST-215
- Title: Reconcile frontend assumptions with actual API error envelopes
- Task Type: refactor
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-214
- Priority: P1
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Process Self-Audit

- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

`NEST-214` hardened CRUD method and item coverage in `@nest/shared-types`, but
the frontend error contract still depended on partial assumptions. The shared
helpers only reasoned about `status` and top-level payload strings, while the
backend already publishes a machine-readable envelope with
`error.code`, `error.retryable`, `error.http_status`, and structured field
errors.

The current worktree also contains active user changes in web/mobile shell and
localization surfaces, so this slice needed to improve the shared error layer
without editing those in-progress route files.

## Goal

Make the shared frontend error contract reflect the real backend error
envelope so both web and mobile can consume richer error semantics without
route-local guessing.

## Success Signal

- User or operator problem:
  frontend helpers currently collapse most API failures down to status-based
  guesses even when the backend returns a more precise machine-readable error
  envelope.
- Expected product or reliability outcome:
  shared helpers can read `error.code`, `error.retryable`,
  `error.http_status`, and field errors consistently, and the shared API
  client preserves that information on thrown errors.
- How success will be observed:
  `@nest/shared-types` exports the richer error helpers and the thrown request
  error object carries the backend envelope details.
- Post-launch learning needed: yes, through `NEST-216` sync UX follow-up.

## Deliverable For This Stage

Completed shared error-contract hardening plus repo-truth updates pointing the
queue to `NEST-216`.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] shared frontend helpers parse the backend error envelope fields that
  actually exist today
- [x] the shared API client preserves machine-readable error metadata on
  thrown request errors
- [x] declaration files expose the hardened contract to web and mobile
- [x] planning docs reflect task completion
- [ ] `.codex/context` files reflect task completion where writable

## Stage Exit Criteria

- [x] The output matches the declared `Current Stage`.
- [x] Work from later stages was not mixed in without explicit approval.
- [x] Risks and assumptions for this stage are stated clearly.

## Forbidden

- new systems without approval
- duplicated logic or parallel implementations of the same contract
- temporary bypasses, hacks, or workaround-only paths
- architecture changes without explicit approval
- implicit stage skipping

## Implementation Summary

- Added shared error-envelope readers in
  `packages/shared-types/src/client.js` for:
  - `error.code`
  - `error.retryable`
  - `error.http_status`
  - top-level `errors`
- Hardened `describeApiIssue(...)` so it prefers machine-readable error codes
  before falling back to HTTP status.
- Hardened `createNestApiClient(...).request(...)` so thrown errors now carry
  envelope-derived `code`, `retryable`, `details`, `errors`, and the backend
  message when present.
- Updated `packages/shared-types/src/index.d.ts` and
  `packages/shared-types/src/client.d.ts` to expose the richer error contract
  to both clients.

## Validation Evidence

- Tests:
  `node -e` contract checks against `packages/shared-types/src/client.js`
- High-risk checks:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`
  `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`
  `node .\scripts\unit-contract.mjs` in `apps/web`
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`
  `node .\scripts\unit-contract.mjs` in `apps/mobile`
  `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`
- Manual checks:
  code inspection against
  `apps/api/tests/Feature/ApiErrorEnvelopeContractTest.php`
- Build:
  not rerun in this slice

## Architecture Evidence

- Architecture source reviewed:
  `docs/architecture/system-architecture.md`,
  `docs/architecture/architecture-source-of-truth.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Follow-up architecture doc updates:
  none required

## Result Report

- Task summary:
  reconciled the shared frontend error helpers with the real Laravel error
  envelope and preserved that metadata on thrown shared-client errors.
- Files changed:
  `packages/shared-types/src/client.js`,
  `packages/shared-types/src/index.d.ts`,
  `packages/shared-types/src/client.d.ts`,
  `docs/planning/mvp-next-commits.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`,
  `docs/planning/nest_215_frontend_api_error_envelope_reconciliation_2026-05-01.md`
- How tested:
  shared-contract node checks, web typecheck/lint/unit-contract, mobile
  typecheck/unit-contract/export
- What is incomplete:
  route-level adoption of richer error metadata remains incremental and should
  be pulled where needed during future slices instead of by wide churn now;
  `.codex/context/TASK_BOARD.md` and `.codex/context/PROJECT_STATE.md` still
  need the completion note because this environment rejected writes to those
  files
- Next steps:
  execute `NEST-216` to verify and harden the offline/manual sync flow using
  the now-richer shared error contract
- Decisions made:
  kept the fix centralized in `@nest/shared-types` to avoid colliding with
  active route-level work in the dirty tree
