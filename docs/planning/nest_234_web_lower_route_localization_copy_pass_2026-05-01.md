# Task

## Header

- ID: NEST-234
- Title: Web lower-route localization copy pass
- Task Type: refactor
- Current Stage: implementation
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-233
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 234
- Operation Mode: ARCHITECT

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

`NEST-233` completed the route-local request cast cleanup. The remaining
unblocked `NEXT` item is a lower-route localization copy pass. The web
Automations, Billing, and Insights routes still keep user-facing status,
action, and panel copy directly in route components instead of the shared
localization dictionary used by the shell and core routes.

## Goal

Move the key user-facing copy for web Automations, Billing, and Insights into
the existing shared localization dictionary with English and Polish baselines.

## Scope

- `packages/shared-types/src/localization.js`
- `apps/web/src/app/automations/page.tsx`
- `apps/web/src/app/billing/page.tsx`
- `apps/web/src/app/insights/page.tsx`
- Planning/context docs

## Success Signal
- User or operator problem: lower routes should not regress the `en`/`pl`
  localization baseline.
- Expected product or reliability outcome: route chrome, status details, empty
  states, and primary actions use shared localized copy.
- How success will be observed: web typecheck passes and targeted static
  inspection confirms the routes import/use `translate`.
- Post-launch learning needed: no

## Deliverable For This Stage

Implement the copy localization pass, verify with web typecheck/static
inspection, update docs/context, and commit the slice.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Add English and Polish dictionary keys for Automations, Billing, and
   Insights route chrome, status messages, panel labels, actions, and empty
   states.
2. Import `translate` in each targeted route and use a route-local `t` helper.
3. Keep dynamic API values, endpoint paths, payloads, analytics calls, and
   formatting behavior unchanged.
4. Run web typecheck and targeted static inspection.
5. Update task board, project state, and next-commits.
6. Commit the validated slice.

## Acceptance Criteria

- Automations, Billing, and Insights routes use shared localization for the
  targeted user-facing copy.
- English and Polish keys exist in `packages/shared-types/src/localization.js`.
- `pnpm exec tsc --noEmit` passes in `apps/web`.
- No API, auth, tenancy, or data-shape behavior changes.

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

## Validation Evidence

- Tests: `pnpm exec tsc --noEmit` and `pnpm lint` in `apps/web` passed.
- Manual checks: targeted static inspection confirmed Automations, Billing, and
  Insights routes import/use shared `translate` keys; dictionary contains EN/PL
  route keys.
- Screenshots/logs: not applicable
- High-risk checks: no API/data behavior changed
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: not applicable

## Architecture Evidence

