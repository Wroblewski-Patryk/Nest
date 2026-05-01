# Task

## Header

- ID: NEST-210
- Title: Audit live localization coverage on the founder-critical path
- Task Type: research
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-209
- Priority: P1
- Coverage Ledger Rows:

## Context
`v1` requires a reliable `en` and `pl` baseline across web and mobile core
flows. The current architecture and `v1` execution backlog already treat
localization and parity as release-shaping work, but the latest product wave
focused mostly on canonical web fidelity. Before moving into follow-up
implementation, the repo needed one truthful audit of what is already localized
and where founder-critical screens still fall back to hard-coded copy or the
wrong language source.

## Goal
Produce one evidence-backed localization audit for the founder-critical path so
`NEST-211`, `NEST-212`, and `NEST-213` can execute against explicit gaps rather
than intuition.

## Scope

- audit inputs:
  `docs/architecture/frontend_strategy.md`,
  `docs/governance/language-policy.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`
- shared localization contract:
  `packages/shared-types/src/localization.js`,
  `packages/shared-types/src/client.js`,
  `packages/shared-types/src/index.d.ts`
- web founder-critical surfaces:
  `apps/web/src/app/auth/page.tsx`,
  `apps/web/src/app/onboarding/page.tsx`,
  `apps/web/src/components/pre-auth-language-selector.tsx`,
  `apps/web/src/lib/ui-language.ts`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/calendar/page.tsx`,
  `apps/web/src/app/journal/page.tsx`
- mobile founder-critical surfaces:
  `apps/mobile/components/mvp/ModuleScreen.tsx`,
  `apps/mobile/app/(tabs)/index.tsx`,
  `apps/mobile/app/(tabs)/calendar.tsx`,
  `apps/mobile/app/(tabs)/journal.tsx`,
  `apps/mobile/app/(tabs)/settings.tsx`,
  `apps/mobile/app/(tabs)/_layout.tsx`

## Success Signal

- User or operator problem:
  founder-critical screens do not currently behave like one bilingual product.
- Expected product or reliability outcome:
  the next implementation tasks can migrate localization in dependency order
  without rediscovering the same gaps.
- How success will be observed:
  one audit captures current coverage, drift categories, and the smallest safe
  next implementation slices.
- Post-launch learning needed: no

## Deliverable For This Stage
One completed audit document with a coverage matrix, explicit gap categories,
and next-task guidance for the localization closure wave.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] founder-critical web and mobile surfaces were inspected against the
  current shared localization contract
- [x] gaps are classified by severity and follow-up task ownership
- [x] repo planning context points to the next post-audit task

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

## Audit Summary

### Current Shared Contract

- Shared translation primitives exist in `@nest/shared-types` through
  `resolveLanguage(...)`, `translate(...)`, and localized date formatting.
- The shipped dictionary is still narrow. It covers public/auth/onboarding copy
  plus `app.kicker`, but does not yet cover authenticated shell navigation or
  founder-critical module copy.
- User-language persistence exists on web pre-auth surfaces through
  `apps/web/src/lib/ui-language.ts`.

### Coverage Matrix

| Surface | Current state | Evidence | Main gap |
| --- | --- | --- | --- |
| Web auth | localized | `translate(...)` used 31 times in `apps/web/src/app/auth/page.tsx` | healthy baseline |
| Web onboarding | localized | `translate(...)` used 14 times and stored language is updated | healthy baseline |
| Web authenticated shell | partial | only `app.kicker` is translated; nav labels and utility copy are hard-coded in `apps/web/src/components/workspace-shell.tsx` | shell does not use shared keys |
| Web dashboard | not localized | 0 `translate(...)` calls; shell props and canonical copy are hard-coded | module copy still English-only |
| Web planning | not localized | 0 `translate(...)` calls; shell props and canonical copy are hard-coded | module copy still English-only |
| Web calendar | not localized | 0 `translate(...)` calls; shell props, status strip, time-map labels, and ladder copy are hard-coded | module copy still English-only |
| Web journal | not localized | 0 `translate(...)` calls; shell props, status strip, composer labels, and ladder copy are hard-coded | module copy still English-only |
| Mobile shared module shell | partial | `ModuleScreen` translates only `app.kicker` and date locale | shared panel labels remain hard-coded and mixed-language |
| Mobile tasks tab | not localized | hard-coded English feedback, validation, filters, labels, and action copy in `apps/mobile/app/(tabs)/index.tsx` | CRUD flow copy is English-only |
| Mobile calendar tab | not localized | hard-coded English title, subtitle, quick actions, provider messaging in `apps/mobile/app/(tabs)/calendar.tsx` | daily-use flow is English-only |
| Mobile journal tab | not localized | hard-coded English feedback, form labels, alerts, and action copy in `apps/mobile/app/(tabs)/journal.tsx` | capture flow is English-only |
| Mobile settings tab | partial | detected language is loaded, but UI text remains hard-coded English in `apps/mobile/app/(tabs)/settings.tsx` | preference does not drive rendered copy |
| Mobile tabs layout | not localized | tab titles are hard-coded in `apps/mobile/app/(tabs)/_layout.tsx` | primary navigation remains English-only |

### Findings

1. The shared localization mechanism exists, but the shared dictionary scope is
   still pre-auth only.
2. Auth and onboarding are the only founder-critical web surfaces that are
   materially localized today.
3. The authenticated web shell currently resolves language from
   `NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE`, not from the stored user preference,
   so even a broader dictionary would still not fully honor founder settings.
4. The four founder-critical canonical web modules (`Dashboard`, `Planning`,
   `Calendar`, `Journal`) currently ship with hard-coded English shell and body
   copy.
5. Mobile has the same structural problem but in a broader form: shared shell,
   tab labels, module copy, feedback messages, and validation prompts are all
   mostly hard-coded.
6. Mobile also shows source-of-truth drift: settings fetches a detected
   language, while shared module rendering still defaults to
   `EXPO_PUBLIC_NEST_DEFAULT_LANGUAGE`.

### Severity Register

- Blocker for truthful `v1` localization baseline:
  authenticated web shell does not honor persisted user language
- Blocker for truthful `v1` localization baseline:
  founder-critical web modules still render English-only canonical copy
- Blocker for truthful `v1` localization baseline:
  founder-critical mobile tabs still render English-only navigation and CRUD
  copy
- Important follow-up:
  shared dictionary needs shell, dashboard, planning, calendar, journal, and
  settings keys before implementation can stay DRY
- Important follow-up:
  mobile and web need one common language-source rule so settings-driven
  changes propagate consistently

### Recommended Next Execution Slices

1. `NEST-211`
   Move authenticated web shell navigation plus dashboard entry copy onto
   shared localization keys and stop reading the shell language directly from
   the default env.
2. `NEST-212`
   Move mobile founder-critical shell/tab/module copy onto the same shared key
   space, starting with `ModuleScreen` and tab navigation labels.
3. `NEST-213`
   Reconcile settings-driven language propagation so both web and mobile render
   the stored or server-backed preference instead of environment defaults.

## Validation Evidence

- Tests:
  not applicable for this audit-only slice
- Manual checks:
  code inspection across shared localization helpers and founder-critical web
  and mobile files
- Screenshots/logs:
  not applicable
- High-risk checks:
  confirmed the main drift is a source-of-truth and coverage problem, not an
  architecture mismatch
- Coverage ledger updated: not applicable
- Coverage rows closed or changed:
  not applicable

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
  authenticated founder-critical web and mobile flows
- Fidelity target: structurally_faithful
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: no
- Existing shared pattern reused:
  `@nest/shared-types` translation helpers and stored web language preference
- New shared pattern introduced: no
- Design-memory entry reused:
  not applicable
- Design-memory update required: no
- Visual gap audit completed: no
- Background or decorative asset strategy:
  not applicable
- Canonical asset extraction required: no
- Screenshot comparison pass completed: no
- Remaining mismatches:
  authenticated founder-critical copy is still mostly English outside auth and
  onboarding
- State checks: loading | error | success
- Feedback locality checked: yes
- Raw technical errors hidden from end users: yes
- Responsive checks: desktop | mobile
- Input-mode checks: touch | pointer
- Accessibility checks:
  not applicable for this audit-only slice
- Parity evidence:
  both web and mobile were inspected against the same shared localization
  contract
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
- [ ] Docs or context were updated if repository truth changed.
- [ ] Learning journal was updated if a recurring pitfall was confirmed.

## Notes

This task intentionally stops at audit and queue reconciliation. It does not
begin key migration or settings propagation implementation inside the same
slice.

Environment note:
- updating `.codex/context/TASK_BOARD.md`, `.codex/context/PROJECT_STATE.md`,
  and `.codex/context/LEARNING_JOURNAL.md` was blocked in this session by file
  ACL deny entries on write access for the sandbox user, so repo-truth sync was
  completed only in writable planning docs.

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
- Endpoint and client contract match: not applicable
- DB schema and migrations verified: not applicable
- Loading state verified: yes
- Error state verified: yes
- Refresh/restart behavior verified: not applicable
- Regression check performed:
  cross-check of language-source usage on web and mobile shared shells

## Product / Discovery Evidence

- Problem validated: yes
- User or operator affected:
  founder using the same core screens across web and mobile
- Existing workaround or pain:
  language support exists only on the pre-auth edge and does not reach the main
  product loop consistently
- Smallest useful slice:
  one coverage audit plus backlog/context reconciliation
- Success metric or signal:
  explicit next implementation slices are now backed by file-level evidence
- Feature flag, staged rollout, or disable path: not applicable
- Post-launch feedback or metric check:
  not applicable

## Reliability / Observability Evidence

- `docs/operations/service-reliability-and-observability.md` reviewed:
  not applicable
- Critical user journey:
  founder-critical multilingual entry from auth through the daily product loop
- SLI:
  not applicable
- SLO:
  not applicable
- Error budget posture: not applicable
- Health/readiness check:
  code-level audit evidence
- Logs, dashboard, or alert route:
  not applicable
- Smoke command or manual smoke:
  static inspection only in this environment
- Rollback or disable path:
  not applicable

## Result Report

- Task summary:
  completed a repo-truth audit of localization coverage across founder-critical
  web and mobile surfaces and derived the next implementation slices
- Files changed:
  `docs/planning/nest_210_founder_critical_localization_audit_2026-05-01.md`,
  `docs/planning/mvp-next-commits.md`
- How tested:
  architecture/doc review plus file-level code inspection with `rg` and direct
  reads
- What is incomplete:
  no localization keys or runtime behavior were changed yet, and `.codex`
  context files could not be updated because write access was denied by local
  ACL rules
- Next steps:
  execute `NEST-211`, then `NEST-212`, then `NEST-213`
- Decisions made:
  treat authenticated shell language-source drift as the first implementation
  blocker, ahead of deeper route-level copy migration
