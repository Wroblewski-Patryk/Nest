# Task

## Header

- ID: NEST-238
- Title: Mobile route request cast cleanup
- Task Type: refactor
- Current Stage: implementation
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-237
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 238
- Operation Mode: BUILDER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

Core mobile screens still define identical route-local request wrappers around
`nestApiClient.request`. Web already moved this pattern into the existing API
client module under `NEST-233`; mobile should follow the same architecture
shape for shared API contract consistency.

## Goal

Replace repeated mobile route-local request casts with one typed helper exported
from the existing mobile API client module.

## Scope

- `apps/mobile/constants/apiClient.ts`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/goals.tsx`
- `apps/mobile/app/(tabs)/habits.tsx`
- `apps/mobile/app/(tabs)/journal.tsx`
- Planning/context docs

## Success Signal
- User or operator problem: mobile core routes should not carry duplicated API
  request typing.
- Expected product or reliability outcome: same runtime behavior with less type
  drift across core mobile screens.
- How success will be observed: mobile typecheck/export pass and static
  inspection finds no route-local request casts in mobile tabs.
- Post-launch learning needed: no

## Deliverable For This Stage

Implement the helper cleanup, verify mobile, update docs/context, and commit.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Export `ApiRequestInit` and `apiRequest` from the existing mobile API client
   module.
2. Update mobile Tasks, Goals, Habits, and Journal routes to import the shared
   helper.
3. Remove duplicated local helper types/functions from those routes.
4. Run mobile typecheck, mobile web export, and static inspection.
5. Update task board and project state.
6. Commit the validated slice.

## Acceptance Criteria

- Mobile core routes no longer define repeated `nestApiClient.request as unknown
  as` helpers.
- The shared helper lives in the existing mobile API client module.
- `pnpm exec tsc --noEmit` and `pnpm exec expo export --platform web` pass in
  `apps/mobile`.
- No API, auth, data, or route behavior changes.

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

- Tests: `pnpm exec tsc --noEmit` and
  `pnpm exec expo export --platform web` in `apps/mobile`.
- Manual checks: static inspection found no remaining route-local
  `nestApiClient.request as unknown as` or local `ApiRequestInit` definitions
  in `apps/mobile/app/**/*.tsx`.
- Screenshots/logs: not applicable
- High-risk checks: no API/data behavior changed
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: not applicable

## Architecture Evidence

- Architecture source reviewed: `docs/architecture/system-architecture.md`,
  `docs/architecture/v1_v2_delivery_split.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: not applicable
- Follow-up architecture doc updates: none expected

## UX/UI Evidence

Not applicable for request helper refactor.

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

This does not solve token sourcing or mobile authenticated API session evidence;
`NEST-231` remains blocked.

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
- Refresh/restart behavior verified: unchanged
- Regression check performed: mobile typecheck, mobile Expo web export, static
  inspection, and `git diff --check`

## Product / Discovery Evidence
- Problem validated: yes
- User or operator affected: maintainers of core mobile routes
- Existing workaround or pain: repeated local casts around the same client
  method
- Smallest useful slice: mobile route helper consolidation
- Success metric or signal: validations and static inspection pass
- Feature flag, staged rollout, or disable path: revert commit
- Post-launch feedback or metric check: not applicable

## Reliability / Observability Evidence
- `docs/operations/service-reliability-and-observability.md` reviewed: not applicable
- Critical user journey: mobile core route API calls
- SLI: not applicable
- SLO: not applicable
- Error budget posture: not applicable
- Health/readiness check: not applicable
- Logs, dashboard, or alert route: not applicable
- Smoke command or manual smoke: typecheck/export/static inspection
- Rollback or disable path: revert commit

## AI Testing Evidence

Not applicable.

## Security / Privacy Evidence
- `docs/security/secure-development-lifecycle.md` reviewed: not applicable
- Data classification: unchanged core entity data
- Trust boundaries: unchanged mobile client to API boundary
- Permission or ownership checks: unchanged backend enforcement
- Abuse cases: not applicable for request helper typing
- Secret handling: no secrets touched
- Security tests or scans: not applicable
- Fail-closed behavior: unchanged
- Residual risk: low

## Result Report

- Task summary: exported a shared typed `apiRequest` helper from the existing
  mobile API client and removed duplicated route-local request casts from core
  mobile routes.
- Files changed: `apps/mobile/constants/apiClient.ts`,
  `apps/mobile/app/(tabs)/index.tsx`, `goals.tsx`, `habits.tsx`,
  `journal.tsx`, planning/context docs.
- How tested: mobile typecheck, mobile Expo web export, static inspection, and
  `git diff --check`.
- What is incomplete: `NEST-231` mobile token sourcing remains blocked by
  decision.
- Next steps: continue mobile per-screen localization/view convergence or
  resolve `NEST-231`.
- Decisions made: reuse the existing mobile API client module rather than
  adding a new request utility namespace.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: repeated mobile route-local request casts.
- Gaps: mobile lacks the typed helper pattern already used on web.
- Inconsistencies: equivalent request wrappers live in Tasks, Goals, Habits,
  and Journal.
- Architecture constraints: preserve existing mobile API client and do not
  invent token sourcing while `NEST-231` is blocked.

### 2. Select One Priority Task
- Selected task: `NEST-238` mobile route request cast cleanup.
- Priority rationale: improves mobile core API contract consistency without
  requiring the blocked auth decision.
- Why other candidates were deferred: full mobile auth remains blocked by
  `NEST-231`; broad UI copy cleanup should continue screen by screen.

### 3. Plan Implementation
- Files or surfaces to modify: mobile API client module and four mobile core
  routes.
- Logic: export shared typed helper and remove local wrappers.
- Edge cases: keep all endpoint paths and payloads unchanged.

### 4. Execute Implementation
- Implementation notes: added `ApiRequestInit` and `apiRequest` to
  `apps/mobile/constants/apiClient.ts` and updated Tasks, Goals, Habits, and
  Journal routes to import it.

### 5. Verify and Test
- Validation performed: mobile typecheck, mobile Expo web export, static
  inspection, and `git diff --check`.
- Result: passed.

### 6. Self-Review
- Simpler option considered: leave local casts; rejected because this is
  duplicated shared-client contract code.
- Technical debt introduced: no
- Scalability assessment: centralizing this helper matches the web client
  cleanup and reduces future route drift.
- Refinements made: none required after validation.

### 7. Update Documentation and Knowledge
- Docs updated: task report.
- Context updated: `.codex/context/TASK_BOARD.md` and
  `.codex/context/PROJECT_STATE.md`.
- Learning journal updated: not applicable.
