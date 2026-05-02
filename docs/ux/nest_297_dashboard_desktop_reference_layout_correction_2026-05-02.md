# NEST-297 Dashboard Desktop Reference Layout Correction

Date: 2026-05-02
Stage: release
Owner: Execution Agent

## Context

The softened Dashboard desktop preview improved the background mood, but it
also changed too much of the original desktop composition. The user clarified
that the desktop should stay much closer to the supplied notebook-dashboard
reference while retaining the softer Nest visual language and corrected
branding.

## Goal

Regenerate only the Dashboard desktop canonical preview so it preserves the
reference layout structure and the approved Nest visual tone. Keep the mobile
single-column preview unchanged because the user selected it as the better
mobile flow.

## Scope

- Replace the desktop Dashboard canonical image artifact.
- Preserve the mobile Dashboard canonical image artifact.
- Record the desktop layout rule and mobile single-column decision in UX
  memory.
- Do not change runtime implementation code.

## Implementation Plan

1. Use the supplied desktop screenshot as the structural source.
2. Generate a desktop Dashboard preview with the same major composition:
   top material strip, left rail, large workspace panel, focus card, time map,
   compact task/habit cards, journal reflection, up-next list, and right
   support rail.
3. Keep the product branding as `Nest`.
4. Copy the selected generated image into the canonical artifact path.
5. Update UX memory and project context.

## Acceptance Criteria

- Desktop preview no longer uses a top progress-ring hero as its primary
  structure.
- Desktop preview keeps the five-pillar IA.
- Desktop preview keeps the supplied reference's dashboard information
  architecture while using the softer paper-watercolor Nest style.
- Mobile single-column canonical preview remains unchanged and recorded as the
  preferred mobile breakpoint direction.

## Definition Of Done

- Updated desktop artifact is saved at
  `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-canonical-ia-desktop-2026-05-02.png`.
- UX memory captures the desktop structure correction and mobile direction.
- Visual inspection confirms the artifact matches the requested direction.
- `git diff --check` passes.

## Result Report

Updated artifact:

- `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-canonical-ia-desktop-2026-05-02.png`

The desktop preview now tracks the supplied reference much more closely:
left rail, top real-material strip, one large workspace panel, dark olive focus
card, vertical time map, tasks/habits cards, journal reflection, up-next list,
and right support column. The mobile single-column preview remains the selected
mobile direction.

Validation:

- Visual inspection of regenerated desktop preview.
- `git diff --check`.
