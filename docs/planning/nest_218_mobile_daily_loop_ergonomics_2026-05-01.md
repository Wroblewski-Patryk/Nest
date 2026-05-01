# Task

## Header

- ID: NEST-218
- Title: Re-audit mobile daily-loop ergonomics
- Task Type: fix
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-217
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

`NEST-217` closed the web daily-use audit. The remaining founder-ready plan
identifies mobile daily-loop ergonomics as the next trust and reachability
gap: mobile core screens are API-backed, but the main Tasks tab still opens
straight into creation and management controls.

## Goal

Make the mobile daily-loop audit explicit and close one narrow repeated-use
issue by promoting the next useful task above administrative creation flows.

## Scope

- mobile Tasks route:
  `apps/mobile/app/(tabs)/index.tsx`
- planning/context sync:
  `docs/planning/mvp-next-commits.md`
  `docs/planning/v1_execution_backlog_2026-04-26.md`
  `.codex/context/TASK_BOARD.md`
  `.codex/context/PROJECT_STATE.md`
  `docs/planning/v1_remaining_gaps_plan_2026-05-01.md`

## Success Signal

- User or operator problem:
  the mobile Tasks tab asks the founder to manage objects before it answers
  what to do next.
- Expected product or reliability outcome:
  the first live mobile Tasks action supports the daily loop while CRUD remains
  available below.
- How success will be observed:
  a real open task is promoted in a `Daily focus` band above list/task creation
  controls, with direct complete/review actions.
- Post-launch learning needed: yes

## Deliverable For This Stage

One narrow mobile Tasks ergonomics fix plus validation and repo-truth updates.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web and mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Reuse the existing mobile Tasks API-backed state and actions.
2. Derive a daily focus task from open tasks, preferring in-progress and high
   priority work.
3. Render a compact `Daily focus` panel above creation/filter panels.
4. Keep existing create/edit/delete/list flows unchanged below.
5. Run mobile typecheck, unit contract, and Expo web export.
6. Update queue/context docs.

## Acceptance Criteria

- [x] mobile Tasks shows a daily-use focus band before creation controls
- [x] focus band uses real loaded tasks, not placeholder data
- [x] user can mark the focus task done or open edit/review from the band
- [x] existing mobile Tasks CRUD remains available below
- [x] mobile validations pass or blockers are recorded

## Definition of Done

- [x] implementation or documentation output exists
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

This slice intentionally fixes the mobile Tasks daily-loop entry first. Habits,
Goals, Journal, Calendar, and Settings remain part of the broader mobile audit
and readiness sequence.

## Validation Evidence

- Tests:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
  `pnpm test:unit` in `apps/mobile`,
  `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`
- Manual checks:
  reviewed the mobile Tasks route flow and confirmed `Daily focus` appears
  above create/filter/list administration while existing CRUD remains below
- Screenshots/logs:
  not captured in this slice
- High-risk checks:
  confirmed the band uses existing loaded task state and existing complete/edit
  actions instead of new data paths
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
- Follow-up architecture doc updates:
  none required

## Result Report

- Task summary:
  promoted the mobile Tasks tab from CRUD-first to daily-loop-first by adding
  a real-data `Daily focus` band above creation and filter controls.
- Files changed:
  `apps/mobile/app/(tabs)/index.tsx`,
  `.codex/context/TASK_BOARD.md`,
  `.codex/context/PROJECT_STATE.md`,
  `docs/planning/mvp-next-commits.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`,
  `docs/planning/v1_remaining_gaps_plan_2026-05-01.md`,
  `docs/planning/nest_218_mobile_daily_loop_ergonomics_2026-05-01.md`
- How tested:
  mobile typecheck, unit contract, and Expo web export
- What is incomplete:
  Settings/support IA remains the next planned mobile recovery slice
- Next steps:
  execute `NEST-219`
- Decisions made:
  fixed only the Tasks daily-use entry and left broader mobile screen redesign
  out of scope

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues:
  mobile Tasks opened directly into list and task creation controls
- Gaps:
  the first mobile Tasks action did not answer what to do next
- Inconsistencies:
  web Planning/Dashboard already had dominant next-action surfaces, while
  mobile Tasks still felt admin-first
- Architecture constraints:
  use existing API-backed state and actions

### 2. Select One Priority Task
- Selected task:
  `NEST-218`
- Priority rationale:
  it is the next unfinished item in the active `v1` queue
- Why other candidates were deferred:
  Settings/support IA depends on knowing what remains after mobile daily-loop
  triage

### 3. Plan Implementation
- Files or surfaces to modify:
  mobile Tasks route plus queue/context docs
- Logic:
  derive a daily focus task from existing task state, preferring in-progress,
  urgent/high, then first open task
- Edge cases:
  no open task shows a starter prompt instead of fake content

### 4. Execute Implementation
- Implementation notes:
  added a `Daily focus` band with complete/review actions above existing CRUD
  panels

### 5. Verify and Test
- Validation performed:
  mobile typecheck, unit contract, Expo web export
- Result:
  all checks passed

### 6. Self-Review
- Simpler option considered:
  only renaming the hero copy
- Technical debt introduced: no
- Scalability assessment:
  the pattern can be reused in later mobile daily-loop surfaces if needed
- Refinements made:
  kept CRUD unchanged below the focus band to preserve existing behavior

### 7. Update Documentation and Knowledge
- Docs updated:
  task report, remaining gaps plan, next-commit queue, v1 backlog, task board,
  and project state
- Context updated:
  yes
- Learning journal updated:
  not applicable
