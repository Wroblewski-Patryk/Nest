# NEST-299 Dashboard Runtime Slim Canonical Implementation

Date: 2026-05-02
Stage: release
Owner: Execution Agent

## Context

The Dashboard canonical desktop artifact changed after `NEST-298`: the runtime
needed to move from the older progress-hero dashboard into the slimmer
notebook-style composition with the updated five-pillar sidebar.

## Goal

Implement the current Dashboard canonical look in the web runtime, preserving
existing API-backed data loading and route behavior while replacing the visible
dashboard composition and sidebar treatment.

## Scope

- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/components/workspace-primitives.tsx`
- `apps/web/src/components/workspace-shell.tsx`
- `apps/web/public/assets/dashboard/dashboard-header-material-canonical-2026-05-02.png`
- `packages/shared-types/src/localization.js`
- Dashboard web screenshots in
  `docs/ux_canonical_artifacts/2026-05-02/`

## Implementation Plan

1. Reuse the approved `2026-05-02` Dashboard desktop canonical artifact as the
   runtime visual target.
2. Replace the Dashboard runtime composition with a single notebook board:
   `Now focus`, `Today's time map`, Tasks, Habits, Quick add, Life areas,
   Success ladder, Journal reflection, and Up next.
3. Keep the shared shell navigation to five pillars only in canonical shell
   tone and correct mobile `Planning` labeling.
4. Preserve API loading, auth handling, localization baseline, and existing
   destination routes.
5. Verify with web typecheck, lint, build, unit tests, Playwright screenshots,
   and visual comparison.

## Acceptance Criteria

- Desktop Dashboard matches the slim canonical structure materially: five-pillar
  rail, top material strip, notebook board, focus/time/tasks/habits body, and
  right support rail.
- Mobile Dashboard follows the canonical single-column order: header, five
  bottom pillars, focus, quick add, time map, execution panels, reflection,
  balance, success ladder.
- No API, tenancy, actor-boundary, or data-contract behavior is changed.
- No optional surfaces appear as top-level peers in the canonical sidebar.

## Definition Of Done

- Runtime implementation exists.
- Acceptance criteria are verified with screenshots.
- Relevant web validations pass.
- Task board and project state are updated.

## Result Report

Implemented the slim canonical Dashboard runtime and refreshed evidence:

- `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAQ.png`
- `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-web-parity-preview-phaseAQ-mobile.png`

Validation:

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
- Playwright desktop screenshot smoke at 1565x1005
- Playwright mobile screenshot smoke at 390x900
- Visual inspection against
  `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-canonical-ia-desktop-2026-05-02.png`
- Final fidelity pass also used the canonical desktop artifact's native
  1565x1005 viewport for direct screenshot comparison.
- The final micro-pass restored the visible `Tasks` heading, corrected
  `Life Areas` capitalization, added notebook binding detail to the journal
  card, and refreshed the production-render screenshots.
- The latest fidelity pass aligned showcase timeline/task/habit labels with
  the canonical artifact, moved the topbar date/weather under the greeting,
  restored visible `Add task`, and added habit streak values plus richer Up
  next rows.
- A final right-rail fidelity pass replaced the runtime's heavy stacked-card
  treatment with the canonical open support rail, vertical divider, upper
  Quick add alignment, and desktop/mobile-safe section styling.
- The 97%-target pass tuned the right rail to the canonical vertical start
  point and enlarged the sidebar plant/quote/account grouping to better match
  the approved desktop reference.

Remaining intentional deviations:

- Runtime uses code-native typography for the focus title instead of handwritten
  raster lettering so it can remain localized and data-backed.
- Runtime keeps real route destinations and live-data fallbacks for active
  accounts; the no-data showcase path mirrors the canonical sample labels.
