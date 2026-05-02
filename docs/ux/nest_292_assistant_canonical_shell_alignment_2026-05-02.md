# NEST-292 Assistant Canonical Shell Alignment (2026-05-02)

## Header

- ID: NEST-292
- Title: Assistant canonical shell alignment
- Task Type: design
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-213
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 292
- Operation Mode: BUILDER

## Process Self-Audit

- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

The user asked to keep working until canonical web views reach roughly 97%
convergence. Dashboard, Planning, Calendar, and Journal have fresh web
convergence commits. Assistant is an optional surface, but prior canonical shell
work explicitly made it a first-class room inside the Nest workspace. The
current screenshot shows Assistant still using the older default shell tone,
which makes it feel less cohesive than the current canonical module family.

## Goal

Align the existing web Assistant route with the current canonical workspace
shell and material language without changing AI Copilot API behavior.

## Scope

- `apps/web/src/app/assistant/page.tsx`
- `apps/web/src/app/globals.css`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- `docs/ux/nest_292_assistant_canonical_shell_alignment_2026-05-02.md`
- `docs/ux_canonical_artifacts/2026-05-02/nest-assistant-web-parity-preview-current.png`
- `docs/ux_canonical_artifacts/2026-05-02/nest-assistant-web-parity-preview-phaseI.png`

## Success Signal

- User or operator problem: Assistant should feel like a Nest room in the same
  canonical workspace, not a leftover optional surface.
- Expected product or reliability outcome: Assistant visual shell matches the
  current canonical module family while preserving Copilot behavior.
- How success will be observed: screenshot comparison against prior Assistant
  phase H evidence and current canonical module shell.
- Post-launch learning needed: no

## Deliverable For This Stage

Implement the smallest web-only Assistant shell/material alignment slice and
capture validation evidence.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it
- do not change AI provider/API behavior in this visual slice

## Implementation Plan

1. Move Assistant onto the current canonical workspace shell tone.
2. Reuse existing approved dashboard material assets for Assistant room
   surfaces where useful.
3. Keep the existing Copilot card and support rail semantics intact.
4. Capture a fresh Playwright screenshot and compare against prior Assistant
   evidence plus current canonical shell rhythm.
5. Run web validations and update task/project state.

## Acceptance Criteria

- Assistant renders inside the canonical dashboard shell tone.
- Assistant remains active as an optional surface in the rail.
- AI Copilot request and response behavior is unchanged.
- Assistant panels use existing material language rather than new visual
  systems.
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
- AI API or provider contract changes

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit` in `apps/web`: passed
  - `pnpm lint` in `apps/web`: passed
  - `pnpm build` in `apps/web`: passed
  - `pnpm test:unit` in `apps/web`: passed
- Manual checks:
  - Playwright Chromium screenshot smoke against `http://127.0.0.1:9002/assistant`:
    passed
- Screenshots/logs:
  - Before/current:
    `docs/ux_canonical_artifacts/2026-05-02/nest-assistant-web-parity-preview-current.png`
  - After:
    `docs/ux_canonical_artifacts/2026-05-02/nest-assistant-web-parity-preview-phaseI.png`
- High-risk checks: AI Copilot code path unchanged
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: not applicable

## Architecture Evidence

- Architecture source reviewed:
  - `docs/architecture/architecture-source-of-truth.md`
  - `docs/planning/nest_213_shell_truth_and_assistant_surface_implementation_2026-04-26.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: not applicable
- Follow-up architecture doc updates: none planned

## UX/UI Evidence

- Source of truth type: approved_snapshot
- Design source reference:
  `docs/planning/nest_213_shell_truth_and_assistant_surface_implementation_2026-04-26.md`
- Canonical visual target:
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseH.png`
- Fidelity target: structurally_faithful
- Stitch used: no
- Exception workflow reference: not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused: WorkspaceShell, Panel, AiCopilotCard,
  approved dashboard material assets
- New shared pattern introduced: no
- Design-memory entry reused: Assistant room and canonical dashboard material
  family
- Design-memory update required: no
- Visual gap audit completed: yes
- Background or decorative asset strategy: reuse approved dashboard assets
- Canonical asset extraction required: no
- Screenshot comparison pass completed: yes
- Remaining mismatches: Assistant is an optional surface and does not have a
  newer 2026-04-30 standalone canonical image like the core four modules, so
  this pass aligns it to its phase H evidence and the current canonical shell
  family rather than claiming a new independent pixel-close target.
- State checks: idle/success route
- Feedback locality checked: yes
- Raw technical errors hidden from end users: not applicable
- Responsive checks: desktop
- Input-mode checks: pointer, keyboard
- Accessibility checks: no semantic downgrade planned
- Parity evidence: web-only optional surface; mobile app deferred to V2
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

- Task summary: aligned Assistant to the current canonical workspace shell,
  reused approved dashboard material assets for Assistant panels, and softened
  panel headings so the optional surface reads as part of the current canonical
  family.
- Files changed:
  - `apps/web/src/app/assistant/page.tsx`
  - `apps/web/src/app/globals.css`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
  - `docs/ux/nest_292_assistant_canonical_shell_alignment_2026-05-02.md`
  - Assistant screenshot evidence under `docs/ux_canonical_artifacts/2026-05-02/`
- How tested: web typecheck, lint, build, unit tests, Playwright screenshot
  smoke, visual comparison, and `git diff --check`.
- What is incomplete: no mobile app work by V1 scope decision; no AI API
  behavior changes by task scope.
- Next steps: remaining admin/lower surfaces can be audited separately, but
  they do not currently have the same approved canonical visual target as the
  core module set.
- Decisions made: align Assistant to the current canonical shell family rather
  than inventing a new Assistant-specific visual system.

## Autonomous Loop Evidence

### 1. Analyze Current State

- Issues: Assistant uses older default shell tone and material rhythm.
- Gaps: route is first-class but visually behind the current canonical module
  family.
- Inconsistencies: current core modules use the dashboard canonical shell.
- Architecture constraints: keep AI API and route behavior unchanged.

### 2. Select One Priority Task

- Selected task: NEST-292 Assistant canonical shell alignment.
- Priority rationale: after core canonical views, Assistant is the remaining
  first-class room with visible shell drift.
- Why other candidates were deferred: lower admin surfaces do not have
  approved canonical references in the same way.

### 3. Plan Implementation

- Files or surfaces to modify: Assistant route, global Assistant styles,
  docs/context, screenshot evidence.
- Logic: visual shell and material only.
- Edge cases: Copilot idle/loading/success/error behavior must remain intact.

### 4. Execute Implementation

- Implementation notes: enabled `shellTone="dashboard-canonical"` for
  Assistant, fixed route utility labels, hid legacy rail footer actions, and
  reused approved dashboard material assets for Assistant panels.

### 5. Verify and Test

- Validation performed: web typecheck, lint, build, unit tests, Playwright
  screenshot smoke, visual comparison, and `git diff --check`.
- Result: passed.

### 6. Self-Review

- Simpler option considered: shell tone only.
- Technical debt introduced: no
- Scalability assessment: changes remain scoped to existing Assistant route and
  shared shell/panel styling.
- Refinements made: adjusted Assistant panel headings after screenshot audit
  showed uppercase chrome remained from the older shell.

### 7. Update Documentation and Knowledge

- Docs updated: this report and task board.
- Context updated: project state.
- Learning journal updated: not applicable
