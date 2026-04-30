# NEST-263 Planning Canonical Workspace Tabs

Date: 2026-04-30
Stage: verification
Owner: Execution Agent

## Context

`NEST-262` introduced the canonical Planning first viewport, but the upper
workspace panel was still richest for `Tasks`. The approved Planning image
frames `Tasks`, `Lists`, `Goals`, and `Targets` as one connected planning
system, so the canonical panel needed each mode to carry useful relational
preview content.

## Goal

Make the canonical Planning workspace tabs feel like one coherent module across
Tasks, Lists, Goals, and Targets while preserving the existing lower CRUD
surfaces.

## Scope

- Web Planning route: `apps/web/src/app/tasks/page.tsx`
- Planning canonical styling: `apps/web/src/app/globals.css`
- Context and evidence updates

## Implementation Plan

1. Keep the existing tab routing and lower CRUD panels.
2. Add relational preview rows for Lists, Goals, and Targets in the canonical
   workspace panel.
3. Make the primary panel action switch to the active mode (`+ Add task`,
   `+ Add list`, `+ Add goal`, `+ Add target`) and scroll to the matching
   composer.
4. Preserve presentation-only fallback content for canonical screenshots when
   the local API is unavailable.
5. Capture evidence for the main Planning view and the additional tab modes.

## Acceptance Criteria

- The canonical workspace panel no longer degrades to generic helper text for
  Lists, Goals, or Targets.
- Each tab exposes relationship context appropriate to the entity type.
- The active tab action matches the selected entity type.
- Existing lower CRUD functionality remains available and unchanged in purpose.
- Visual evidence exists for the main Planning view and tab variants.

## Definition Of Done

- Implementation output exists in the web app.
- Typecheck, lint, build, and web unit checks are green.
- Task board, project state, and design memory are updated.
- Remaining limitations are explicit.

## Result Report

Phase H is implemented. The canonical Planning workspace now presents:

- `Tasks`: task rows linked to goals, targets, and lists
- `Lists`: list rows linked to goals and targets
- `Goals`: goal rows linked to targets and lists
- `Targets`: target rows linked to goals with progress indicators

Evidence:

- Main:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseH.png`
- Lists:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-lists-preview-phaseH.png`
- Goals:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-goals-preview-phaseH.png`
- Targets:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-targets-preview-phaseH.png`

Known follow-up:

- The lower CRUD panels still use the older form/list styling and should be
  harmonized in a later pass after the canonical first viewport is stable.
- With the API unavailable locally, the canonical panel uses presentation-only
  fallback content while lower CRUD areas remain truthful to stored state.
