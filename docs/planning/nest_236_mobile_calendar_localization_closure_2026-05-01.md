# Task

## Header

- ID: NEST-236
- Title: Mobile Calendar localization closure
- Task Type: refactor
- Current Stage: implementation
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-235
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 236
- Operation Mode: BUILDER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

Mobile Calendar is a core V1 parity surface. After `NEST-224`, it supports real
event CRUD, but the CRUD panel still contains route-local English-only copy for
feedback, validation, alerts, placeholders, and accessibility labels.

## Goal

Move Mobile Calendar event CRUD copy into the existing shared EN/PL localization
dictionary and wire the screen through `translate`.

## Scope

- `apps/mobile/app/(tabs)/calendar.tsx`
- `packages/shared-types/src/localization.js`
- Planning/context docs

## Success Signal
- User or operator problem: mobile core Calendar should honor the `en`/`pl`
  baseline in its real CRUD flow.
- Expected product or reliability outcome: event CRUD copy is localized without
  changing API behavior.
- How success will be observed: mobile typecheck/export pass and static
  inspection shows targeted strings use `t(...)`.
- Post-launch learning needed: no

## Deliverable For This Stage

Implement the mobile Calendar localization cleanup, verify, update docs/context,
and commit.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Add EN/PL dictionary keys for Mobile Calendar event CRUD panel copy.
2. Replace hardcoded event CRUD feedback, validation, alert, placeholder, and
   accessibility copy with `t(...)`.
3. Keep API payloads, date parsing, provider sync, and CRUD handlers unchanged.
4. Run mobile typecheck and Expo web export.
5. Update task board and project state.
6. Commit the validated slice.

## Acceptance Criteria

- Mobile Calendar event CRUD user-facing copy uses shared localization keys.
- EN and PL dictionary entries exist for the targeted keys.
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
- Manual checks: static inspection confirmed targeted Calendar CRUD copy routes
  through `t(...)` and shared EN/PL keys exist.
- Screenshots/logs: not applicable
- High-risk checks: no API/data behavior changed
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: not applicable

## Architecture Evidence

- Architecture source reviewed: `docs/architecture/v1_v2_delivery_split.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: not applicable
- Follow-up architecture doc updates: none expected

## UX/UI Evidence

- Existing shared pattern reused: shared `translate` dictionary
- New shared pattern introduced: no
- Design-memory update required: no
- State checks: loading | empty | error | success
- Feedback locality checked: yes
- Raw technical errors hidden from end users: existing `getUserSafeErrorMessage`
  behavior retained
- Responsive checks: mobile
- Input-mode checks: touch
- Accessibility checks: button/input labels localized
- Parity evidence: core Calendar CRUD remains API-backed and localized

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

This does not address the blocked mobile authenticated API session path in
`NEST-231`.

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
- Regression check performed: mobile typecheck, mobile Expo web export, and
  static localization inspection

## Product / Discovery Evidence
- Problem validated: yes
- User or operator affected: mobile Calendar users in English/Polish baseline
- Existing workaround or pain: route-local English-only CRUD copy
- Smallest useful slice: Calendar event CRUD panel copy
- Success metric or signal: mobile validations and static inspection pass
- Feature flag, staged rollout, or disable path: revert commit
- Post-launch feedback or metric check: not applicable

## Reliability / Observability Evidence
- `docs/operations/service-reliability-and-observability.md` reviewed: not applicable
- Critical user journey: mobile Calendar event CRUD
- SLI: not applicable
- SLO: not applicable
- Error budget posture: not applicable
- Health/readiness check: not applicable
- Logs, dashboard, or alert route: not applicable
- Smoke command or manual smoke: typecheck/export
- Rollback or disable path: revert commit

## AI Testing Evidence

Not applicable.

## Security / Privacy Evidence
- `docs/security/secure-development-lifecycle.md` reviewed: not applicable
- Data classification: unchanged Calendar event data
- Trust boundaries: unchanged mobile client to API boundary
- Permission or ownership checks: unchanged backend enforcement
- Abuse cases: not applicable for localization copy
- Secret handling: no secrets touched
- Security tests or scans: not applicable
- Fail-closed behavior: unchanged
- Residual risk: low

## Result Report

- Task summary: localized Mobile Calendar event CRUD feedback, validation,
  alerts, placeholders, panel labels, action copy, and accessibility labels
  through the shared EN/PL dictionary.
- Files changed: `apps/mobile/app/(tabs)/calendar.tsx`,
  `packages/shared-types/src/localization.js`, planning/context docs.
- How tested: mobile typecheck, mobile Expo web export, static localization
  inspection, and `git diff --check`.
- What is incomplete: other mobile core screens still have route-local copy and
  should be handled as separate slices.
- Next steps: continue mobile core localization closure screen by screen, or
  resolve `NEST-231` when the user chooses the mobile auth direction.
- Decisions made: keep event API logic untouched and localize only the view
  copy path.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: mobile Calendar event CRUD copy remains hardcoded in English.
- Gaps: shared localization dictionary lacks granular event CRUD labels.
- Inconsistencies: screen title/quick actions are localized but CRUD panel is
  not.
- Architecture constraints: preserve API-backed CRUD behavior.

### 2. Select One Priority Task
- Selected task: `NEST-236` Mobile Calendar localization closure.
- Priority rationale: mobile Calendar is core V1 parity and recently became
  API-backed.
- Why other candidates were deferred: broader mobile localization can follow as
  smaller per-screen slices.

### 3. Plan Implementation
- Files or surfaces to modify: mobile Calendar screen and shared dictionary.
- Logic: replace targeted literals with `t(key, fallback)`.
- Edge cases: keep dynamic event titles in labels and alert copy.

### 4. Execute Implementation
- Implementation notes: added granular `mobile.calendar.*` keys and replaced
  hardcoded event CRUD literals with `t(...)` or small token replacement through
  `tx(...)`.

### 5. Verify and Test
- Validation performed: mobile typecheck, mobile Expo web export, static
  localization inspection, and `git diff --check`.
- Result: passed.

### 6. Self-Review
- Simpler option considered: leave English fallbacks; rejected because the V1
  localization baseline requires visible EN/PL behavior in core paths.
- Technical debt introduced: no
- Scalability assessment: per-screen localization closure keeps mobile parity
  work reversible and easy to review.
- Refinements made: localized the provider-connect-outside-V1 Calendar message
  because it appears in the same Calendar screen.

### 7. Update Documentation and Knowledge
- Docs updated: task report.
- Context updated: `.codex/context/TASK_BOARD.md` and
  `.codex/context/PROJECT_STATE.md`.
- Learning journal updated: not applicable.
