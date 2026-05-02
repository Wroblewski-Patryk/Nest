# NEST-291 Planning Canonical Rail And Tail Finish (2026-05-02)

## Header

- ID: NEST-291
- Title: Planning canonical rail and tail finish
- Task Type: design
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-261
- Priority: P0
- Coverage Ledger Rows: not applicable
- Iteration: 291
- Operation Mode: ARCHITECT

## Process Self-Audit

- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

The user asked to continue until the web canonical views converge to the
approved references. Planning already has the core canonical structure, but the
fresh web screenshot shows two high-signal drifts from the approved desktop
reference: the workspace rail labels the active route as `Tasks` instead of
`Planning`, and the showcase first viewport carries an extra operational tail
below the canonical ladder.

## Goal

Tighten the web Planning showcase so it reads as the approved integrated
Planning module rather than a Tasks route with a canonical wrapper.

## Scope

- `apps/web/src/app/tasks/page.tsx`
- `apps/web/src/components/workspace-shell.tsx`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- `docs/ux/nest_291_planning_canonical_rail_tail_finish_2026-05-02.md`
- `docs/ux_canonical_artifacts/2026-05-02/nest-planning-web-parity-preview-current.png`
- `docs/ux_canonical_artifacts/2026-05-02/nest-planning-web-parity-preview-phaseN.png`

## Success Signal

- User or operator problem: Planning should not read as a lower-level Tasks
  surface when reviewing the canonical V1 web view.
- Expected product or reliability outcome: the first viewport matches the
  approved Planning mental model more closely while preserving runtime CRUD
  behavior.
- How success will be observed: screenshot comparison against
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-canonical-reference.png`.
- Post-launch learning needed: no

## Deliverable For This Stage

Implement the smallest web-only Planning fidelity slice and capture validation
evidence.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior; do not work on the
  mobile app in V1
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Make the workspace rail label the core Tasks route as `Planning` while
   preserving the underlying module key and optional Planning subnav behavior.
2. Add an explicit Planning showcase class to the existing route.
3. Suppress the noncanonical deep operational tail in showcase mode only.
4. Capture a fresh Playwright screenshot and compare it with the approved
   Planning desktop reference.
5. Run web validations and update task/project state.

## Acceptance Criteria

- Core rail shows `Planning` as the active module for the canonical route.
- Tasks, Lists, Goals, and Targets remain accessible through the existing
  Planning route and controls.
- Showcase first viewport ends with the Planning ladder rhythm instead of an
  extra `Execution signals` block.
- Existing API-backed task/list/goal/target behavior is not changed.
- Fresh screenshot evidence and web validation commands are recorded.

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
- mobile application implementation in this V1 slice

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit` in `apps/web`: passed
  - `pnpm lint` in `apps/web`: passed
  - `pnpm build` in `apps/web`: passed
  - `pnpm test:unit` in `apps/web`: passed
- Manual checks:
  - Playwright Chromium screenshot smoke against `http://127.0.0.1:9002/tasks`:
    passed
- Screenshots/logs:
  - Before/current:
    `docs/ux_canonical_artifacts/2026-05-02/nest-planning-web-parity-preview-current.png`
  - After:
    `docs/ux_canonical_artifacts/2026-05-02/nest-planning-web-parity-preview-phaseN.png`
- High-risk checks: not applicable; no auth/API contract changes planned
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: not applicable

## Architecture Evidence

- Architecture source reviewed:
  - `docs/architecture/architecture-source-of-truth.md`
  - `docs/ux/nest_261_planning_canonical_direction_2026-04-30.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: not applicable
- Follow-up architecture doc updates: none planned

## UX/UI Evidence

- Source of truth type: approved_snapshot
- Design source reference:
  `docs/ux/nest_261_planning_canonical_direction_2026-04-30.md`
- Canonical visual target:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-canonical-reference.png`
- Fidelity target: structurally_faithful
- Stitch used: no
- Exception workflow reference: not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused: WorkspaceShell, DashboardHeroBand,
  DashboardFocusCard, Panel, existing Planning canonical components
