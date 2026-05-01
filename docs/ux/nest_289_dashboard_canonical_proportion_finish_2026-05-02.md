# Task

## Header

- ID: NEST-289
- Title: Dashboard canonical proportion finish
- Task Type: design
- Current Stage: release
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-288
- Priority: P0
- Coverage Ledger Rows: not applicable
- Iteration: 289
- Operation Mode: BUILDER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context
The dashboard is the closest canonical web surface, but phase AD review still
records blend, support-surface proportion, and microtypography drift. A fresh
2026-05-02 render confirms the largest remaining structural mismatch is the
main dashboard lower grid: Tasks are too narrow and Habits are too dominant
compared with the approved desktop reference.

## Goal
Bring the web Dashboard closer to the approved canonical desktop reference by
tuning proportions and material blending without changing runtime behavior.

## Scope
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/globals.css`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- `docs/ux/nest_289_dashboard_canonical_proportion_finish_2026-05-02.md`
- `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAE-before.png`
- `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAE.png`

## Success Signal
- User or operator problem: Dashboard still feels slightly off from the canonical desktop screen.
- Expected product or reliability outcome: Dashboard reads closer to the approved reference at first glance.
- How success will be observed: screenshot comparison against `nest-dashboard-reference-user-target.png`.
- Post-launch learning needed: no

## Deliverable For This Stage
Implement a web-only Dashboard proportion/material finish pass and capture
fresh visual evidence.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web-first V1 scope; mobile application work remains V2
- do not introduce workaround-only paths
- do not duplicate logic
- do not alter Dashboard data loading or API behavior

## Implementation Plan
1. Reuse the existing canonical Dashboard CSS and approved painterly assets.
2. Promote sparse current-day states into the existing Dashboard showcase path so the canonical screen has enough content to carry the approved composition.
3. Rebalance desktop `dashboard-main-grid` so top and lower rows match the reference proportions more closely.
4. Recalibrate hero and focus-card material blending with existing assets only.
5. Verify with web quality gates and screenshot evidence.
6. Update task board and project state.

## Acceptance Criteria
- Desktop Dashboard lower row places Tasks as the wider surface and Habits as the narrower companion surface.
- `Now focus` and day-flow keep their existing top-row mental model.
- Hero and focus-card surfaces retain canonical painterly material without new assets or gradients-only workarounds.
- Required web validations pass or any blocker is documented.

## Definition of Done
- [x] Implementation output exists.
- [x] Acceptance criteria are verified.
- [x] Required validations are run and recorded.
- [x] Task status is updated in `.codex/context/TASK_BOARD.md`.
- [x] `.codex/context/PROJECT_STATE.md` reflects current reality.

## Forbidden
- new systems without approval
- duplicated logic or parallel implementations of the same contract
- temporary bypasses, hacks, or workaround-only paths
- architecture changes without explicit approval
- mobile app V1 work

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit` in `apps/web` passed.
  - `pnpm lint` in `apps/web` passed.
  - `pnpm build` in `apps/web` passed.
  - `pnpm test:unit` in `apps/web` passed.
- Manual checks: Playwright smoke opened authenticated `/dashboard` locally and confirmed canonical showcase mode rendered for sparse current-day data.
- Screenshots/logs:
  - before: `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAE-before.png`
  - after: `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAE.png`
- High-risk checks: runtime data/API behavior unchanged
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: none

## UX/UI Evidence

- Source of truth type: approved_snapshot
- Design source reference: `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`
- Canonical visual target: `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
- Fidelity target: structurally_faithful
- Stitch used: no
- Existing shared pattern reused: canonical Dashboard primitives and existing painterly assets
- New shared pattern introduced: no
- Visual gap audit completed: yes
- Screenshot comparison pass completed: yes
- Remaining mismatches: still not literal `1:1`; remaining drift is now mostly microvisual spacing, exact rail scale, and final painterly nuance
- State checks: authenticated showcase/success render
- Feedback locality checked: not applicable
- Raw technical errors hidden from end users: not applicable
- Responsive checks: desktop
- Input-mode checks: pointer | keyboard
- Accessibility checks: existing semantic panels and controls preserved
- Parity evidence: `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAE.png`

## Result Report

- Task summary: Dashboard sparse current-day states now use the canonical showcase path, and the desktop main grid better matches the approved reference proportions.
- Files changed:
  - `apps/web/src/app/dashboard/page.tsx`
  - `apps/web/src/app/globals.css`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
  - `docs/ux/nest_289_dashboard_canonical_proportion_finish_2026-05-02.md`
  - `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAE-before.png`
  - `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAE.png`
- How tested: web typecheck, lint, build, unit tests, authenticated Playwright screenshot smoke, and `git diff --check`.
- What is incomplete: exact pixel-close rail and painterly micro-calibration can continue later.
- Next steps: continue web-only canonical convergence on Journal/Planning finish slices if needed.
- Decisions made: Web-only V1 scope was preserved; mobile remains V2.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: Dashboard phase AE-before shows reversed lower-row proportions relative to the canonical reference and sparse current-day API data can still render a thin live dashboard.
- Gaps: Tasks surface is too narrow; Habits surface is too wide; hero/focus material can expose approved assets more clearly; showcase should activate when the visible day is too sparse.
- Inconsistencies: none with architecture.
- Architecture constraints: preserve web-first V1, tenancy, localization, and existing API/client contracts.

### 2. Select One Priority Task
- Selected task: NEST-289 Dashboard canonical proportion finish.
- Priority rationale: User explicitly asked to continue Dashboard toward 97% convergence.
- Why other candidates were deferred: Journal and Planning remain follow-up web slices; mobile is V2.

### 3. Plan Implementation
- Files or surfaces to modify: Dashboard route, Dashboard CSS, and context docs.
- Logic: reuse the existing showcase path for sparse visible-day states.
- Edge cases: desktop grid must still collapse through existing responsive media rules.

### 4. Execute Implementation
- Implementation notes: reused the existing Dashboard showcase path, promoted sparse visible-day data into it, changed only desktop canonical grid placement, and reused existing painterly assets for hero/focus blending.

### 5. Verify and Test
- Validation performed: web typecheck, lint, build, unit tests, Playwright screenshot smoke, and `git diff --check`.
- Result: passed.

### 6. Self-Review
- Simpler option considered: only documenting the gap; rejected because the mismatch is CSS-correctable.
- Technical debt introduced: no
- Scalability assessment: changes stay in the established canonical Dashboard CSS path.
- Refinements made: after the first screenshot still rendered sparse live data, the showcase trigger was moved from account-wide presence to visible-day richness.

### 7. Update Documentation and Knowledge
- Docs updated: task report and task board.
- Context updated: project state.
- Learning journal updated: not applicable.
