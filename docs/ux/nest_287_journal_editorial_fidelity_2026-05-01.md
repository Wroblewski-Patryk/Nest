# NEST-287 - Journal editorial fidelity

## Context

Journal was already close to the canonical desktop room, but a few small UI
details in the composer and recent-entry preview still read more like a generic
preview state than the founder-approved editorial surface.

## Goal

Tighten Journal showcase fidelity through smaller but high-leverage UI details
in the composer and recent-entry rows.

## Scope

- `apps/web/src/app/journal/page.tsx`
- `apps/web/src/app/globals.css`
- context sync files

## Implementation Plan

1. Add a calmer showcase character counter to the composer textarea.
2. Replace generic showcase row affordances with more reference-like passive
   edit/delete preview icons.
3. Sync repo truth and rerun web validation baseline.

## Acceptance Criteria

- Journal showcase composer reads closer to the canonical writing surface.
- Showcase recent-entry rows feel less placeholder-like.
- Web validation baseline passes.

## Result Report

Completed.

- Added a subtle showcase character count to the Journal reflection textarea so
  the composer reads more like the approved desktop room.
- Replaced the generic `Read` preview affordance in showcase entry rows with
  calmer passive action icons that sit closer to the canonical memory-list
  anatomy.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
