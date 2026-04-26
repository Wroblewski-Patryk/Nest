# Task

## Header

- ID: NEST-209
- Title: Implement dashboard visual parity phase 1 on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-197, NEST-198, NEST-201
- Priority: P1

## Context

The founder target image for the Nest dashboard was already translated into a
canonical direction doc and a detailed parity-gap plan. What still remained
was the first implementation slice that closes the biggest visual gap on the
actual web route without introducing one-off dashboard-only hacks.

The approved next slice from `NEST-201` was:

- shell parity refinement,
- hero parity refinement,
- right-rail support stack,
- stronger focus/timeline composition,
- reusable primitives that can later propagate to other modules.

## Goal

Bring `/dashboard` materially closer to the founder reference by implementing a
more premium shell, an illustrated editorial hero, a stronger `Now Focus`
surface, a ceremonial day-flow timeline, and a calmer right support rail.

## Deliverable For This Stage

A verified web dashboard implementation with reusable visual primitives and
updated repository truth capturing the new parity baseline.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] `/dashboard` is visually much closer to the founder reference in shell,
  hero, focus, timeline, and support-column composition.
- [x] The new visual language is implemented through reusable primitives and
  shared styling, not route-local hacks only.
- [x] Relevant web validation commands pass.
- [x] Repository context and design-memory truth are updated.

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
  - dashboard hero now reads as one illustrated editorial surface instead of a
    flat metrics block
  - right rail now behaves as a calm support column (`Journal`, `Quick add`,
    `Life areas`)
  - focus card, day-flow timeline, and insight strip now feel like one guided
    scene instead of equal-weight generic panels
- Screenshots/logs:
  - founder target artifact:
    `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
  - current implementation preview:
    `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`
- High-risk checks:
  - dashboard data contracts were preserved; no backend API shape changes were
    introduced
  - the implementation remains responsive and continues to render usable empty
    states when live data is sparse

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  - `docs/architecture/architecture-source-of-truth.md`
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
  - `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`
  - `docs/ux/nest_201_dashboard_parity_gap_plan_2026-04-26.md`
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  - not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused:
  - workspace shell
  - hero band
  - focus card
  - quiet context ribbon
- New shared pattern introduced:
  - support rail card stack
  - illustrated hero composition
  - ceremonial day-flow timeline
  - insight footer strip
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: yes
- State checks: loading | empty | error | success
- Responsive checks: desktop | tablet | mobile
- Input-mode checks: pointer | keyboard
- Accessibility checks:
  - preserved semantic headings, button/link semantics, progressbar semantics,
    and tab semantics
- Parity evidence:
  - the new web dashboard is materially closer to the founder target image and
    now serves as the live implementation baseline for downstream module
    rebuild work
- MCP evidence links:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`

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

- This is explicitly phase 1 of dashboard parity, not the final endpoint.
- The implementation now provides the stronger reusable shell/surface grammar
  needed for the next propagation wave into `Life Areas`, `Calendar`,
  `Habits`, and `Insights`.
