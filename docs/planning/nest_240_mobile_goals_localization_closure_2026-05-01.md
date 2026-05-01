# Task

## Header

- ID: NEST-240
- Title: Mobile Goals localization closure
- Task Type: refactor
- Current Stage: release
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-239
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 240
- Operation Mode: TESTER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context
Mobile Goals/Targets is a core V1 API-backed planning screen. It still has
English-only user-facing copy while Calendar, Settings, and Tasks now use the
shared EN/PL localization baseline.

## Goal
Move mobile Goals/Targets user-facing copy onto shared EN/PL localization while
preserving real API behavior, request payloads, auth shape, tenant boundaries,
and archive/update semantics.

## Scope
- `apps/mobile/app/(tabs)/goals.tsx`
- `packages/shared-types/src/localization.js`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- this task report

## Implementation Plan
1. Add shared EN/PL `mobile.goals.*` keys.
2. Wire `goals.tsx` to existing `useUiLanguage` and `translate`.
3. Replace screen chrome, feedback, validation, alerts, status labels, actions,
   metrics, placeholders, and empty states.
4. Preserve API calls, payloads, pagination, filtering, and error handling.
5. Run mobile typecheck, unit contract, Expo web export, static inspection, and
   `git diff --check`.
6. Update context docs and commit the verified slice.

## Acceptance Criteria
- Goals/Targets route uses shared localization for visible non-data copy.
- EN and PL dictionaries contain matching `mobile.goals.*` keys.
- API behavior and data contracts are unchanged.
- Mobile validations pass.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done
- [x] `DEFINITION_OF_DONE.md` applicable items are satisfied with evidence.
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
- implicit stage skipping

## Validation Evidence
- Tests:
  - `pnpm exec tsc --noEmit` in `apps/mobile` - PASS
  - `pnpm test:unit` in `apps/mobile` - PASS
  - `pnpm exec expo export --platform web` in `apps/mobile` - PASS
- Manual checks:
  - Static inspection confirmed `apps/mobile/app/(tabs)/goals.tsx` imports
    `translate`, uses `useUiLanguage`, and routes Goals/Targets copy through
    `mobile.goals.*` keys.
  - Static dictionary inspection confirmed matching EN/PL `mobile.goals.*`
    entries in `packages/shared-types/src/localization.js`.
  - `git diff --check` - PASS
- High-risk checks: preserve API/auth/tenant behavior by limiting changes to localization and labels

## Result Report
- Task summary: Mobile Goals/Targets now uses the shared EN/PL localization baseline for core user-facing copy.
- Files changed:
  - `apps/mobile/app/(tabs)/goals.tsx`
  - `packages/shared-types/src/localization.js`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
  - `docs/planning/nest_240_mobile_goals_localization_closure_2026-05-01.md`
- How tested: mobile typecheck, mobile unit contract, mobile Expo web export, static localization inspection, and `git diff --check`.
- What is incomplete: `NEST-231` remains blocked pending explicit user decision on the mobile authenticated API session path.
- Next steps: Continue unblocked V1 convergence with Habits/Routines or Journal/Life Areas localization closure, or resolve `NEST-231` after user decision.
- Decisions made: Reused the existing mobile `useUiLanguage` and shared `translate` mechanism; no route-local localization system was introduced.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: Mobile Goals/Targets contains English-only route copy.
- Gaps: No shared `mobile.goals.*` dictionary namespace.
- Inconsistencies: Core mobile localization parity is still uneven.
- Architecture constraints: API-backed goal/target flow and tenant boundaries must remain unchanged.

### 2. Select One Priority Task
- Selected task: NEST-240 Mobile Goals localization closure.
- Priority rationale: Core V1 screen; unblocked by `NEST-231`.
- Why other candidates were deferred: Habits and Journal are similar follow-up slices; `NEST-231` still needs user decision.

### 3. Plan Implementation
- Files or surfaces to modify: listed in Scope.
- Logic: shared dictionary keys plus route translation helper.
- Edge cases: dynamic counts, status labels, archive confirmation, target progress metadata, due-date label.

### 4. Execute Implementation
- Implementation notes:
  - Added EN/PL `mobile.goals.*` dictionary keys.
  - Updated mobile Goals/Targets to localize loading, feedback, validation,
    archive alerts, metrics, status labels, actions, placeholders, due-date
    metadata, and empty states.
  - Preserved endpoint paths, payloads, pagination, auth shape, and tenant
    ownership behavior.

### 5. Verify and Test
- Validation performed:
  - `pnpm exec tsc --noEmit` in `apps/mobile`
  - `pnpm test:unit` in `apps/mobile`
  - `pnpm exec expo export --platform web` in `apps/mobile`
  - static localization inspection
  - `git diff --check`
- Result: PASS

### 6. Self-Review
- Simpler option considered: only translating top-level chrome; rejected
  because validation and archive controls are part of the real daily flow.
- Technical debt introduced: no
- Scalability assessment: The namespace mirrors the existing mobile Tasks and
  Calendar localization pattern.
- Refinements made: Localized dynamic metric strings and due-date metadata
  through replacement-based dictionary keys.

### 7. Update Documentation and Knowledge
- Docs updated: this task report, `.codex/context/TASK_BOARD.md`, `.codex/context/PROJECT_STATE.md`
- Context updated: yes
- Learning journal updated: not applicable
