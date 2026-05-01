# NEST-281 - Calendar and Journal reference structure pass

## Context

After `NEST-280`, Calendar and Journal were visually calmer, but both routes
still diverged from the approved desktop references in one structural way.
Calendar used a stacked ribbon-plus-ledger pattern where the canonical screen
uses one tighter event story strip. Journal still treated the reflection
ladder like a lower-page block instead of a support-rail companion in showcase
mode.

## Goal

Move both routes closer to the founder-approved screen structure, not only the
surface styling.

## Scope

- replace Calendar showcase lower-context stack with one compact reference-like
  event story strip plus ownership chips
- add related-link context to the Calendar ladder in showcase mode
- move Journal showcase reflection ladder into the support rail
- shorten Journal showcase recent-entry list to the tighter canonical density

## Constraints

- preserve live route behavior outside showcase mode
- keep existing CRUD and navigation flows intact
- do not stage unrelated docs or screenshot references already present in the
  worktree

## Implementation Plan

1. render a showcase-only Calendar event-story section
2. retain the legacy event-intelligence ribbon and ledger for non-showcase live
   states
3. render a showcase-only Journal rail ladder and hide the lower duplicate
4. capture updated desktop evidence and rerun web validations

## Acceptance Criteria

- Calendar showcase lower context reads as one coherent event narrative closer
  to the canonical screenshot
- Journal showcase keeps the ladder in the support rail instead of as a lower
  full-width band
- web validations pass

## Definition of Done

- implementation updated
- evidence captured
- task board and project state synced
- validations recorded

## Result Report

- Calendar showcase now uses a compact `Event timeline` story strip with
  created, sync, goal-link, and reminder steps, plus dedicated ownership/source
  chips instead of the previous ribbon + ledger combination.
- Calendar showcase ladder now includes related navigation cues for `Open goal`
  and `Related tasks`, which better matches the reference’s lower explanatory
  rhythm.
- Journal showcase now keeps the reflection ladder in the right rail and trims
  the recent-entry list to the tighter desktop density shown in the canonical
  reference.

## Evidence

- `docs/ux_canonical_artifacts/2026-04-30/_tmp-calendar-desktop-after-n281.png`
- `docs/ux_canonical_artifacts/2026-04-30/_tmp-journal-desktop-after-n281b.png`

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