- New shared pattern introduced: no
- Design-memory entry reused: canonical dashboard material family
- Design-memory update required: no
- Visual gap audit completed: yes
- Background or decorative asset strategy: unchanged
- Canonical asset extraction required: no
- Screenshot comparison pass completed: yes
- Remaining mismatches: Planning still runs on the `/tasks` route for backward
  compatibility, but visible shell language now presents the integrated module
  as `Planning`.
- State checks: success/showcase
- Feedback locality checked: yes
- Raw technical errors hidden from end users: not applicable
- Responsive checks: desktop
- Input-mode checks: pointer, keyboard
- Accessibility checks: no control semantics planned for removal
- Parity evidence: web-only V1; mobile app deferred to V2
- MCP evidence links: not applicable

## Review Checklist

- [x] Process self-audit completed before implementation.
- [x] Autonomous loop evidence covers all seven steps.
- [x] Exactly one priority task was completed in this iteration.
- [x] Operation mode was selected according to iteration rotation.
- [x] Current stage is declared and respected.
- [x] Deliverable for the current stage is complete.
- [x] Architecture alignment confirmed.
- [x] Existing systems were reused where applicable.
- [x] No workaround paths were introduced.
- [x] No logic duplication was introduced.
- [x] Definition of Done evidence is attached.
- [x] Relevant validations were run.
- [x] Docs or context were updated if repository truth changed.
- [x] Learning journal was updated if a recurring pitfall was confirmed.

## Result Report

- Task summary: tightened the web Planning canonical showcase by labeling the
  shared rail item as `Planning`, adding an explicit showcase class, and
  suppressing noncanonical showcase-only operational tail/tools so the first
  viewport resolves on the Planning ladder.
- Files changed:
  - `apps/web/src/app/tasks/page.tsx`
  - `apps/web/src/app/globals.css`
  - `apps/web/src/components/workspace-shell.tsx`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
  - `docs/ux/nest_291_planning_canonical_rail_tail_finish_2026-05-02.md`
  - Planning screenshot evidence under `docs/ux_canonical_artifacts/2026-05-02/`
- How tested: web typecheck, lint, build, unit tests, Playwright screenshot
  smoke, visual comparison, and `git diff --check`.
- What is incomplete: no mobile app work by V1 scope decision; route remains
  `/tasks` for compatibility while visible module language is Planning.
- Next steps: continue web canonical convergence only if another core route
  shows visible drift.
- Decisions made: keep existing route/API contracts and adjust presentation
  only.

## Autonomous Loop Evidence

### 1. Analyze Current State

- Issues: active rail label says `Tasks`; showcase first viewport includes an
  extra operational `Execution signals` block below the canonical ladder.
- Gaps: Planning route lacks an explicit showcase class hook.
- Inconsistencies: canonical reference treats Planning as the module name and
  ends the first viewport with the ladder support model.
- Architecture constraints: keep the route and API contracts unchanged.

### 2. Select One Priority Task

- Selected task: NEST-291 Planning canonical rail and tail finish.
- Priority rationale: Planning is a core V1 canonical web view and visible rail
  naming drift weakens the approved mental model.
- Why other candidates were deferred: Dashboard, Calendar, and Journal have
  fresh convergence commits; mobile work remains V2.

### 3. Plan Implementation

- Files or surfaces to modify: Planning route, workspace shell nav label,
  docs/context, screenshot evidence.
- Logic: presentation and showcase gating only; no API payload changes.
- Edge cases: non-showcase Planning still keeps the deeper operational panel.

### 4. Execute Implementation

- Implementation notes: changed the rail label source for the core Planning
  item, added `is-showcase` to the Planning canonical shell, hid showcase-only
  board tools/summary, and skipped the deep operational panel in showcase mode.

### 5. Verify and Test

- Validation performed: web typecheck, lint, build, unit tests, Playwright
  screenshot smoke, visual comparison, and `git diff --check`.
- Result: passed.

### 6. Self-Review

- Simpler option considered: only changing nav copy, but the visible
  first-viewport tail would remain out of spec.
- Technical debt introduced: no
- Scalability assessment: changes preserve the existing route and component
  contracts while making showcase behavior explicit.
- Refinements made: also hid showcase board summary/tools after visual review
  showed the ladder sitting too low.

### 7. Update Documentation and Knowledge

- Docs updated: this report and task board.
- Context updated: project state.
- Learning journal updated: not applicable
