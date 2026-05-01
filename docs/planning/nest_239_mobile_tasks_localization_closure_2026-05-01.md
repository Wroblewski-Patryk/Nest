# Task

## Header

- ID: NEST-239
- Title: Mobile Tasks localization closure
- Task Type: refactor
- Current Stage: release
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-238
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 239
- Operation Mode: BUILDER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context
Mobile Tasks/Lists is a core V1 screen and already uses the real API-backed
task/list flow. After the shared mobile request helper cleanup, its remaining
V1 convergence gap is user-facing hardcoded English copy across loading,
feedback, validation, filters, action labels, and task/list controls.

## Goal
Move the mobile Tasks/Lists screen onto the shared EN/PL localization baseline
without changing endpoint paths, payloads, auth behavior, tenancy boundaries,
or task/list CRUD semantics.

## Scope
- `apps/mobile/app/(tabs)/index.tsx`
- `packages/shared-types/src/localization.js`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- this task report

## Success Signal
- User or operator problem: Polish-language mobile users should not hit English-only core Tasks/Lists copy.
- Expected product or reliability outcome: Mobile Tasks/Lists follows the same shared localization contract as Calendar and Settings.
- How success will be observed: mobile typecheck/export pass and static inspection shows Tasks/Lists uses `translate`/`useUiLanguage` keys for user-facing copy.
- Post-launch learning needed: no

## Deliverable For This Stage
Implementation, validation evidence, and updated repository context for the
selected single-screen localization closure.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan
1. Add shared `mobile.tasks.*` localization keys in English and Polish.
2. Import `translate` and `useUiLanguage` in the mobile Tasks route.
3. Replace hardcoded user-facing Tasks/Lists copy with shared localized labels.
4. Preserve API requests, request payloads, pagination, filtering behavior, and CRUD handlers.
5. Run mobile typecheck, mobile Expo web export, static localization inspection, and `git diff --check`.
6. Update task board and project state, then commit the verified slice.

## Acceptance Criteria
- Mobile Tasks/Lists uses shared localization for loading, feedback, validation, alerts, filters, status/priority labels, primary actions, and empty states.
- English and Polish dictionaries contain matching keys for the new mobile Tasks namespace.
- No API endpoint, auth, tenant, persistence, pagination, or CRUD behavior changes.
- Relevant mobile validation passes.

## Definition of Done
- [x] `DEFINITION_OF_DONE.md` applicable items are satisfied with evidence.
- [x] Implementation output exists.
- [x] Acceptance criteria are verified.
- [x] Required validations are run and recorded.
- [x] Task status is updated in `.codex/context/TASK_BOARD.md`.
- [x] `.codex/context/PROJECT_STATE.md` reflects current reality.

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

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit` in `apps/mobile` - PASS
  - `pnpm test:unit` in `apps/mobile` - PASS
  - `pnpm exec expo export --platform web` in `apps/mobile` - PASS
- Manual checks:
  - Static inspection confirmed `apps/mobile/app/(tabs)/index.tsx` imports
    `translate`, uses `useUiLanguage`, and routes Tasks/Lists user-facing copy
    through `mobile.tasks.*` keys.
  - Static dictionary inspection confirmed matching EN/PL `mobile.tasks.*`
    entries in `packages/shared-types/src/localization.js`.
  - `git diff --check` - PASS
- Screenshots/logs: not applicable
- High-risk checks: preserve API/auth/tenant behavior by limiting changes to localization and labels
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: not applicable

## Architecture Evidence

- Architecture source reviewed: `docs/architecture/architecture-source-of-truth.md`, `docs/architecture/system-architecture.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: not applicable
- Follow-up architecture doc updates: none expected

## UX/UI Evidence

- Source of truth type: approved_snapshot
- Design source reference: existing mobile Tasks/Lists implementation and shared localization contract
- Canonical visual target: no visual redesign in scope
- Fidelity target: structurally_faithful
- Stitch used: no
- Exception workflow reference: not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: not applicable
- Existing shared pattern reused: shared mobile `useUiLanguage` + `translate`
- New shared pattern introduced: no
- Design-memory entry reused: not applicable
- Design-memory update required: no
- Visual gap audit completed: no visual change
- Background or decorative asset strategy: unchanged
- Canonical asset extraction required: no
- Screenshot comparison pass completed: not applicable
- Remaining mismatches: mobile authenticated API session path remains blocked under `NEST-231`
- State checks: loading | empty | error | success
- Feedback locality checked: yes
- Raw technical errors hidden from end users: yes
- Responsive checks: mobile
- Input-mode checks: touch
- Accessibility checks: labels unchanged unless copy label needed
- Parity evidence: shared EN/PL copy baseline for core mobile Tasks/Lists
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

## Integration Evidence

## Product / Discovery Evidence
- Problem validated: yes
- User or operator affected: mobile users using Polish UI language
- Existing workaround or pain: core task/list screen still had English-only chrome despite shared localization support
- Smallest useful slice: one core mobile screen and shared dictionary keys
- Success metric or signal: static localized-copy inspection and mobile validation pass
- Feature flag, staged rollout, or disable path: not applicable
- Post-launch feedback or metric check: not applicable

