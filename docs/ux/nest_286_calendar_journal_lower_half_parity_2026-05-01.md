# NEST-286 - Calendar and Journal lower-half parity

## Context

Calendar and Journal had improved support rails, but their lower-half desktop
surfaces still carried visible parity drift in narrative rhythm and component
proportions compared with the canonical references.

## Goal

Tighten the lower-half storytelling and component rhythm for Calendar and
Journal so both desktop routes read closer to the approved references.

## Scope

- `apps/web/src/app/calendar/page.tsx`
- `apps/web/src/app/journal/page.tsx`
- `apps/web/src/app/globals.css`
- context sync files

## Implementation Plan

1. Align Calendar ladder copy and node content more directly to the canonical
   narrative.
2. Tighten Calendar showcase ladder proportions.
3. Tighten Journal showcase composer and recent-entry rhythm.
4. Record repo truth and validations.

## Acceptance Criteria

- Calendar lower showcase surfaces read more like the canonical
  `Event timeline -> Time ladder` sequence.
- Journal composer and feed feel denser and more editorial in showcase mode.
- Web validation baseline passes.

## Result Report

Completed.

- Calendar showcase ladder now uses more reference-aligned copy and node
  content, including the canonical `Launch product`, `Define positioning`, and
  `Capture insights and decisions` story.
- Calendar showcase ladder nodes received tighter spacing and calmer, more
  reference-like proportions.
- Journal showcase composer and entries now use a denser title/date rhythm,
  shorter excerpt cadence, and a less placeholder-like `Read` affordance.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
