# NEST-265 Planning Canonical Row Management

Date: 2026-04-30
Stage: verification
Owner: Execution Agent

## Context

The canonical Planning workspace already owned primary creation, but edit and
delete workflows still lived mainly in lower legacy containers. The next step
toward a fully canonical Planning screen is to let real rows in the canonical
workspace manage their own entity.

## Goal

Move edit/delete entry points for real Tasks, Lists, Goals, and Targets into
the canonical workspace rows while keeping existing handlers and data ownership
unchanged.

## Scope

- Web Planning route: `apps/web/src/app/tasks/page.tsx`
- Planning row styling: `apps/web/src/app/globals.css`
- Documentation and context sync

## Implementation Plan

1. Preserve the five-column canonical table shape from the reference image.
2. Add row actions inside the status cell instead of adding a sixth visual
   column.
3. Reuse existing edit/delete handlers for Tasks, Lists, Goals, and Targets.
4. Add inline canonical edit forms for each entity type.
5. Keep presentation-only fallback rows non-actionable so screenshots do not
   imply fake writes.

## Acceptance Criteria

- Real canonical rows expose edit/delete actions.
- Editing happens inline in the canonical workspace panel.
- Existing API handlers remain the single source of truth.
- Presentation fallback rows remain non-actionable.
- Web validation gates are green.

## Definition Of Done

- Implementation output exists.
- Validation evidence is recorded.
- Task board, project state, and design memory are updated.
- Remaining migration work is explicit.

## Result Report

Phase J is implemented. Canonical rows now support real management actions for
Tasks, Lists, Goals, and Targets when live data is available. The table keeps
the canonical five-column rhythm by placing row tools under status rather than
adding a new visible column.

Evidence:

- Main:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseJ.png`
- Task edit attempt in local fallback mode:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-task-edit-preview-phaseJ.png`

Known follow-up:

- Because the local API was unavailable, screenshot evidence can only show
  non-actionable presentation fallback rows. Live edit/delete behavior is
  covered by TypeScript/build validation and existing handler reuse, but should
  be manually checked once API seed data is running.
- Lower legacy library and kanban containers still exist and should be reduced
  after canonical row management is verified against live data.
