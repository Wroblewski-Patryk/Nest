# NEST-276 - Calendar and Journal Desktop Showcase Fallback

## Context

Calendar and Journal already had canonical desktop structures, but when live
data failed or the account was sparse, both screens lost too much fidelity and
degraded into error-first or low-density utility states.

## Goal

Keep Calendar and Journal visually faithful to their canonical desktop targets
even when live data is unavailable, without removing the underlying runtime
flows for real data states.

## Scope

- canonical showcase fallback for `apps/web/src/app/calendar/page.tsx`
- canonical showcase fallback for `apps/web/src/app/journal/page.tsx`
- preview-only hiding rules in `apps/web/src/app/globals.css`

## Changes

- Added showcase Calendar events and tasks derived from the current week so the
  canonical time map, week strip, right rail, event intelligence, and ladder
  stay meaningfully populated in preview mode.
- Suppressed the top Calendar status strip and lower Calendar management panels
  during showcase fallback so the desktop composition stays closer to the
  canonical reference.
- Added showcase Journal entries, life areas, and balance data so the hero,
  recent entries, and right-rail reflection signals retain warmth and density
  when runtime data is empty.
- Kept Journal composer behavior intact while softening the empty life-area
  note in showcase mode and marking recent-entry rows as preview-only.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

## Result

Calendar and Journal now hold their canonical desktop mood much more reliably
in sparse-data states, which makes the app feel intentional and premium even
before every live integration is fully hydrated.
