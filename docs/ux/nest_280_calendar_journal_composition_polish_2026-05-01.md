# NEST-280 - Calendar and Journal composition polish

## Context

`/calendar` and `/journal` were already structurally aligned to their canonical
desktop references, but both screens still carried visible composition gaps in
high-attention areas. Calendar's timeline controls felt too utility-heavy and
the week strip lacked some of the calmer editorial rhythm of the founder
reference. Journal's right rail and recent-entry feed still read slightly too
technical and airy compared with the approved room-like composition.

## Goal

Tighten visible desktop composition in Calendar and Journal without changing
the underlying runtime behavior or reopening legacy management surfaces.

## Scope

- refine Calendar flow-toolbar, anchor control grouping, week-strip density,
  timeline card sizing, and footer rhythm
- remove the noisy bullet glyph in Calendar `Now on deck` detail copy
- refine Journal desktop column rhythm, composer breathing room, and recent
  entry density
- capture fresh desktop evidence screenshots

## Constraints

- preserve canonical showcase behavior for sparse or failed live data states
- preserve existing CRUD and navigation behavior
- avoid touching unrelated canonical reference docs or temporary screenshot
  artifacts already present in the worktree

## Implementation Plan

1. tighten Calendar desktop control and card styling in shared route CSS
2. replace the `Now on deck` separator with a plain ASCII-safe variant
3. refine Journal desktop spacing and row density in the canonical feed
4. rerun web validations and capture updated preview screenshots

## Acceptance Criteria

- Calendar desktop first viewport reads more like a composed canonical control
  surface than a generic utility toolbar
- Journal desktop rail and feed spacing feel closer to the approved canonical
  room
- web validations pass
- new parity evidence exists for both routes

## Definition of Done

- implementation updated in web route sources
- evidence screenshots captured
- task and project context synced
- validations recorded

## Result Report

- Calendar flow controls now sit inside a calmer grouped toolbar with a clearer
  anchor field, denser week pills, steadier card heights, and a softer footer
  break.
- Journal desktop now uses slightly stronger main/rail spacing, more generous
  composer depth, and denser recent-entry rows with better text balance.
- Replaced the decorative bullet separator in the Calendar focus detail with a
  simple ASCII `|` so the string stays stable across environments.

## Evidence

- `docs/ux_canonical_artifacts/2026-04-30/_tmp-calendar-desktop-after-n280.png`
- `docs/ux_canonical_artifacts/2026-04-30/_tmp-journal-desktop-after-n280.png`

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
