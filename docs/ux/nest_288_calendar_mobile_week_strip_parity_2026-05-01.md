# NEST-288 - Calendar Mobile Week-Strip Parity

## Stage

- `implementation`

## Context

Recent Calendar canonical passes improved desktop fidelity and general mobile
ordering, but the mobile web route still drifted from the approved Calendar
reference in one obvious place: the week strip and showcase range no longer
represented a full Monday-to-Sunday week.

## Goal

Restore the canonical full-week orientation for Calendar so mobile and desktop
both keep a seven-day strip and showcase mode shows the correct week range.

## Scope

- `apps/web/src/app/calendar/page.tsx`
- `apps/web/src/app/globals.css`

## Constraints

- keep the existing live Calendar CRUD flows unchanged
- do not introduce new route structure or state models
- preserve the current Calendar showcase fallback behavior
- keep the change tiny, reversible, and CSS or presentation focused

## Forbidden

- no new systems
- no workaround-only data paths
- no changes to backend contracts
- no regressions in shared workspace shell behavior

## Implementation Plan

1. Expand the Calendar week strip back to a full seven-day window.
2. Fix showcase range copy so it reflects the whole week rather than the
   current day window.
3. Tighten mobile week-pill sizing so the seven-day strip still reads cleanly
   on narrow screens.

## Acceptance Criteria

- Calendar week strip renders seven days instead of five.
- Showcase week navigation label reflects the actual Monday-to-Sunday range.
- Mobile week strip remains a horizontal seven-day orientation layer rather
  than collapsing into a vertical stack.

## Validation

- Passed: `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`
- Passed: `.\node_modules\.bin\eslint.CMD .` in `apps/web`
- Passed: `node --experimental-strip-types ./scripts/route-guard-regression.mjs`
  and `node ./scripts/unit-contract.mjs` in `apps/web`
- Blocked by sandbox/runtime: `.\node_modules\.bin\next.CMD build --webpack`
  failed with `spawn EPERM`

## Definition Of Done

- implementation exists in the web Calendar route
- canonical mobile week-orientation drift is reduced
- repo context is synced in `TASK_BOARD`, `PROJECT_STATE`, and design memory
- validation evidence is recorded with the build blocker made explicit

## Result Report

Completed a narrow Calendar parity slice that restores the seven-day week strip
and correct showcase week-range labeling. Mobile CSS now keeps the week strip
horizontal with denser pill sizing instead of collapsing it into a stacked
list.
