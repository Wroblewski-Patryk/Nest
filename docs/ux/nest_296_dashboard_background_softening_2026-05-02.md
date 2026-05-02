# NEST-296 Dashboard Background Softening

Date: 2026-05-02
Stage: release
Owner: Execution Agent

## Context

The latest Dashboard canonical IA previews had the correct product structure,
but the user preferred the softer background atmosphere from the provided
Dashboard and Planning references. The target adjustment is visual only:
preserve the Nest dashboard architecture while softening section backgrounds.

## Goal

Refresh the Dashboard canonical desktop and mobile previews so they keep the
five-pillar IA and Dashboard content model, while moving the visual language
closer to delicate paper, watercolor landscape, and botanical section art.

## Scope

- Regenerate the Dashboard canonical desktop preview.
- Regenerate the Dashboard canonical mobile preview.
- Keep product branding as `Nest`.
- Record the background treatment rule in UX memory.

## Implementation Plan

1. Use the provided Dashboard and Planning screenshots as mood references for
   section backgrounds.
2. Generate a desktop Dashboard preview with softer watercolor/paper section
   surfaces.
3. Generate a true phone Dashboard preview with a single-column mobile flow.
4. Replace the existing canonical preview artifacts.
5. Record the background guidance for future Dashboard and Planning work.

## Acceptance Criteria

- Desktop preview keeps the dense Dashboard cockpit while using subtler
  paper-watercolor backgrounds.
- Mobile preview behaves like a phone-first Dashboard, prioritizing quick
  capture, check-ins, next focus, and today's map.
- Both previews use only `Nest` branding.
- Five-pillar IA remains visible.
- No implementation code or data behavior is changed.

## Definition Of Done

- Refreshed desktop and mobile image artifacts are saved in
  `docs/ux_canonical_artifacts/2026-05-02/`.
- UX memory captures the softer background rule.
- Visual inspection confirms the previews align with the supplied references.
- Git diff is clean of whitespace errors.

## Result Report

Refreshed artifacts:

- `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-canonical-ia-desktop-2026-05-02.png`
- `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-canonical-ia-mobile-2026-05-02.png`

The desktop preview now leans into warm paper cards, low-opacity watercolor
landscape art, and botanical support details while preserving the Dashboard
information density. The mobile preview was regenerated as a true phone-first
single-column flow so quick actions, check-ins, focus, and the time map remain
easy to scan.

Validation:

- Visual inspection of regenerated desktop preview.
- Visual inspection of regenerated mobile preview.
- `git diff --check`.