## Reliability / Observability Evidence
- `docs/operations/service-reliability-and-observability.md` reviewed: not applicable
- Critical user journey: mobile task/list daily loop
- SLI: not applicable
- SLO: not applicable
- Error budget posture: not applicable
- Health/readiness check: mobile typecheck/export
- Logs, dashboard, or alert route: not applicable
- Smoke command or manual smoke: static localization inspection
- Rollback or disable path: revert this commit

- `INTEGRATION_CHECKLIST.md` reviewed: yes
- Real API/service path used: unchanged
- Endpoint and client contract match: yes
- DB schema and migrations verified: not applicable
- Loading state verified: yes, localized copy path
- Error state verified: yes, existing safe error helper preserved
- Refresh/restart behavior verified: unchanged
- Regression check performed: mobile typecheck, mobile unit contract, mobile Expo web export, static localization inspection, and `git diff --check`

## AI Testing Evidence

Not applicable; this task does not alter AI behavior.

## Security / Privacy Evidence
- `docs/security/secure-development-lifecycle.md` reviewed: not applicable
- Data classification: private task/list metadata, no new access path
- Trust boundaries: unchanged
- Permission or ownership checks: unchanged API-enforced boundaries
- Abuse cases: not applicable to localization-only client copy change
- Secret handling: no secrets touched
- Security tests or scans: not applicable
- Fail-closed behavior: unchanged
- Residual risk: `NEST-231` remains the mobile authenticated session blocker

- `AI_TESTING_PROTOCOL.md` reviewed: not applicable
- Memory consistency scenarios: not applicable
- Multi-step context scenarios: not applicable
- Adversarial or role-break scenarios: not applicable
- Prompt injection checks: not applicable
- Data leakage and unauthorized access checks: not applicable
- Result: not applicable

## Result Report

- Task summary: Mobile Tasks/Lists now uses the shared EN/PL localization baseline for core user-facing copy.
- Files changed:
  - `apps/mobile/app/(tabs)/index.tsx`
  - `packages/shared-types/src/localization.js`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
  - `docs/planning/nest_239_mobile_tasks_localization_closure_2026-05-01.md`
- How tested: mobile typecheck, mobile unit contract, mobile Expo web export, static localization inspection, and `git diff --check`.
- What is incomplete: `NEST-231` remains blocked pending explicit user decision on the mobile authenticated API session path.
- Next steps: Continue unblocked V1 convergence or resolve `NEST-231` once the user chooses the approved mobile session option.
- Decisions made: Reused the existing mobile `useUiLanguage` plus shared `translate` mechanism; no new localization system was introduced.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: Mobile Tasks/Lists still contains hardcoded English copy.
- Gaps: Shared EN/PL dictionary has Calendar and Settings mobile coverage but no Tasks namespace.
- Inconsistencies: Core mobile localization baseline is uneven across screens.
- Architecture constraints: preserve real API-backed CRUD, tenant boundaries, and shared localization mechanism.

### 2. Select One Priority Task
- Selected task: NEST-239 Mobile Tasks localization closure.
- Priority rationale: Core V1 mobile surface; unblocked by the `NEST-231` auth decision.
- Why other candidates were deferred: `NEST-231` requires explicit product/architecture decision before implementation.

### 3. Plan Implementation
- Files or surfaces to modify: listed in Scope.
- Logic: dictionary keys plus route-level translation helper usage.
- Edge cases: dynamic counts, status/priority enum labels, alert button labels, fallback copy.

### 4. Execute Implementation
- Implementation notes:
  - Added EN/PL `mobile.tasks.*` dictionary keys.
  - Updated mobile Tasks/Lists to localize loading, feedback, validation,
    alerts, metrics, filters, status/priority labels, action labels, and empty
    states through the shared dictionary.
  - Preserved endpoint paths, payloads, pagination, filtering, auth shape, and
    tenant-owned API behavior.

### 5. Verify and Test
- Validation performed:
  - `pnpm exec tsc --noEmit` in `apps/mobile`
  - `pnpm test:unit` in `apps/mobile`
  - `pnpm exec expo export --platform web` in `apps/mobile`
  - static localization inspection
  - `git diff --check`
- Result: PASS

### 6. Self-Review
- Simpler option considered: leaving fallback copy only in the route; rejected
  because it would not satisfy EN/PL localization parity.
- Technical debt introduced: no
- Scalability assessment: The namespace mirrors the existing Calendar mobile
  localization pattern and can be extended without another route-local copy pass.
- Refinements made: Added a localized fallback for missing list names and kept
  dynamic count strings in shared dictionary keys.

### 7. Update Documentation and Knowledge
- Docs updated: this task report, `.codex/context/TASK_BOARD.md`, `.codex/context/PROJECT_STATE.md`
- Context updated: yes
- Learning journal updated: not applicable