- Architecture source reviewed: `docs/architecture/README.md`,
  `docs/architecture/system-architecture.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: not applicable
- Follow-up architecture doc updates: none expected

## UX/UI Evidence

- Source of truth type: not applicable
- Existing shared pattern reused: shared `translate` dictionary
- New shared pattern introduced: no
- Design-memory update required: no
- State checks: loading | empty | error | success
- Feedback locality checked: yes
- Raw technical errors hidden from end users: existing `describeApiIssue`
  behavior retained
- Responsive checks: not applicable
- Input-mode checks: not applicable
- Accessibility checks: no structural changes
- Parity evidence: localization baseline preserved with `en` and `pl` keys

## Review Checklist
- [x] Process self-audit completed before implementation.
- [x] Autonomous loop evidence covers all seven steps.
- [x] Exactly one priority task was selected in this iteration.
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

## Notes

This is an ARCHITECT iteration because iteration 234 is divisible by 3. The
scope is intentionally copy/localization architecture only.

## Production-Grade Required Contract

Included through Goal, Scope, Implementation Plan, Acceptance Criteria,
Definition of Done, and Result Report sections.

## Integration Evidence

- `INTEGRATION_CHECKLIST.md` reviewed: not applicable
- Real API/service path used: unchanged
- Endpoint and client contract match: unchanged
- DB schema and migrations verified: not applicable
- Loading state verified: static copy path
- Error state verified: static copy path
- Refresh/restart behavior verified: unchanged
- Regression check performed: web typecheck and lint

## Product / Discovery Evidence
- Problem validated: yes
- User or operator affected: English and Polish users of lower web routes
- Existing workaround or pain: route-local copy bypassed shared localization
- Smallest useful slice: Automations, Billing, and Insights routes
- Success metric or signal: typecheck and key/static inspection pass
- Feature flag, staged rollout, or disable path: not applicable
- Post-launch feedback or metric check: not applicable

## Reliability / Observability Evidence
- `docs/operations/service-reliability-and-observability.md` reviewed: not applicable
- Critical user journey: unchanged
- SLI: not applicable
- SLO: not applicable
- Error budget posture: not applicable
- Health/readiness check: not applicable
- Logs, dashboard, or alert route: not applicable
- Smoke command or manual smoke: typecheck
- Rollback or disable path: revert commit

## AI Testing Evidence

Not applicable.

## Security / Privacy Evidence
- `docs/security/secure-development-lifecycle.md` reviewed: not applicable
- Data classification: unchanged
- Trust boundaries: unchanged web client to API boundary
- Permission or ownership checks: unchanged backend enforcement
- Abuse cases: not applicable for localization copy
- Secret handling: no secrets touched
- Security tests or scans: not applicable
- Fail-closed behavior: unchanged
- Residual risk: low

## Result Report

- Task summary: moved key Automations, Billing, and Insights route copy into
  the shared EN/PL localization dictionary and wired the routes through
  `translate`.
- Files changed: `packages/shared-types/src/localization.js`,
  `apps/web/src/app/automations/page.tsx`,
  `apps/web/src/app/billing/page.tsx`,
  `apps/web/src/app/insights/page.tsx`,
  `apps/web/src/app/routines/page.tsx`, planning/context docs.
- How tested: `pnpm exec tsc --noEmit`; `pnpm lint`; static key usage
  inspection.
- What is incomplete: broader lower-route copy can continue later, but the
  documented unblocked NEXT pass is complete for the selected slice.
- Next steps: resolve `NEST-231` mobile authenticated API session decision.
- Decisions made: keep API payloads and dynamic enum/status values unchanged;
  localize route chrome, status copy, empty states, and user-facing panel/action
  labels.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: lower web routes keep route chrome and status copy hardcoded.
- Gaps: shared localization dictionary lacks Automations, Billing, and Insights
  route keys.
- Inconsistencies: core shell/auth/dashboard copy uses shared localization while
  these lower routes do not.
- Architecture constraints: use existing `translate` dictionary, preserve
  current API/client contracts.

### 2. Select One Priority Task
- Selected task: `NEST-234` web lower-route localization copy pass.
- Priority rationale: it is the remaining unblocked `NEXT` task after
  `NEST-233`.
- Why other candidates were deferred: `NEST-231` still requires user decision.

### 3. Plan Implementation
- Files or surfaces to modify: shared localization dictionary and three web
  lower routes.
- Logic: replace static strings with `t(key, fallback)` calls.
- Edge cases: avoid localizing dynamic enum/API values in a way that changes
  filtering or payload behavior.

### 4. Execute Implementation
- Implementation notes: added EN/PL keys for Automations, Billing, and Insights
  and replaced targeted route-local strings with `t(key, fallback)` calls.

### 5. Verify and Test
- Validation performed: `pnpm exec tsc --noEmit`, `pnpm lint`, and static key
  inspection.
- Result: passed.

### 6. Self-Review
- Simpler option considered: only adding English fallbacks in components; that
  would not close the `en`/`pl` baseline.
- Technical debt introduced: no
- Scalability assessment: using the shared dictionary keeps lower-route copy in
  the same localization mechanism as shell/auth/dashboard.
- Refinements made: removed a stale `nestApiClient` import from routines that
  lint surfaced after the previous request-helper refactor.

### 7. Update Documentation and Knowledge
- Docs updated: task report and `docs/planning/mvp-next-commits.md`.
- Context updated: `.codex/context/TASK_BOARD.md` and
  `.codex/context/PROJECT_STATE.md`.
- Learning journal updated: not applicable.
