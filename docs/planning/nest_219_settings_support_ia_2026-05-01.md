# Task

## Header

- ID: NEST-219
- Title: Tighten settings and support IA for founder-critical actions only
- Task Type: fix
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-218
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

`NEST-218` improved the mobile daily-loop entry. The next remaining gap is
support IA: mobile Settings reaches important recovery tools, but the advanced
modal mixes language, sync, notifications, telemetry, and Copilot in one long
utility flow.

## Goal

Make founder-critical support actions easier to scan by grouping advanced
mobile settings by user job, without adding new settings systems.

## Scope

- mobile advanced settings:
  `apps/mobile/app/modal.tsx`
- planning/context sync:
  `docs/planning/mvp-next-commits.md`
  `docs/planning/v1_execution_backlog_2026-04-26.md`
  `.codex/context/TASK_BOARD.md`
  `.codex/context/PROJECT_STATE.md`
  `docs/planning/v1_remaining_gaps_plan_2026-05-01.md`

## Success Signal

- User or operator problem:
  urgent recovery controls are reachable but hard to scan in one long modal.
- Expected product or reliability outcome:
  founder-critical controls are grouped into language, sync recovery,
  notifications, and Copilot/support jobs.
- How success will be observed:
  the modal opens with a support map and each major settings area is framed as
  a distinct support section.
- Post-launch learning needed: no

## Deliverable For This Stage

Mobile support IA framing plus explicit provider-token classification.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web and mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Add a top support map to the mobile advanced settings modal.
2. Frame language, sync, notifications, notification matrix/telemetry, and
   Copilot as separate support sections.
3. Keep existing actions and API flows unchanged.
4. Classify mobile Calendar `manual-token-*` provider setup in the task report.
5. Run mobile validations and update repo truth.

## Acceptance Criteria

- [x] mobile advanced settings opens with job-based support map
- [x] language, sync, notifications, and Copilot are visually grouped
- [x] existing settings actions still use their current handlers
- [x] `manual-token-*` provider connect behavior is classified in evidence
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

This slice does not implement OAuth or provider connection replacement. It only
classifies the current manual token path for readiness planning.

## Validation Evidence

- Tests:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
  `pnpm test:unit` in `apps/mobile`,
  `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`
- Manual checks:
  inspected mobile advanced settings to confirm the support map appears before
  language, sync, notification, telemetry, and Copilot controls
- Screenshots/logs:
  not captured in this slice
- High-risk checks:
  no handlers, endpoint usage, token storage, or sync behavior changed
- Coverage ledger updated: not applicable
- Coverage rows closed or changed:
  not applicable

## Architecture Evidence

- Architecture source reviewed:
  `docs/architecture/system-architecture.md`,
  `docs/architecture/architecture-source-of-truth.md`
- Fits approved architecture: yes for IA framing
- Mismatch discovered: yes for provider connection production semantics
- Decision required from user: yes before counting provider OAuth as
  production-ready
- Follow-up architecture doc updates:
  none in this slice

## Provider Connection Classification

Mobile Calendar's `manual-token-*` connection path in
`apps/mobile/app/(tabs)/calendar.tsx` is classified as a local integration
harness. It is useful for exercising connection and health UI locally, but it
must not be treated as production-ready OAuth or a real provider authorization
flow in `NEST-220`, `NEST-221`, or `NEST-223`.

## Result Report

- Task summary:
  tightened mobile advanced settings IA by adding a support map and section
  framing for founder-critical recovery jobs.
- Files changed:
  `apps/mobile/app/modal.tsx`,
  `.codex/context/TASK_BOARD.md`,
  `.codex/context/PROJECT_STATE.md`,
  `docs/planning/mvp-next-commits.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`,
  `docs/planning/v1_remaining_gaps_plan_2026-05-01.md`,
  `docs/planning/nest_219_settings_support_ia_2026-05-01.md`
- How tested:
  mobile typecheck, unit contract, and Expo web export
- What is incomplete:
  real provider OAuth remains outside this IA slice and should be classified in
  the readiness matrix
- Next steps:
  execute `NEST-220`
- Decisions made:
  classify `manual-token-*` as local harness only

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues:
  mobile advanced settings mixed critical recovery controls in one long flow
- Gaps:
  provider connection token behavior lacked readiness classification
- Inconsistencies:
  settings route summarized sync/language, but the advanced modal did not lead
  with job-based navigation
- Architecture constraints:
  do not introduce provider OAuth or new settings systems in this slice

### 2. Select One Priority Task
- Selected task:
  `NEST-219`
- Priority rationale:
  it is the next unfinished `v1` queue item after mobile daily-loop repair
- Why other candidates were deferred:
  readiness matrix depends on this support IA classification

### 3. Plan Implementation
- Files or surfaces to modify:
  mobile advanced settings modal and queue/context docs
- Logic:
  add support map and section framing while preserving existing handlers
- Edge cases:
  existing sync and notification states remain unchanged

### 4. Execute Implementation
- Implementation notes:
  added a `Support Map` with four recovery jobs and stronger title framing

### 5. Verify and Test
- Validation performed:
  mobile typecheck, unit contract, Expo web export
- Result:
  all checks passed

### 6. Self-Review
- Simpler option considered:
  report-only classification without UI change
- Technical debt introduced: no
- Scalability assessment:
  support map can later be localized or deep-linked without changing current
  behavior
- Refinements made:
  kept all runtime actions on existing handlers

### 7. Update Documentation and Knowledge
- Docs updated:
  task report, remaining gaps plan, next-commit queue, v1 backlog, task board,
  and project state
- Context updated:
  yes
- Learning journal updated:
  not applicable
