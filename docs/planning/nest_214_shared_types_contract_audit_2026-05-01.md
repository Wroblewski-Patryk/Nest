# Task

## Header

- ID: NEST-214
- Title: Audit shared-types exports against backend responses for core CRUD flows
- Task Type: refactor
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-213
- Priority: P1
- Coverage Ledger Rows:
- Iteration: 1
- Operation Mode: BUILDER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context
`v1` execution wave C starts with cross-surface contract integrity. After the
localization closure tasks, the next blocker was no longer copy drift but
contract drift: `@nest/shared-types` exposed only a partial CRUD client and
under-modeled several backend response shapes, while web and mobile core flows
fell back to route-local `apiRequest(...)` wrappers plus duplicated local item
types.

## Goal
Produce one evidence-backed contract audit for founder-critical CRUD modules and
close the highest-confidence drift inside `@nest/shared-types` without changing
backend behavior or architecture.

## Success Signal
- User or operator problem:
  web and mobile planning/mobile CRUD screens must cast the generic request
  method and re-declare backend item shapes because shared exports are
  incomplete.
- Expected product or reliability outcome:
  clients can rely on a more truthful shared contract for core CRUD modules,
  reducing accidental frontend drift before `NEST-215`.
- How success will be observed:
  `@nest/shared-types` exports CRUD methods and richer item/payload types that
  match current Laravel controller responses, and both clients still compile.
- Post-launch learning needed: no

## Deliverable For This Stage
A verified task report plus the completed shared contract hardening in
`packages/shared-types`.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done
- [x] core CRUD backend response shapes were inspected against shared exports
- [x] `@nest/shared-types` now exposes the audited CRUD methods and richer
  payload/item types for the covered modules
- [x] web and mobile validation evidence is recorded with repo truth updates

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
  `node ./scripts/unit-contract.mjs` in `apps/web`,
  `node ./scripts/unit-contract.mjs` in `apps/mobile`
- Manual checks:
  code inspection across Laravel controllers and `@nest/shared-types` exports
- Screenshots/logs:
  not applicable
- High-risk checks:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
  `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
  `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`
- Coverage ledger updated: not applicable
- Coverage rows closed or changed:

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  `docs/architecture/system-architecture.md`,
  `docs/architecture/architecture-source-of-truth.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed:
- Follow-up architecture doc updates:
  not required

## Review Checklist (mandatory)
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
- [ ] Learning journal was updated if a recurring pitfall was confirmed.

## Notes

High-confidence drift found during the audit:

1. `packages/shared-types/src/client.js` only exposed read/list methods for
   several founder-critical modules even though backend CRUD endpoints already
   exist and are used by both clients.
2. `packages/shared-types/src/index.d.ts` under-modeled real item payloads for
   `lists`, `tasks`, `habits`, `goals`, `journal-entries`, and
   `calendar-events`, and did not export `routines`, `targets`, `life-areas`,
   or CRUD payload shapes.
3. Web and mobile screens therefore kept local copies of item types and used
   `nestApiClient.request` casts for create/update/delete flows.

This task intentionally stops at shared contract truth. It does not yet migrate
route-local callers onto the new typed methods; that remains the next safe
follow-up under `NEST-215`.

## Result Report

- Task summary:
  audited backend CRUD responses for the core `v1` path and hardened
  `@nest/shared-types` so the shared client and exported declarations now cover
  the existing Laravel CRUD surface more truthfully.
- Files changed:
  `packages/shared-types/src/client.js`,
  `packages/shared-types/src/index.d.ts`,
  `packages/shared-types/src/client.d.ts`,
  `.codex/context/TASK_BOARD.md`,
  `.codex/context/PROJECT_STATE.md`,
  `docs/planning/mvp-next-commits.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`,
  `docs/planning/nest_214_shared_types_contract_audit_2026-05-01.md`
- How tested:
  web/mobile typecheck, web lint, mobile Expo web export, and both unit
  contract scripts
- What is incomplete:
  frontend callers still use some route-local request wrappers and duplicated
  screen-local types
- Next steps:
  execute `NEST-215` to reconcile frontend assumptions with actual API error
  envelopes and start consuming the hardened shared contract where that removes
  duplicated UI assumptions
- Decisions made:
  kept the existing backend/API architecture unchanged and tightened only the
  shared contract layer

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues:
  shared client method coverage lagged behind real backend CRUD coverage
- Gaps:
  shared declarations missed several real item fields and payload shapes
- Inconsistencies:
  clients mixed shared `get*` methods with ad-hoc typed casts to
  `nestApiClient.request`
- Architecture constraints:
  keep Laravel as the source of truth and harden the shared client rather than
  introducing parallel frontend contracts

### 2. Select One Priority Task
- Selected task:
  `NEST-214`
- Priority rationale:
  it is the first unfinished dependency in the active `v1` queue and blocks a
  truthful `NEST-215` error-envelope reconciliation
- Why other candidates were deferred:
  `NEST-215` depends on this contract audit, while `NEST-216+` are lower in the
  explicit execution order

### 3. Plan Implementation
- Files or surfaces to modify:
  `packages/shared-types/src/client.js`,
  `packages/shared-types/src/index.d.ts`,
  `packages/shared-types/src/client.d.ts`,
  queue/context docs
- Logic:
  compare controller response shapes and add missing CRUD methods, item types,
  and payload types without changing backend behavior
- Edge cases:
  preserve existing runtime behavior, keep 204 delete responses typed as
  `Promise<void>`, and avoid inventing non-existent fields

### 4. Execute Implementation
- Implementation notes:
  added CRUD methods for lists, tasks, habits, routines, goals, targets,
  life areas, journal entries, and calendar events; expanded exported item
  types for the same modules; and aligned root/client declaration files

### 5. Verify and Test
- Validation performed:
  web/mobile typecheck, web lint, mobile web export, web/mobile unit contract
  scripts, plus an additional web build attempt
- Result:
  required validations passed; an additional web build attempt still fails in
  this environment with `spawn EPERM`

### 6. Self-Review
- Simpler option considered:
  publish a doc-only audit and defer contract fixes
- Technical debt introduced: no
- Scalability assessment:
  stronger shared declarations reduce repeated route-local drift and make future
  client cleanup incremental instead of bespoke
- Refinements made:
  kept the scope to existing endpoints and avoided mixing in frontend migration

### 7. Update Documentation and Knowledge
- Docs updated:
  task report, backlog, next-commit queue, task board, and project state
- Context updated:
  yes
- Learning journal updated: not applicable.
