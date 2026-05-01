# NEST-285 - Calendar and Journal rail parity

## Context

After the previous showcase closure pass, Calendar and Journal were much closer
to the canonical desktop references, but their support rails still exposed the
largest remaining visual drift.

## Goal

Bring Calendar and Journal support-rail surfaces closer to the founder-approved
desktop references by reducing runtime-heavy wording and reinforcing the
editorial composition of the right column.

## Scope

- `apps/web/src/app/calendar/page.tsx`
- `apps/web/src/app/journal/page.tsx`
- `apps/web/src/app/globals.css`
- context sync files

## Implementation Plan

1. Tighten Calendar rail copy and showcase values.
2. Reframe Calendar sync health into calmer showcase rows.
3. Add Journal rail polish where the reference depends on quieter decorative
   cues.
4. Sync repo truth and validations.

## Acceptance Criteria

- Calendar showcase right rail uses calmer, more reference-like copy and
  support values.
- Journal support rail feels less utilitarian and closer to the approved room.
- Web validation baseline passes.

## Result Report

Completed.

- Calendar showcase rail now uses the canonical `Time with clarity` script and
  more reference-aligned `Today` and `Later` notes.
- Calendar pressure and sync cards now render showcase-specific values and a
  calmer sync story instead of generic runtime-only metrics.
- Journal rail gained a quieter divider treatment in the writing card, stronger
  prompt arrow styling, and a warmer ladder card surface.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
