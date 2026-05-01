# Task

## Header

- ID: NEST-233
- Title: Web route request cast cleanup
- Task Type: refactor
- Current Stage: implementation
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-232
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 233
- Operation Mode: BUILDER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

`NEST-231` remains blocked by a required architecture/product decision for
mobile authentication. The next unblocked item in `mvp-next-commits.md` is a
route-local cast cleanup and lower-route copy pass. Web routes currently repeat
the same `nestApiClient.request as unknown as ...` helper, which creates
needless route-local type drift without changing runtime behavior.

## Goal

Replace repeated web route-local request casts with one typed wrapper exported
from the existing web API client module.

## Scope

- `apps/web/src/lib/api-client.ts`
- Web route files that define the duplicated `apiRequest` helper
- Planning/context docs required by the task board

## Success Signal
- User or operator problem: lower maintenance risk in route-level API calls.
- Expected product or reliability outcome: same runtime behavior with less type
  drift and fewer route-local casts.
- How success will be observed: typecheck passes and duplicated casts are gone
  from the targeted web routes.
- Post-launch learning needed: no

## Deliverable For This Stage

Implement the helper cleanup, verify with web typecheck, update planning state,
and commit the slice.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Export `ApiRequestInit` and typed `apiRequest` from the existing web
   `api-client` module.
2. Update web routes that currently define identical local request wrappers to
   import the shared helper instead.
3. Leave route-specific response types, auth handling, and UX copy unchanged.
4. Run web typecheck and static inspection for removed route-local casts.
5. Update task board, project state, and next-commits.
6. Commit the validated slice.

## Acceptance Criteria

- Web routes no longer define repeated `nestApiClient.request as unknown as`
  helpers.
- The shared helper lives in the existing web API client module.
- `pnpm exec tsc --noEmit` passes in `apps/web`.
- No runtime API endpoint, auth, tenancy, or localization behavior changes.

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

- Tests: `pnpm exec tsc --noEmit` in `apps/web` passed.
- Manual checks: static inspection found no remaining
  `nestApiClient.request as unknown as` or local `ApiRequestInit` definitions in
  `apps/web/src/app/**/*.tsx`.
- Screenshots/logs: not applicable
- High-risk checks: no auth or API contract behavior is intentionally changed
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
- Design source reference: not applicable
- Canonical visual target: not applicable
- Fidelity target: not applicable
- Stitch used: no
- Experience-quality bar reviewed: not applicable
- Visual-direction brief reviewed: not applicable
- Existing shared pattern reused: existing web API client module
- New shared pattern introduced: no
- Design-memory update required: no
- State checks: not applicable
- Feedback locality checked: not applicable
- Raw technical errors hidden from end users: not applicable
- Responsive checks: not applicable
- Input-mode checks: not applicable
- Accessibility checks: not applicable
- Parity evidence: no parity behavior changed
- MCP evidence links: not applicable

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

Keep this to web route request typing only. Mobile authenticated API session
work remains blocked under `NEST-231`.

## Production-Grade Required Contract

Included through Goal, Scope, Implementation Plan, Acceptance Criteria,
Definition of Done, and Result Report sections.

## Integration Evidence

- `INTEGRATION_CHECKLIST.md` reviewed: not applicable
- Real API/service path used: unchanged
- Endpoint and client contract match: unchanged
- DB schema and migrations verified: not applicable
- Loading state verified: not applicable
- Error state verified: not applicable
- Refresh/restart behavior verified: not applicable
- Regression check performed: web typecheck and static inspection

## Product / Discovery Evidence
- Problem validated: yes
- User or operator affected: future maintainers and route owners
- Existing workaround or pain: repeated local casts around the same client
  method
- Smallest useful slice: web route helper consolidation
- Success metric or signal: typecheck and static inspection pass
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
- Data classification: unchanged authenticated user data paths
- Trust boundaries: unchanged web client to API boundary
- Permission or ownership checks: unchanged backend enforcement
- Abuse cases: not applicable for typed helper refactor
- Secret handling: no secrets touched
- Security tests or scans: not applicable
- Fail-closed behavior: unchanged
- Residual risk: low, type-only wrapper cleanup

## Result Report

- Task summary: exported one typed `apiRequest` wrapper from the existing web
  API client and replaced duplicated route-local request casts.
- Files changed: `apps/web/src/lib/api-client.ts`, web route files under
  `apps/web/src/app`, `.codex/context/TASK_BOARD.md`,
  `.codex/context/PROJECT_STATE.md`, and `docs/planning/mvp-next-commits.md`.
- How tested: `pnpm exec tsc --noEmit` in `apps/web`; static inspection for the
  removed cast pattern.
- What is incomplete: mobile authenticated API session path remains blocked by
  `NEST-231`.
- Next steps: continue with lower-route localization copy cleanup or resolve
  `NEST-231` when the user chooses an option.
- Decisions made: use the existing web API client module instead of adding a new
  request utility namespace.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: repeated route-local `nestApiClient.request` casts in web routes.
- Gaps: helper typing is not centralized in the existing web API client module.
- Inconsistencies: equivalent local wrappers appear in multiple route files.
- Architecture constraints: preserve the existing shared API client and auth
  session model.

### 2. Select One Priority Task
- Selected task: `NEST-233` web route request cast cleanup.
- Priority rationale: `NEST-231` is blocked; this is the next unblocked cleanup
  from `mvp-next-commits.md`.
- Why other candidates were deferred: mobile auth needs user decision; provider
  OAuth is outside the V1 claim.

### 3. Plan Implementation
- Files or surfaces to modify: web API client module and route files with the
  duplicated helper.
- Logic: export one typed request function and replace local wrappers.
- Edge cases: avoid changing auth token sourcing, body/query shape, endpoint
  paths, or user-facing copy.

### 4. Execute Implementation
- Implementation notes: added exported `ApiRequestInit` and `apiRequest` to the
  existing web API client module; updated auth, calendar, habits, journal,
  life-areas, routines, settings, and tasks routes to import it.

### 5. Verify and Test
- Validation performed: `pnpm exec tsc --noEmit` in `apps/web`; static
  inspection for removed route-local casts.
- Result: passed.

### 6. Self-Review
- Simpler option considered: leaving casts in place; rejected because this is
  already the documented cleanup target.
- Technical debt introduced: no
- Scalability assessment: centralizing the helper makes future route additions
  cheaper while preserving the existing generated/shared client contract.
- Refinements made: included `/auth` because it used the same route-local cast
  pattern.

### 7. Update Documentation and Knowledge
- Docs updated: task report and `docs/planning/mvp-next-commits.md`.
- Context updated: `.codex/context/TASK_BOARD.md` and
  `.codex/context/PROJECT_STATE.md`.
- Learning journal updated: not applicable.
