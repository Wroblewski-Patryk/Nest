# NEST-273 Journal Canonical Phase A (2026-04-30)

## Context

- Delivery stage: `implementation`
- Source direction:
  `docs/ux/nest_269_journal_canonical_direction_2026-04-30.md`
- Canonical artifact target:
  `docs/ux_canonical_artifacts/2026-04-30/nest-journal-canonical-reference-desktop.png`
- Runtime surface:
  `apps/web/src/app/journal/page.tsx`

## Goal

Land the first canonical rebuild of the web `Journal` route so it opens as a
warm reflection room rather than a mixed utility screen.

## Constraints

- Preserve the shared Nest workspace shell and sidebar.
- Keep the existing journal entry and life-area backend contracts alive.
- Reuse the canonical dashboard/planning/calendar language instead of creating
  a new visual system.
- Keep the slice reversible and scoped to Journal runtime plus shared styling.

## Implementation Plan

1. Rebuild the first viewport around `Today's reflection room`,
   `Reflection focus`, a warm composer, and the support rail.
2. Keep recent entries review prominent but secondary to reflection capture.
3. Preserve journal-entry and life-area CRUD flows, while reducing their
   administrative weight in the first viewport.
4. Capture a fresh parity screenshot from the implemented route.

## Result Report

- Reworked `apps/web/src/app/journal/page.tsx` into a canonical Journal room
  with:
  - a dashboard-style hero for `Today's reflection room`,
  - a dominant `Reflection focus` band,
  - a warm reflection composer with mood chips and life-area chips,
  - recent-entry filters and softer memory rows,
  - support rail cards for writing guidance, quick prompts, mood trend, and
    life-area reflection,
  - a `Day event -> Feeling -> Life area -> Next intention` reflection ladder,
  - preserved journal-entry editing/deletion and life-area management flows.
- Added Journal-specific canonical layout and styling in:
  `apps/web/src/app/globals.css`.
- Captured fresh evidence in:
  `docs/ux_canonical_artifacts/2026-04-30/nest-journal-web-parity-preview-phaseA.png`.

## Acceptance Criteria

- The module is named `Journal` everywhere.
- Reflection capture dominates the first viewport.
- Mood and life-area context stay visible without turning clinical.
- Recent entries support review without overpowering the composer.
- Existing journal and life-area CRUD still works from the route.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

## Definition Of Done

- Canonical runtime implementation exists.
- Validation evidence was collected.
- Task and project context files were updated.
- A current screenshot artifact was captured from the implemented route.
