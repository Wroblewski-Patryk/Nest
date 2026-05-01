# Task

## Header

- ID: NEST-212
- Title: Move mobile founder-critical shell copy to shared localization keys
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-211
- Priority: P1
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Context

`NEST-210` and `NEST-211` left the mobile founder-critical path as the next
highest-value `v1` localization gap. The mobile shell still rendered tab
labels, shared `ModuleScreen` chrome, `Calendar` entry copy, and the mobile
`Settings` hub in hard-coded English even though the shared translation
contract already existed in `@nest/shared-types`.

## Goal

Move the mobile founder-critical shell copy onto shared localization keys while
preserving the current mobile information architecture and leaving settings
change propagation as a separate `NEST-213` slice.

## Scope

- shared dictionary:
  `packages/shared-types/src/localization.js`
- mobile UI language source:
  `apps/mobile/lib/ui-language.ts`
- shared mobile shell:
  `apps/mobile/components/mvp/ModuleScreen.tsx`
  `apps/mobile/app/(tabs)/_layout.tsx`
- founder-critical mobile screens in this slice:
  `apps/mobile/app/(tabs)/calendar.tsx`
  `apps/mobile/app/(tabs)/settings.tsx`

## Success Signal

- User or operator problem:
  mobile founder-critical shell surfaces still read like an English-only
  product even when a Polish preference exists.
- Expected product or reliability outcome:
  mobile tab labels and shared shell surfaces render through the same shared
  translation contract already used on web.
- How success will be observed:
  the tab bar, shared module chrome, Calendar entry copy, and mobile Settings
  hub all read from shared localization keys and the resolved mobile UI
  language.
- Post-launch learning needed: yes, in `NEST-213` for settings-driven
  propagation behavior.

## Deliverable For This Stage

Localized mobile shell wiring plus repo-truth updates that move the queue to
`NEST-213`.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] shared mobile UI language hook exists and reuses the approved shared
  localization contract
- [x] mobile tab labels use shared localization keys
- [x] shared `ModuleScreen` chrome uses localized labels
- [x] `Calendar` and mobile `Settings` shell copy use shared localization keys
- [ ] `.codex` context files reflect the completed slice
- [x] planning files reflect the completed slice

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

## Implementation Summary

- Added mobile shell and settings localization keys in
  `packages/shared-types/src/localization.js`.
- Added `apps/mobile/lib/ui-language.ts` so mobile shell surfaces resolve the
  detected language through the existing localization options endpoint instead
  of reading only the environment default.
- Localized the founder-critical mobile shell entry points:
  - tab labels in `apps/mobile/app/(tabs)/_layout.tsx`
  - shared `ModuleScreen` chrome in
    `apps/mobile/components/mvp/ModuleScreen.tsx`
  - `Calendar` hero and quick-action copy in
    `apps/mobile/app/(tabs)/calendar.tsx`
  - mobile `Settings` hub copy in `apps/mobile/app/(tabs)/settings.tsx`

## Remaining Work

- `NEST-213` still needs to make settings-driven language changes propagate
  consistently without relying on screen remounts or fresh bootstrap fetches.
- Deeper CRUD copy inside founder-critical mobile tabs remains outside this
  shell-focused slice.
- `.codex/context/TASK_BOARD.md` and `.codex/context/PROJECT_STATE.md` still
  need the same completion note once the current local ACL deny is removed.

## Validation Evidence

- Tests:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`
  `node .\scripts\unit-contract.mjs` in `apps/mobile`
  `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`
- Manual checks:
  code inspection of mobile tab labels, shared module shell, Calendar shell
  copy, and Settings hub copy
- Screenshots/logs:
  not captured in this slice
- High-risk checks:
  confirmed the change stays within the existing shared localization contract
  and does not change data ownership
- Execution blockers:
  attempted updates to `.codex/context/TASK_BOARD.md` and
  `.codex/context/PROJECT_STATE.md` were denied by local filesystem ACLs in
  this environment
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

- Source of truth type: architecture_and_existing_runtime
- Design source reference:
  `docs/architecture/frontend_strategy.md`
- Canonical visual target:
  founder-critical mobile shell surfaces
- Fidelity target: structurally_faithful
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  not applicable
- Experience-quality bar reviewed: no
- Visual-direction brief reviewed: no
- Existing shared pattern reused:
  `@nest/shared-types` translation helpers
- New shared pattern introduced:
  mobile `useUiLanguage` hook built on the existing localization endpoint
- Design-memory update required: no
- Visual gap audit completed: no
- Background or decorative asset strategy:
  not applicable
- Canonical asset extraction required: no
- Screenshot comparison pass completed: no
- Remaining mismatches:
  mobile founder-critical CRUD forms still contain hard-coded copy outside this
  shell-focused task
- State checks: loading | empty | error | success
- Feedback locality checked: yes
- Raw technical errors hidden from end users: yes
- Responsive checks: phone | tablet
- Input-mode checks: touch
- Accessibility checks:
  not run in this slice
- Parity evidence:
  mobile now uses the same shared translation contract as web for shell-level
  founder-critical copy
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
- [ ] Docs or context were fully updated if repository truth changed.
- [ ] Learning journal was updated if a recurring pitfall was confirmed.
