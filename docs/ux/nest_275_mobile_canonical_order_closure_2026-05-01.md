# NEST-275 - Mobile Canonical Order Closure

## Context

The first workspace mobile parity pass improved hierarchy across Dashboard,
Planning, Calendar, and Journal, but Calendar still surfaced support content in
the wrong order and Journal needed one calmer ordering pass for the ladder and
support rail relationship.

## Goal

Stabilize narrow-screen ordering for the canonical web views so the visible
mobile stack matches the approved references more closely.

## Scope

- mobile ordering refinement in `apps/web/src/app/globals.css`
- Calendar canonical mobile order closure
- Journal canonical mobile order closure

## Changes

- Reworked mobile ordering so Calendar can interleave main-column and support
  surfaces in one canonical reading sequence.
- Raised `Today's time map` and the day-flow workspace ahead of secondary event
  surfaces in Calendar mobile.
- Kept `Quick add`, pressure, and sync cards ahead of the final `Time ladder`
  in Calendar mobile.
- Preserved the calmer Journal stack where the reflection ladder lands after the
  support cards instead of interrupting the middle of the page.
- Kept shared mobile card stretching explicit so canonical cards fill the
  available width consistently.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

## Result

Calendar mobile now reads much closer to the canonical reference sequence, and
Journal mobile keeps a cleaner emotional progression from hero to reflection
work to softer support surfaces and only then the ladder.
