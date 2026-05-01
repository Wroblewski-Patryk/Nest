# NEST-284 - Calendar and Journal showcase closure

## Context

Calendar and Journal were visibly closer to the approved canonical references,
but two parity gaps still weakened the desktop read:

- sparse or failed Journal runtime states could still fall back to a thinner
  live composition instead of holding the canonical room
- Calendar desktop controls and week strip still read more like utility chrome
  than the framed orientation controls from the reference

## Goal

Tighten Calendar and Journal desktop showcase behavior so sparse-live runtime
states still preserve the approved canonical composition and the highest-noise
control surfaces read closer to the reference.

## Scope

- `apps/web/src/app/calendar/page.tsx`
- `apps/web/src/app/journal/page.tsx`
- `apps/web/src/app/globals.css`
- context sync files

## Implementation Plan

1. Promote Journal showcase mode for sparse or failed live states, not only
   zero-data states.
2. Tighten Journal showcase focus, composer, and recent-entry density.
3. Reframe Calendar showcase controls with a calmer week-stepper and denser
   week strip rhythm.
4. Record repo truth in task/context docs.

## Acceptance Criteria

- Journal keeps the canonical showcase structure when live content is too thin
  to carry the approved room.
- Calendar showcase top controls and week strip feel more structured and less
  raw-utility than before.
- Web validation baseline passes.

## Definition of Done

- Implementation exists in the touched web route files.
- Relevant validations pass.
- `TASK_BOARD`, `PROJECT_STATE`, and `design-memory` reflect the change.

## Result Report

Completed.

- Journal now enables showcase mode whenever runtime content is too sparse or
  the route has a failed data fetch, instead of only when every dataset is
  empty.
- Journal showcase focus gained supporting copy, and the showcase composer/feed
  now use slightly tighter spacing so the room reads closer to the canonical
  reference.
- Calendar showcase now uses a calmer framed week stepper and a denser week
  strip with marker rhythm, which brings the top of the timeline panel closer
  to the approved screen.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
