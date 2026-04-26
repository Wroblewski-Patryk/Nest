# Task

## Header

- ID: NEST-210
- Title: Refine dashboard parity toward founder reference on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-209
- Priority: P1

## Context

The first parity pass materially improved the dashboard shell and composition,
but the screen still had a few visible mismatches against the founder target:

- the hero still felt too much like a product header stacked above a content
  hero,
- the bottom zone still diverged from the target card arrangement,
- empty or unauthenticated preview states could break the visual impression
  instead of preserving a strong canonical composition.

## Goal

Push the web dashboard closer to the founder reference by tightening the
structure, reducing duplicate hierarchy, restoring the target-like lower card
arrangement, and giving the screen premium fallback presentation when live data
is sparse.

## Deliverable For This Stage

A verified refined dashboard implementation plus updated preview artifact and
repository truth for the new parity level.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] dashboard hero no longer duplicates the main page title hierarchy
- [x] lower dashboard layout is closer to the reference (`Tasks + Habits`)
- [x] sparse-data states preserve a polished founder-demo composition
- [x] relevant web validation commands pass

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
  - dashboard now reads much closer to the founder reference in the first two
    viewports
  - hero, focus card, day-flow, right rail, tasks, habits, and insight strip
    feel like one coherent composition
  - dashboard keeps a polished presentation even with little or no live data
- Screenshots/logs:
  - updated parity preview:
    `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  - `docs/ux/ui-ux-foundation.md`
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
  - `docs/ux/nest_201_dashboard_parity_gap_plan_2026-04-26.md`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  - not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused:
  - illustrated hero
  - support rail cards
  - day-flow timeline
  - insight footer strip
- New shared pattern introduced:
  - polished sparse-data dashboard showcase fallback
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: yes
- State checks: loading | empty | error
- Responsive checks: desktop | tablet | mobile
- Input-mode checks: pointer | keyboard
- Accessibility checks:
  - semantic panels and actionable links/buttons preserved

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
