# Task

## Header

- ID: NEST-200
- Title: Implement canonical planning entry hierarchy on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-198, NEST-199
- Priority: P1

## Context

The planning route already had the strongest functional coverage in the web
app, but it still felt too much like a control panel and not enough like a
life-command surface. The next execution slice was to improve the first
viewport and planning orientation without destabilizing the existing kanban,
list, goal, and target workflows.

## Goal

Bring `/tasks` closer to the canonical Nest experience by adding:

- editorial planning hero,
- dominant planning focus card,
- quiet planning context ribbon,
- stronger framing for the active planning tab.

## Deliverable For This Stage

A verified web planning implementation that preserves current workflows while
lifting orientation, hierarchy, and first-viewport usefulness.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] `/tasks` exposes stronger first-viewport hierarchy through hero, focus,
  and context layers.
- [x] Existing planning CRUD and board workflows remain intact.
- [x] Relevant web validation commands pass.

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
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - planning route now leads with orientation before dense board controls
  - active tab receives contextual focus copy instead of exposing only tool
    panels first
  - board and CRUD interactions remain in place under the new framing
- Screenshots/logs:
  - production build log from 2026-04-26
- High-risk checks:
  - no task/list/goal/target workflow logic was rewritten
  - refresh and tab switching still use the existing planning contract

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  - `docs/architecture/modules.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed:
  - not applicable
- Follow-up architecture doc updates:
  - none

## UX/UI Evidence (required for UX/UI tasks)

- Source of truth type: approved_snapshot
- Design source reference:
  - `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  - not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused:
  - hero band
  - focus card
  - quiet context ribbon
  - dense desktop surfaces
- New shared pattern introduced: no
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: no
- State checks: loading | empty | error | success
- Responsive checks: desktop | tablet | mobile
- Input-mode checks: pointer | keyboard
- Accessibility checks:
  - preserved tablist semantics, button semantics, and panel landmarks
- Parity evidence:
  - web planning now better matches the canonical mental model; mobile planning
    still needs future visual adoption
- MCP evidence links:
  - canonical dashboard artifact remains the current visual anchor:
    `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-canonical-preview.png`

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
- [x] Learning journal was updated if a recurring pitfall was confirmed.

## Notes

- This slice intentionally improves framing and hierarchy while avoiding a risky
  rewrite of the underlying planning workflows.
