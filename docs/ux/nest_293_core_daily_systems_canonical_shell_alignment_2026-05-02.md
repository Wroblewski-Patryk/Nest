# Task

## Header

- ID: NEST-293
- Title: Core daily systems canonical shell alignment
- Task Type: design
- Current Stage: release
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-292
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 293
- Operation Mode: BUILDER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context
Dashboard, Planning, Calendar, Journal, and Assistant already use the current
canonical workspace shell and material language. Habits, Routines, and Life
Areas still render as older CRUD-first pages, which creates visible drift in
the V1 web experience. Mobile application implementation remains V2 scope by
the 2026-05-02 user decision.

## Goal
Bring the three remaining core daily-system web routes into the canonical shell
family while preserving their existing API-backed behavior.

## Scope
- `apps/web/src/app/habits/page.tsx`
- `apps/web/src/app/routines/page.tsx`
- `apps/web/src/app/life-areas/page.tsx`
- `apps/web/src/app/globals.css`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- this report and screenshot evidence under `docs/ux_canonical_artifacts/2026-05-02/`

## Success Signal
- User or operator problem: remaining core web routes no longer feel like a
  separate older admin layer.
- Expected product or reliability outcome: Habits, Routines, and Life Areas
  share the current canonical frame, material softness, and first-viewport
  rhythm.
- How success will be observed: desktop screenshot smoke and visual review show
  the canonical shell tone, softer panels, tighter metric rhythm, and unchanged
  forms/lists.
- Post-launch learning needed: no

## Deliverable For This Stage
Release-ready implementation plus verification evidence for the three web
routes.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within web V1 scope; do not resume mobile app work

## Implementation Plan
1. Record current visual evidence for Habits, Routines, Life Areas, and confirm
   Goals is already covered by Planning.
2. Reuse `WorkspaceShell` canonical tone and existing panel/metric primitives.
3. Add route-local classes only where needed to refine material, spacing, and
   responsive rhythm.
4. Preserve all endpoint paths, payloads, auth handling, feedback, and CRUD
   actions.
5. Capture refreshed screenshots and run web validation gates.
6. Update task board and project state, then commit the slice.

## Acceptance Criteria
- Habits, Routines, and Life Areas use `shellTone="dashboard-canonical"`.
- Route panels and metric rows visually inherit the canonical dashboard
  material language without changing API behavior.
- The first desktop viewport no longer reads as an older form-first admin page.
- The Life Areas subtitle no longer carries ASCII-only Polish copy inside an
  otherwise English route.
- Desktop screenshot evidence exists for all three routes.

## Definition of Done
- [x] implementation output exists
- [x] acceptance criteria are verified
- [x] required validations were run and recorded
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
- mobile application work in this V1 web slice

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit` in `apps/web` - PASS
  - `pnpm lint` in `apps/web` - PASS
  - `pnpm build` in `apps/web` - PASS
  - `pnpm test:unit` in `apps/web` - PASS
  - `git diff --check` - PASS
- Manual checks:
  - Playwright desktop screenshot smoke for `/habits`, `/routines`, and
    `/life-areas` confirmed canonical shell, 3 metrics, 3 route panels, and
    correct active rail state.
  - Playwright 390px responsive smoke confirmed no horizontal overflow and
    one-column metric layout on all three routes.
- Screenshots/logs:
  - Current:
    `docs/ux_canonical_artifacts/2026-05-02/nest-habits-web-beauty-preview-current.png`
    `docs/ux_canonical_artifacts/2026-05-02/nest-routines-web-beauty-preview-current.png`
    `docs/ux_canonical_artifacts/2026-05-02/nest-life-areas-web-beauty-preview-current.png`
  - Phase A:
    `docs/ux_canonical_artifacts/2026-05-02/nest-habits-web-beauty-preview-phaseA.png`
    `docs/ux_canonical_artifacts/2026-05-02/nest-routines-web-beauty-preview-phaseA.png`
    `docs/ux_canonical_artifacts/2026-05-02/nest-life-areas-web-beauty-preview-phaseA.png`
- High-risk checks: API endpoint paths, payloads, auth redirects, and
  `getUserSafeErrorMessage` usage were left unchanged.
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: not applicable

## Architecture Evidence

- Architecture source reviewed: `docs/architecture/architecture-source-of-truth.md`,
  `docs/architecture/system-architecture.md`, `docs/architecture/tech-stack.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: not applicable
- Follow-up architecture doc updates: none expected

## UX/UI Evidence

- Source of truth type: approved_snapshot
- Design source reference: existing canonical dashboard, Planning, Calendar,
  Journal, and Assistant implementation patterns
- Canonical visual target: current Nest web canonical workspace shell and
  material language
- Fidelity target: structurally_faithful
- Stitch used: no
- Exception workflow reference: not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused: `WorkspaceShell`, `MetricCard`, `Panel`,
  dashboard canonical shell tone, approved painterly material assets
- New shared pattern introduced: no
- Design-memory entry reused: Workspace Shell Patterns and Finish Propagation
  Rules
- Design-memory update required: no
- Visual gap audit completed: yes
- Background or decorative asset strategy: reuse existing approved dashboard
  material assets only
- Canonical asset extraction required: no
- Screenshot comparison pass completed: yes
- Remaining mismatches: the three routes are structurally faithful to the
  canonical shell/material family, but they do not yet have module-specific
  editorial hero/focus constructs like Dashboard, Planning, Calendar, and
  Journal.
- State checks: loading | empty | error | success are preserved through existing
  route state handling
- Feedback locality checked: pending
- Raw technical errors hidden from end users: yes, existing
  `getUserSafeErrorMessage` handling remains
