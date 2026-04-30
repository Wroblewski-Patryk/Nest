# NEST-272 Calendar Canonical Phase A (2026-04-30)

## Context

- Delivery stage: `implementation`
- Source direction:
  `docs/ux/nest_268_calendar_canonical_direction_2026-04-30.md`
- Canonical artifact target:
  `docs/ux_canonical_artifacts/2026-04-30/nest-calendar-canonical-reference-desktop.png`
- Runtime surface:
  `apps/web/src/app/calendar/page.tsx`

## Goal

Land the first serious canonical rebuild of the web `Calendar` view so the
module opens as a calm time-orchestration room instead of a generic CRUD page.

## Constraints

- Preserve the shared Nest sidebar and workspace shell.
- Keep existing API-backed event creation, editing, deletion, and refresh
  behavior alive.
- Reuse the dashboard/planning visual language rather than inventing a new one.
- Keep the implementation reversible and contained to the Calendar route and
  shared screen styling.

## Implementation Plan

1. Rebuild the top viewport around the canonical Calendar hierarchy:
   `Today's time map`, `Now on deck`, day timeline, support rail, event
   intelligence, and time ladder.
2. Use live event and task data when available, with calm fallback copy when
   the route is empty or the API is unavailable.
3. Preserve operational event management below the canonical storytelling
   layer so the module stays functional while parity work continues.
4. Capture a fresh parity screenshot from the local web render.

## Result Report

- Reworked `apps/web/src/app/calendar/page.tsx` into a canonical Calendar room
  with:
  - a dashboard-style hero for `Today's time map`,
  - a dominant `Now on deck` card,
  - week strip plus day timeline surface,
  - event intelligence ribbon,
  - support rail cards for guidance, quick add, pressure, and sync health,
  - a `Goal -> Task or list -> Calendar event -> Reflection` ladder,
  - preserved live add/edit/delete event flows below the canonical viewport.
- Added Calendar-specific canonical layout and responsive styling in:
  `apps/web/src/app/globals.css`.
- Captured fresh evidence in:
  `docs/ux_canonical_artifacts/2026-04-30/nest-calendar-web-parity-preview-phaseA.png`.

## Acceptance Criteria

- Calendar reads as a sibling of canonical Dashboard and Planning.
- The first viewport communicates day load and the next meaningful event.
- The right rail supports the time decision instead of competing with it.
- Existing event CRUD remains available without leaving the route.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

## Definition Of Done

- Canonical implementation exists in runtime code.
- Validation evidence was collected.
- Task and project context files were updated.
- A current screenshot artifact was captured from the implemented route.
