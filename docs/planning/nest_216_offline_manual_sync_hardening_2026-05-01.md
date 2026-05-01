# Task

## Header

- ID: NEST-216
- Title: Verify and harden offline/manual sync user flow
- Task Type: fix
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-215
- Priority: P1
- Coverage Ledger Rows:
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Process Self-Audit

- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

`NEST-215` made the shared API client preserve backend error envelope metadata,
including `error.retryable`. The offline/manual sync surfaces still used only
HTTP status when a queued sync failed, and the auto-sync retry gate treated any
failed item without `next_retry_at` as immediately retryable.

## Goal

Make offline/manual sync honor the richer shared error contract so
non-retryable backend failures do not loop through auto-sync while preserving
manual retry as the user-controlled recovery path.

## Scope

- web UX contract wrapper:
  `apps/web/src/lib/ux-contract.ts`
- web offline/manual sync UI:
  `apps/web/src/components/offline-sync-card.tsx`
- mobile UX contract wrapper:
  `apps/mobile/lib/ux-contract.ts`
- mobile offline/manual sync UI:
  `apps/mobile/app/modal.tsx`
- planning/context sync:
  `docs/planning/mvp-next-commits.md`
  `docs/planning/v1_execution_backlog_2026-04-26.md`
  `.codex/context/TASK_BOARD.md`
  `.codex/context/PROJECT_STATE.md`

## Success Signal

- User or operator problem:
  auto-sync can repeatedly retry failures that the backend already marked as
  not retryable.
- Expected product or reliability outcome:
  auto-sync backs off only retryable failures, while manual retry remains
  available after the user resolves the underlying issue.
- How success will be observed:
  failed queue items store retryability metadata, non-retryable failures do not
  get an automatic `next_retry_at`, and the retry scheduler excludes them.
- Post-launch learning needed: no

## Deliverable For This Stage

Implemented web/mobile retryability handling plus validation and repo-truth
updates.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Expose `getApiErrorCode(...)` and `getApiErrorRetryable(...)` through the
   existing web and mobile UX wrapper modules.
2. Extend web and mobile offline queue items with optional retryability metadata.
3. On sync failure, derive `last_error`, `retryable`, and `next_retry_at` from
   the shared backend envelope.
4. Change auto-sync retry eligibility so `retryable: false` is not retried
   automatically.
5. Keep manual `Retry Sync` as an explicit override that can requeue failed
   items.
6. Run targeted web/mobile validation and update queue/context docs.

## Acceptance Criteria

- [x] web offline sync records non-retryable failures without auto-retry
- [x] mobile offline sync records non-retryable failures without auto-retry
- [x] manual retry still requeues failed items on both clients
- [x] web and mobile validations pass or blockers are recorded
- [x] planning/context docs reflect completion evidence

## Definition of Done

- [x] implementation output exists
- [x] acceptance criteria are verified
- [x] required validations were run and recorded
- [x] architecture follow-up is captured if discovered
- [x] task status is updated in `.codex/context/TASK_BOARD.md`
- [x] `.codex/context/PROJECT_STATE.md` reflects current reality

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

## Notes

This task intentionally consumes the shared error envelope from `NEST-215`
without changing backend sync endpoints or broadening into IA/design work.

## Validation Evidence

- Tests:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
  `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
  `node .\scripts\unit-contract.mjs` in `apps/web`,
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
  `node .\scripts\unit-contract.mjs` in `apps/mobile`,
  `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`
- Manual checks:
  inspected web and mobile auto-sync retry gates, sync failure handling, and
  manual retry override behavior
- Screenshots/logs:
  not applicable
- High-risk checks:
  confirmed the change reuses the existing shared error contract and does not
  alter sync API endpoints, tenant boundaries, or ownership checks
- Coverage ledger updated: not applicable
- Coverage rows closed or changed:
  not applicable

## Architecture Evidence

- Architecture source reviewed:
  `docs/architecture/system-architecture.md`,
  `docs/architecture/architecture-source-of-truth.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed:
  not applicable
- Follow-up architecture doc updates:
  none required

## Result Report

- Task summary:
  hardened offline/manual sync so web and mobile consume backend retryability
  metadata from the shared error envelope and avoid automatic retry loops for
  non-retryable failures.
- Files changed:
  `apps/web/src/lib/ux-contract.ts`,
  `apps/web/src/components/offline-sync-card.tsx`,
  `apps/mobile/lib/ux-contract.ts`,
  `apps/mobile/app/modal.tsx`,
  `apps/mobile/constants/offlineQueue.ts`,
  `apps/mobile/constants/offlineSyncScheduler.ts`,
  `.codex/context/TASK_BOARD.md`,
  `.codex/context/PROJECT_STATE.md`,
  `docs/planning/mvp-next-commits.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`,
  `docs/planning/nest_216_offline_manual_sync_hardening_2026-05-01.md`
- How tested:
  web typecheck/lint/unit-contract and mobile typecheck/unit-contract/Expo web
  export
- What is incomplete:
  broad route-level adoption of richer error metadata remains incremental
- Next steps:
  execute `NEST-217`
- Decisions made:
  kept manual `Retry Sync` as an explicit override for failed items, including
  failures that auto-sync will not retry

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues:
  auto-sync treated any failed item without `next_retry_at` as due for retry
- Gaps:
  web/mobile offline sync did not consume `error.retryable` from the hardened
  shared error envelope
- Inconsistencies:
  failure details stored status-only information even when backend error codes
  were available
- Architecture constraints:
  preserve the existing offline queue and sync endpoint architecture

### 2. Select One Priority Task
- Selected task:
  `NEST-216`
- Priority rationale:
  it is the first unfinished item in the active `v1` queue and directly depends
  on `NEST-215`
- Why other candidates were deferred:
  daily-loop audits start after sync reliability is closed

### 3. Plan Implementation
- Files or surfaces to modify:
  existing web/mobile UX wrappers and offline/manual sync surfaces
- Logic:
  record retryability metadata on failure, skip automatic retries for
  `retryable: false`, and keep manual retry as the user-driven override
- Edge cases:
  missing retryability defaults to retryable to preserve existing behavior;
  manual retry clears retryability metadata before requeueing

### 4. Execute Implementation
- Implementation notes:
  added wrapper exports for `getApiErrorCode(...)` and
  `getApiErrorRetryable(...)`; updated queue item metadata and retry due checks
  on web and mobile

### 5. Verify and Test
- Validation performed:
  web typecheck, lint, unit-contract; mobile typecheck, unit-contract, Expo web
  export
- Result:
  all required checks passed

### 6. Self-Review
- Simpler option considered:
  only change copy around failed sync items
- Technical debt introduced: no
- Scalability assessment:
  retry behavior now follows the centralized backend error contract instead of
  local status guessing
- Refinements made:
  preserved manual retry semantics for recovery after user intervention

### 7. Update Documentation and Knowledge
- Docs updated:
  task report, next-commit queue, v1 backlog, task board, and project state
- Context updated:
  yes
- Learning journal updated:
  not applicable
