# Task

## Header

- ID: NEST-221
- Title: Run repaired web/mobile parity audit
- Task Type: research
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-220
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

`NEST-220` refreshed the V1 readiness matrix and left parity evidence open.
Recent slices repaired mobile CRUD reachability, settings discovery, shared
error recovery, localization behavior, and offline/manual sync retryability.
This slice checks whether the founder-critical outcomes are equivalent across
web and mobile.

## Goal

Record parity by user outcome, not by screen similarity, across the repaired
web and mobile V1 surfaces.

## Scope

- Web:
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/calendar/page.tsx`,
  `apps/web/src/app/journal/page.tsx`,
  `apps/web/src/app/habits/page.tsx`,
  `apps/web/src/app/routines/page.tsx`,
  `apps/web/src/app/settings/page.tsx`,
  `apps/web/src/components/offline-sync-card.tsx`
- Mobile:
  `apps/mobile/app/(tabs)/index.tsx`,
  `apps/mobile/app/(tabs)/calendar.tsx`,
  `apps/mobile/app/(tabs)/goals.tsx`,
  `apps/mobile/app/(tabs)/habits.tsx`,
  `apps/mobile/app/(tabs)/journal.tsx`,
  `apps/mobile/app/(tabs)/settings.tsx`,
  `apps/mobile/app/modal.tsx`,
  `apps/mobile/components/mvp/ModuleScreen.tsx`
- Shared:
  `packages/shared-types/src/localization.js`

## Success Signal

- User or operator problem:
  parity is still assumed from recent implementation work rather than recorded
  by outcome.
- Expected product or reliability outcome:
  every founder-critical outcome has current web status, mobile status, gap,
  and next task.
- How success will be observed:
  the parity table below can feed `NEST-222` and `NEST-223` without claiming
  unresolved Calendar/provider gaps as ready.
- Post-launch learning needed: no

## Deliverable For This Stage

Docs-only parity audit and queue/context updates.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Acceptance Criteria

- [x] each core outcome records web status, mobile status, evidence, gap, and
  next task if needed
- [x] parity is judged by result, not by visual similarity
- [x] Calendar/provider-token limitations are represented explicitly
- [x] no runtime implementation is mixed into this audit
- [x] docs/context queue moves to `NEST-222`

## Parity Status Vocabulary

- `PASS`: both surfaces let the founder complete the outcome through real app
  behavior.
- `PARTIAL`: both surfaces expose meaningful behavior, but one side is thinner,
  less direct, or lacks current manual/browser evidence.
- `BLOCKED`: the outcome cannot be honestly counted as equivalent without a
  code/product decision.

## Outcome Matrix

| Outcome | Web status | Mobile status | Evidence | Gap | Next |
| --- | --- | --- | --- | --- | --- |
| Plan the day | `PASS` | `PARTIAL` | Web Dashboard loads tasks/events/habits/goals/journal/balance and renders daily hero/focus cards. Mobile Tasks now has `Daily focus` plus direct complete/review actions. | Mobile lacks a full Dashboard equivalent, but the daily next-action outcome is available from Tasks. | Track as polish unless `NEST-223` requires full mobile dashboard parity. |
| Create and manage tasks/lists | `PASS` | `PASS` | Web Planning supports list/task create, update, delete, done toggle, filters, and parent linking. Mobile Tasks supports list/task load, create, edit, complete, delete, search, and status filter. | None found in code audit. | No blocker. |
| Manage habits/routines | `PASS` | `PASS` | Web has separate Habits and Routines CRUD routes. Mobile Habits tab supports habit create/edit/pause/delete/log and routine create/edit/pause/delete. | Web and mobile route grouping differs, but outcome is equivalent. | No blocker. |
| Manage goals/targets | `PASS` | `PASS` | Web Planning and dedicated routes expose goal/target create, edit, delete/archive-style flows. Mobile Goals tab supports goal create/edit/archive and target create/edit/status updates. | Wording differs: web says delete in some places, mobile frames goal/life-area removal as archive. Backend semantics should be checked in final blocker review if release language matters. | `NEST-223` wording/semantics check. |
| Add journal entry and life area | `PASS` | `PASS` | Web Journal supports journal entry create/edit/delete and life area create/edit/delete with assignment. Mobile Journal supports journal entry create/edit/delete and life area create/edit/archive with assignment chips. | Delete/archive wording differs for life areas. | `NEST-223` wording/semantics check. |
| Inspect calendar and sync health | `PASS` | `PARTIAL` | Web Calendar has live event load plus event create/update/delete and sync/status affordances. Mobile Calendar loads conflicts, connections, and integration health, and can resolve conflicts/remediate providers. | Mobile Calendar does not expose real event CRUD; quick actions are rendered by `ModuleScreen` without `onPress`. | Create follow-up from `NEST-223`; likely P0/P1 before founder-ready if mobile calendar event management is required. |
| Connect calendar/provider | `PARTIAL` | `BLOCKED` | Web/mobile integration surfaces can upsert/revoke provider connections. Mobile Calendar uses `manual-token-*` in `connectProvider`. | `manual-token-*` is a local integration harness, not production provider OAuth/auth. | Blocker in `NEST-223`: implement real provider auth, remove from V1 readiness, or explicitly waive. |
| Change language | `PASS` | `PASS` | Web settings persists resolved language via `setStoredUiLanguage`; mobile settings/modal use `useUiLanguage` and `setStoredUiLanguage`; shared localization carries shell/dashboard/mobile settings/calendar keys. | Localization coverage remains partial outside repaired founder-critical strings. | Covered by final readiness review, not parity blocker by itself. |
| Recover from sync/API errors | `PASS` | `PASS` | Web and mobile reuse shared UX error helpers and offline/manual sync retryability metadata; both support queue, force sync, retry sync, pause/resume auto sync, and clear state. | No outcome blocker found; API/security freshness still needs final validation. | `NEST-223` validation freshness check. |
| Reach support/settings essentials | `PASS` | `PASS` | Web Settings exposes profile/preferences/delegated actor controls. Mobile Settings tab and advanced modal expose module shortcuts, language, sync recovery, notifications, and Copilot. | Surface depth differs intentionally. | No blocker. |

## Findings

1. The repaired mobile CRUD parity is materially stronger than the older
   founder-ready checklist: Tasks/Lists, Goals/Targets, Habits/Routines, and
   Journal/Life Areas are no longer placeholder-only flows.
2. The major parity blocker is Calendar/provider readiness. Mobile supports
   integration inspection and recovery, but not true event management; provider
   connect semantics are still a local harness.
3. Localization and error recovery are coherent enough for parity evidence, but
   not enough to close the final readiness gate without `NEST-222` and
   `NEST-223`.

## Definition of Done

- [x] audit output exists
- [x] acceptance criteria are verified
- [x] required validation was run and recorded
- [x] architecture follow-up is captured
- [x] task status is updated in `.codex/context/TASK_BOARD.md`
- [x] `.codex/context/PROJECT_STATE.md` reflects current reality

## Validation Evidence

- Tests:
  not run; docs-only audit.
- Manual checks:
  code inspection of the scoped web/mobile/shared files listed above.
- Screenshots/logs:
  not applicable.
- High-risk checks:
  provider-auth limitation explicitly classified as blocker.
- Coverage ledger updated: not applicable.
## Architecture Evidence

- Architecture source reviewed:
  `docs/planning/v1_readiness_matrix_2026-05-01.md`,
  `docs/planning/v1_remaining_gaps_plan_2026-05-01.md`,
  project AGENTS instructions.
- Fits approved architecture: yes
- Mismatch discovered: yes
- Decision required from user: yes, before provider connections can count as
  production-ready V1 behavior.
- Approval reference if architecture changed:
  not applicable.
- Follow-up architecture doc updates:
  final blocker review should record the provider decision.

## Result Report

- Task summary:
  Completed a no-code parity audit after the repaired V1 slices.
- Files changed:
  `docs/planning/nest_221_web_mobile_parity_audit_2026-05-01.md`,
  plus queue/context docs.
- How tested:
  `git diff --check`.
- What is incomplete:
  mobile Calendar event CRUD and production provider OAuth/provider auth.
- Next steps:
  `NEST-222` accessibility baseline, then `NEST-223` final blocker review.
- Decisions made:
  mobile Calendar `manual-token-*` remains a blocker, not a parity pass.

## Autonomous Loop Evidence

### 1. Analyze Current State

- Issues:
  parity evidence was stale after recent implementation slices.
- Gaps:
  Calendar/provider readiness remained uncertain.
- Inconsistencies:
  mobile Calendar quick actions read like actions but do not carry handlers.
- Architecture constraints:
  no new systems, no workaround-only provider auth, preserve parity truth.

### 2. Select One Priority Task

- Selected task:
  `NEST-221`.
- Priority rationale:
  final readiness cannot proceed without parity evidence.
- Why other candidates were deferred:
  accessibility and final blocker review depend on current parity findings.

### 3. Plan Implementation

- Files or surfaces to modify:
  docs/context only.
- Logic:
  inspect scoped surfaces and record outcome parity.
- Edge cases:
  separate presentation/static affordances from real actionable behavior.

### 4. Execute Implementation

- Implementation notes:
  no runtime code changed.

### 5. Verify and Test

- Validation performed:
  `git diff --check`.
- Result:
  passed, with existing CRLF warnings only.

### 6. Self-Review

- Simpler option considered:
  only marking `NEST-221` as open in the readiness matrix.
- Technical debt introduced: no
- Scalability assessment:
  the outcome matrix can feed future parity audits.
- Refinements made:
  split Calendar inspection from provider connection production semantics.

### 7. Update Documentation and Knowledge

- Docs updated:
  yes.
- Context updated:
  yes.
- Learning journal updated: not applicable.
