# Task

## Header

- ID: NEST-217
- Title: Re-audit web dashboard and planning for repeated daily use
- Task Type: fix
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-216
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

The refreshed `v1` queue has moved from contract integrity into repeated-use
quality. Dashboard and Planning already have canonical visual direction, but
daily use depends on trustworthy live-data readouts as much as composition.

## Goal

Audit the web Dashboard and Planning routes against repeated daily-use quality
and close one narrow user-facing truth gap without widening into another visual
polish pass.

## Scope

- dashboard route:
  `apps/web/src/app/dashboard/page.tsx`
- shared localization:
  `packages/shared-types/src/localization.js`
- planning route audit:
  `apps/web/src/app/tasks/page.tsx`
- planning/context sync:
  `docs/planning/mvp-next-commits.md`
  `docs/planning/v1_execution_backlog_2026-04-26.md`
  `.codex/context/TASK_BOARD.md`
  `.codex/context/PROJECT_STATE.md`

## Success Signal

- User or operator problem:
  repeated dashboard use can lose trust if the hero reports impossible habit
  progress numbers from live data.
- Expected product or reliability outcome:
  dashboard live progress copy reflects data the client actually has, while
  Planning's current daily-use state is recorded with next risks.
- How success will be observed:
  live dashboard hero copy reports completed tasks plus active habits instead
  of deriving a fake habit count from a percent value.
- Post-launch learning needed: no

## Deliverable For This Stage

One narrow dashboard truth fix plus a documented repeated-use audit for
Dashboard and Planning.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web and mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Review Dashboard and Planning canonical direction plus screen-quality rules.
2. Inspect current Dashboard and Planning route behavior for daily-use trust
   gaps.
3. Fix the dashboard hero progress copy so it uses real live counts.
4. Update shared localization wording for the changed live-data meaning.
5. Run relevant web checks and record the audit.
6. Sync task board, project state, and planning queue.

## Acceptance Criteria

- [x] Dashboard hero no longer derives habit count from `progressPercent`
- [x] Live dashboard copy names active habits rather than completed habits
- [x] Planning audit findings are recorded without broad route churn
- [x] Web validations pass or blockers are recorded
- [x] queue/context docs reflect completion evidence

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

Planning showed larger possible future opportunities around route-local API
casts and lower legacy management surfaces, but those are intentionally outside
this small repeated-use fix.

## Validation Evidence

- Tests:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
  `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
  `node .\scripts\unit-contract.mjs` in `apps/web`,
  `pnpm build` in `apps/web`
- Manual checks:
  reviewed Dashboard and Planning against:
  `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`,
  `docs/ux/nest_261_planning_canonical_direction_2026-04-30.md`,
  `docs/ux/screen-quality-checklist.md`,
  `docs/ux/anti-patterns.md`
- Screenshots/logs:
  not captured in this narrow code-truth slice
- High-risk checks:
  confirmed the change only adjusts displayed live-data semantics and
  localization copy; no backend, tenancy, ownership, or API behavior changed
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

## UX/UI Evidence

- Source of truth type: approved_snapshot
- Design source reference:
  `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`,
  `docs/ux/nest_261_planning_canonical_direction_2026-04-30.md`
- Canonical visual target:
  web Dashboard and web Planning repeated-use quality
- Fidelity target: structurally_faithful
- Stitch used: no
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: no
- Existing shared pattern reused:
  shared Dashboard hero and shared localization contract
- New shared pattern introduced: no
- Design-memory update required: no
- Visual gap audit completed: yes
- Remaining mismatches:
  Planning still contains lower legacy management surfaces for dense editing,
  but they remain below the canonical workspace and were not a blocker for this
  slice
- State checks: loading | empty | error | success
- Feedback locality checked: yes
- Raw technical errors hidden from end users: yes
- Responsive checks: desktop | mobile through existing canonical docs
- Input-mode checks: pointer | keyboard by code review
- Accessibility checks:
  automated accessibility pass not run
- Parity evidence:
  no new mobile behavior was introduced; this slice corrected web live-data
  semantics only
- MCP evidence links:
  not applicable

## Result Report

- Task summary:
  re-audited web Dashboard and Planning for repeated daily use and corrected a
  Dashboard hero trust issue in live progress copy.
- Files changed:
  `apps/web/src/app/dashboard/page.tsx`,
  `packages/shared-types/src/localization.js`,
  `.codex/context/TASK_BOARD.md`,
  `.codex/context/PROJECT_STATE.md`,
  `docs/planning/mvp-next-commits.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`,
  `docs/planning/nest_217_web_dashboard_planning_daily_use_audit_2026-05-01.md`
- How tested:
  web typecheck, lint, unit-contract, and production build
- What is incomplete:
  broad Planning cleanup remains deferred to future focused slices
- Next steps:
  execute `NEST-218`
- Decisions made:
  corrected only the data-trust issue and avoided broad visual churn

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues:
  Dashboard live hero copy mixed a percentage value with a count when reporting
  habit progress
- Gaps:
  the route does not currently load habit completion logs, so it should not
  claim completed habits
- Inconsistencies:
  Planning has some lower legacy management panels, but the canonical workspace
  still owns first-pass daily planning
- Architecture constraints:
  client display should remain aligned with existing API data instead of
  inventing derived completion state

### 2. Select One Priority Task
- Selected task:
  `NEST-217`
- Priority rationale:
  it is the next unfinished `v1` queue item and directly follows sync contract
  hardening
- Why other candidates were deferred:
  mobile daily-loop ergonomics starts in `NEST-218`

### 3. Plan Implementation
- Files or surfaces to modify:
  Dashboard live copy, shared localization, queue/context docs
- Logic:
  change the hero to report completed tasks plus active habits using loaded
  route data
- Edge cases:
  sparse accounts still use showcase fallback; live accounts with zero active
  habits now display `0`

### 4. Execute Implementation
- Implementation notes:
  updated the live progress template and hero metric label from completed
  habits to active habits, and replaced the derived habit count with
  `activeHabits.length`

### 5. Verify and Test
- Validation performed:
  web typecheck, lint, unit-contract, and production build
- Result:
  all checks passed

### 6. Self-Review
- Simpler option considered:
  only update the count while keeping completed-habit wording
- Technical debt introduced: no
- Scalability assessment:
  the copy now matches the available data and can later move back to completed
  habit metrics once the route loads habit logs
- Refinements made:
  simplified the active habit metric value to a single count

### 7. Update Documentation and Knowledge
- Docs updated:
  task report, next-commit queue, v1 backlog, task board, and project state
- Context updated:
  yes
- Learning journal updated:
  not applicable
