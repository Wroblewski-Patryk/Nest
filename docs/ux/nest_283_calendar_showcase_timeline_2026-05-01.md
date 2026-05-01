# NEST-283 - Calendar showcase timeline pass

## Context

After `NEST-282`, Calendar had a much stronger showcase focus panel, but the
center timeline still read more like stacked cards than a canonical time map.
The founder-approved reference uses a more explicit schedule board with hour
labels, lane headings, a stronger `Now` center, and event blocks that read as
scheduled objects rather than generic list items.

## Goal

Bring the Calendar showcase center panel closer to the approved desktop time
map.

## Scope

- replace the showcase day-grid cards with a more timeline-like showcase board
- add hour rail, lane headings, `Now` emphasis, and tone-based event blocks
- preserve non-showcase live behavior with the existing card-based layout

## Constraints

- no regressions to live add/edit/delete flows
- keep non-showcase layout unchanged
- do not stage unrelated reference docs or temporary artifacts already present
  in the worktree

## Implementation Plan

1. derive showcase lane data from existing grouped event collections
2. render a showcase-only timeboard inside the flow panel
3. add showcase-specific CSS for hour rail, lane headings, and block tones
4. rerun validations and capture fresh Calendar desktop evidence

## Acceptance Criteria

- Calendar showcase center panel looks materially closer to the canonical
  time-map composition
- showcase `Now` lane feels visually centered and more intentional
- web validations pass

## Definition of Done

- implementation updated
- evidence captured
- context docs synced
- validations recorded

## Result Report

- Replaced the Calendar showcase card grid with a timeboard that includes an
  hour rail, centered `Now` lane, and schedule blocks styled by event tone.
- Kept non-showcase behavior on the existing grid/card layout so live runtime
  behavior remains unchanged while preview fidelity improves.

## Evidence

- `docs/ux_canonical_artifacts/2026-04-30/_tmp-calendar-desktop-after-n283.png`

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