- Responsive checks: desktop and 390px web smoke
- Input-mode checks: pointer and keyboard-native controls preserved
- Accessibility checks: native form labels and buttons preserved
- Parity evidence: web-first V1 only; mobile app deferred to V2
- MCP evidence links: not applicable

## Product / Discovery Evidence
- Problem validated: yes
- User or operator affected: founder/operator reviewing V1 web experience
- Existing workaround or pain: remaining routes visually fall back to older
  form-first CRUD pages
- Smallest useful slice: align the three related daily-system routes together
- Success metric or signal: screenshot smoke shows one coherent web canonical
  family
- Feature flag, staged rollout, or disable path: not applicable
- Post-launch feedback or metric check: not applicable

## Reliability / Observability Evidence
- `docs/operations/service-reliability-and-observability.md` reviewed: not applicable
- Critical user journey: daily-system route browsing and CRUD setup
- SLI: not applicable
- SLO: not applicable
- Error budget posture: not applicable
- Health/readiness check: not applicable
- Logs, dashboard, or alert route: not applicable
- Smoke command or manual smoke: Playwright desktop screenshot smoke and 390px
  overflow check
- Rollback or disable path: revert this small web-only commit

- `INTEGRATION_CHECKLIST.md` reviewed: not applicable
- Real API/service path used: yes, existing routes remain API-backed
- Endpoint and client contract match: yes, no endpoint changes planned
- DB schema and migrations verified: not applicable
- Loading state verified: yes, existing route load feedback appears after API
  load completes
- Error state verified: existing handler preserved
- Refresh/restart behavior verified: yes, after clearing stale `.next` CSS cache
  and restarting the dev server
- Regression check performed: typecheck, lint, build, unit tests, screenshot
  smoke, responsive smoke, and diff check

## Security / Privacy Evidence
- `docs/security/secure-development-lifecycle.md` reviewed: not applicable
- Data classification: personal productivity data rendered through existing
  authenticated routes
- Trust boundaries: auth/session and tenant-scoped API calls unchanged
- Permission or ownership checks: API-owned and unchanged
- Abuse cases: not applicable for visual shell change
- Secret handling: no secrets touched
- Security tests or scans: not applicable
- Fail-closed behavior: existing unauthorized handler preserved
- Residual risk: low visual-regression risk

## Result Report

- Task summary: Habits, Routines, and Life Areas now inherit the dashboard
  canonical shell tone and route-local canonical material treatment while
  preserving their existing API-backed behavior.
- Files changed:
  - `apps/web/src/app/habits/page.tsx`
  - `apps/web/src/app/routines/page.tsx`
  - `apps/web/src/app/life-areas/page.tsx`
  - `apps/web/src/app/globals.css`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
  - `docs/ux/nest_293_core_daily_systems_canonical_shell_alignment_2026-05-02.md`
  - screenshot evidence under `docs/ux_canonical_artifacts/2026-05-02/`
- How tested: web typecheck, lint, build, unit tests, Playwright desktop
  screenshot smoke, Playwright 390px responsive smoke, and `git diff --check`.
- What is incomplete: module-specific canonical hero/focus experiences for
  these three routes remain a possible later refinement, but the shell/material
  drift targeted by this task is closed.
- Next steps: next iteration should use ARCHITECT mode and select the smallest
  remaining canonical web convergence gap.
- Decisions made: Goals was not changed because `/goals` redirects into the
  already canonical Planning route; mobile application work stays deferred to
  V2.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: Habits, Routines, and Life Areas still use the older default shell
  and form-first page rhythm.
- Gaps: canonical material and shell treatment are not consistently propagated
  to these core routes.
- Inconsistencies: Goals is already covered by the Planning canonical route,
  so it should not be duplicated here.
- Architecture constraints: web-first V1 only; mobile app work is V2.

### 2. Select One Priority Task
- Selected task: NEST-293 Core daily systems canonical shell alignment.
- Priority rationale: these are the remaining core web routes with visible
  old-shell drift after Dashboard, Planning, Calendar, Journal, and Assistant.
- Why other candidates were deferred: mobile work is V2; Goals is already
  represented by Planning canonical.

### 3. Plan Implementation
- Files or surfaces to modify: listed in Scope.
- Logic: preserve existing API CRUD logic and only adjust shell/classes/copy.
- Edge cases: empty data, API errors, unauthorized redirects, disabled form
  states, and responsive layouts must continue to work.

### 4. Execute Implementation
- Implementation notes:
  - Added `shellTone="dashboard-canonical"`, fixed utility labels, and hidden
    rail footer actions to Habits, Routines, and Life Areas.
  - Wrapped route content in `daily-system-shell`, added daily-system panel
    classes, and reused approved dashboard material assets through CSS.
  - Corrected the Life Areas subtitle from ASCII-only Polish copy to the
    English baseline used by the rest of the route.

### 5. Verify and Test
- Validation performed: web typecheck, lint, build, unit tests, Playwright
  desktop screenshot smoke, Playwright 390px responsive smoke, and
  `git diff --check`.
- Result: PASS.

### 6. Self-Review
- Simpler option considered: just changing `shellTone`; rejected as too shallow
  because the metric/form/list rhythm would still read as older admin chrome.
- Technical debt introduced: no
- Scalability assessment: route-local visual classes can later be shared if
  these three surfaces converge into a reusable daily-systems pattern.
- Refinements made: added a responsive metric/list safety rule after desktop
  smoke so the web layer remains clean below tablet widths.

### 7. Update Documentation and Knowledge
- Docs updated: this report and screenshot evidence.
- Context updated: `.codex/context/TASK_BOARD.md` and
  `.codex/context/PROJECT_STATE.md`.
- Learning journal updated: not applicable.
