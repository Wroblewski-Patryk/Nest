# Task

## Header

- ID: NEST-209
- Title: Reconcile web and mobile error taxonomy wording baseline
- Task Type: refactor
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-208
- Priority: P1

## Context
`v1` requires the same user-safe error-state language across web and mobile for
founder-critical flows. The architecture baseline in
`docs/architecture/frontend_strategy.md` explicitly requires shared UX rules and
consistent state vocabulary, but the current implementation still mixed:

- shared `describeApiIssue(...)` messaging on some support surfaces,
- mobile CRUD fallbacks that degraded to `Something went wrong.`,
- web core routes with route-local fallbacks such as `Planning request failed.`

That drift made the same API status feel like different product systems.

## Goal
Restore one practical wording baseline for API-driven error states across web
and mobile core flows without changing the API contract or introducing a new UI
system.

## Scope

- Shared helper contract:
  `packages/shared-types/src/client.js`,
  `packages/shared-types/src/index.d.ts`
- Web wrappers:
  `apps/web/src/lib/ux-contract.ts`
- Mobile wrappers:
  `apps/mobile/lib/ux-contract.ts`
- Web founder-critical/core routes:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/calendar/page.tsx`,
  `apps/web/src/app/journal/page.tsx`,
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/app/habits/page.tsx`,
  `apps/web/src/app/routines/page.tsx`,
  `apps/web/src/app/life-areas/page.tsx`

## Implementation Plan

1. Move API error taxonomy parsing into the existing shared package instead of
   keeping separate web/mobile logic.
2. Preserve field-level validation messages and explicit payload messages when
   present.
3. Standardize fallback wording for shared HTTP classes (`401`, `403`, `404`,
   `422`, `429`, `5xx`, generic unknown).
4. Repoint web route-local `getErrorMessage(...)` helpers to the shared
   contract with calm action-oriented fallbacks instead of `...request failed`.
5. Run web and mobile type/lint checks relevant to the touched files.

## Acceptance Criteria

- Web and mobile use the same fallback language for the same API status class.
- Validation payload field errors still surface the first actionable field
  message.
- Known noisy pagination payload drift still resolves to a user-safe message.
- Web core routes no longer expose `...request failed` fallback copy.

## Success Signal

- User or operator problem:
  the same backend error currently reads differently depending on client/route.
- Expected product or reliability outcome:
  web and mobile feel like one system during load/save/retry failures.
- How success will be observed:
  shared helpers are reused and route-local fallbacks converge on one
  action-oriented vocabulary.
- Post-launch learning needed: no

## Deliverable For This Stage
A completed implementation slice with verification evidence and synced project
truth for the new error-taxonomy baseline.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] shared API error helper logic lives in an existing shared package
- [x] touched web/mobile routes consume the same fallback taxonomy
- [x] relevant validation evidence is recorded

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
  `pnpm exec tsc --noEmit` in `apps/web`,
  `pnpm lint` in `apps/web`,
  `pnpm exec tsc --noEmit` in `apps/mobile`
- Manual checks:
  code-level verification of field-error, payload-message, and status-fallback
  paths in shared helper flow
- Screenshots/logs:
  not applicable for this non-visual slice
