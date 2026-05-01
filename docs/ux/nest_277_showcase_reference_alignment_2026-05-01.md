# NEST-277 - Showcase Reference Alignment

## Context

The previous showcase fallback pass improved density, but Calendar and Journal
still showed one visible fidelity break: preview content was generated from the
current runtime date while shell chrome remained locked to the canonical May 23,
2025 reference. Calendar also still exposed lower tooling too loudly on
desktop.

## Goal

Make showcase states read as one intentional canonical composition by aligning
date-dependent content to the same reference date and lowering the visual noise
of lower management tools.

## Scope

- showcase-date alignment in `apps/web/src/app/calendar/page.tsx`
- showcase-date alignment in `apps/web/src/app/journal/page.tsx`
- calendar desktop tool de-emphasis

## Changes

- Moved Calendar showcase content onto the canonical May 23, 2025 week and
  made sparse live states use the richer showcase surface.
- Reworked Calendar showcase events so the active day better resembles the
  canonical workshop-centered timeline.
- Collapsed lower Calendar creation and management into one `Calendar tools`
  details block to keep the desktop first viewport calmer.
- Moved Journal showcase entries onto the same canonical date frame.
- Restored preview life-area chips inside the Journal composer so the canonical
  writing surface keeps its intended structure even before live life areas
  exist.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

## Result

Calendar and Journal now read much more like fixed canonical product views
instead of a blend of polished chrome and date-misaligned preview content, and
Calendar desktop no longer drops immediately into a large management slab below
the core story.