- High-risk checks:
  verified `401` redirect guards still rely on status checks instead of string
  matching

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  `docs/architecture/frontend_strategy.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed:
  not applicable
- Follow-up architecture doc updates:
  none required

## UX/UI Evidence (required for UX/UI tasks)

- Source of truth type: approved_snapshot
- Design source reference:
  `docs/architecture/frontend_strategy.md`
- Canonical visual target:
  not applicable
- Fidelity target: structurally_faithful
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: no
- Existing shared pattern reused:
  shared async-state/error helper pattern
- New shared pattern introduced: no
- Design-memory entry reused:
  cross-client consistency model from architecture docs
- Design-memory update required: no
- Visual gap audit completed: no
- Background or decorative asset strategy:
  not applicable
- Canonical asset extraction required: no
- Screenshot comparison pass completed: no
- Remaining mismatches:
  auth/settings still keep route-local wording and can be folded into the same
  contract in a later hardening pass
- State checks: loading | error | success
- Feedback locality checked: yes
- Raw technical errors hidden from end users: yes
- Responsive checks: not applicable
- Input-mode checks: not applicable
- Accessibility checks:
  not applicable for wording-only implementation
- Parity evidence:
  shared helper now powers both web and mobile wrappers
- MCP evidence links:
  not applicable

## Review Checklist (mandatory)

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

This slice intentionally stops at the shared error taxonomy baseline. It does
not widen into localization-key migration; that remains the next planned wave.

## Production-Grade Required Contract

Every task must include these mandatory sections before it can move to `READY`
or `IN_PROGRESS`:

- `Goal`
- `Scope` with exact files, modules, routes, APIs, schemas, docs, or runtime
  surfaces
- `Implementation Plan` with step-by-step execution and validation
- `Acceptance Criteria` with testable conditions
- `Definition of Done` using `DEFINITION_OF_DONE.md`
- `Result Report`

Runtime tasks must be delivered as a vertical slice: UI -> logic -> API -> DB
-> validation -> error handling -> test. Partial implementations, mock-only
paths, placeholders, fake data, and temporary fixes are forbidden.

## Integration Evidence

- `INTEGRATION_CHECKLIST.md` reviewed: not applicable
- Real API/service path used: no
- Endpoint and client contract match: yes
- DB schema and migrations verified: not applicable
- Loading state verified: yes
- Error state verified: yes
- Refresh/restart behavior verified: yes
- Regression check performed:
  shared helper preserves existing status-based control flow

## Product / Discovery Evidence

- Problem validated: yes
- User or operator affected:
  founder using the same module set across web and mobile
- Existing workaround or pain:
  same backend failure class produced different client wording
- Smallest useful slice:
  shared helper plus core-route adoption
- Success metric or signal:
  consistent payload/field/status fallback wording across clients
- Feature flag, staged rollout, or disable path: not applicable
- Post-launch feedback or metric check:
  not applicable

## Reliability / Observability Evidence

- `docs/operations/service-reliability-and-observability.md` reviewed:
  not applicable
- Critical user journey:
  recoverable CRUD/load failures on founder-critical screens
- SLI:
  not applicable
- SLO:
  not applicable
- Error budget posture: not applicable
- Health/readiness check:
  type/lint validation
- Logs, dashboard, or alert route:
  not applicable
- Smoke command or manual smoke:
  static validation only in this environment
- Rollback or disable path:
  revert helper adoption and route wrappers

## AI Testing Evidence (required for AI features)

- `AI_TESTING_PROTOCOL.md` reviewed: not applicable
- Memory consistency scenarios:
  not applicable
- Multi-step context scenarios:
  not applicable
- Adversarial or role-break scenarios:
  not applicable
- Prompt injection checks:
  not applicable
- Data leakage and unauthorized access checks:
  not applicable
- Result:
  not applicable

## Security / Privacy Evidence

- `docs/security/secure-development-lifecycle.md` reviewed: not applicable
- Data classification:
  user-safe error copy only
- Trust boundaries:
  frontend presentation over existing API error envelope
- Permission or ownership checks:
  existing `401`/`403` handling preserved
- Abuse cases:
  avoid leaking raw technical transport copy
- Secret handling:
  unchanged
- Security tests or scans:
  not applicable
- Fail-closed behavior:
  unauthorized flows still rely on status checks and existing redirects
- Residual risk:
  untouched routes may still use older wording until follow-up closure

## Result Report

- Task summary:
  extracted shared API error messaging into `@nest/shared-types` and aligned
  web/mobile core fallback wording to one action-oriented baseline
- Files changed:
  `packages/shared-types/src/client.js`,
  `packages/shared-types/src/index.d.ts`,
  `apps/web/src/lib/ux-contract.ts`,
  `apps/mobile/lib/ux-contract.ts`,
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/calendar/page.tsx`,
  `apps/web/src/app/journal/page.tsx`,
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/app/habits/page.tsx`,
  `apps/web/src/app/routines/page.tsx`,
  `apps/web/src/app/life-areas/page.tsx`
- How tested:
  web lint/typecheck and mobile typecheck
- What is incomplete:
  auth/settings-specific wording is still route-local and can be folded in
  later if we want full-client closure
- Next steps:
  execute `NEST-210` localization audit on the founder-critical path
- Decisions made:
  reused the existing shared package instead of duplicating another web/mobile
  helper layer
