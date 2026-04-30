# NEST-264 Planning Canonical Inline Creation

Date: 2026-04-30
Stage: verification
Owner: Execution Agent

## Context

The canonical Planning first viewport already showed the intended structure,
but creation workflows for Lists, Goals, and Targets still lived primarily in
older lower containers. That made the screen look canonical while the actual
work still happened elsewhere.

## Goal

Move the primary creation actions into the canonical Planning workspace panel
so the approved view becomes the functional center of the module.

## Scope

- Web Planning route: `apps/web/src/app/tasks/page.tsx`
- Planning canonical styling and living polish:
  `apps/web/src/app/globals.css`
- Documentation and evidence sync

## Implementation Plan

1. Add inline canonical composers for Lists, Goals, and Targets.
2. Reuse the existing create handlers and state rather than introducing new
   API paths.
3. Keep Task creation available through the canonical `+ Add task` action.
4. Visually retire duplicate lower add containers for Lists, Goals, and
   Targets while leaving lower library/edit/delete areas intact.
5. Add subtle living UI polish with hover lift and reduced-motion-safe sheen.

## Acceptance Criteria

- Primary add actions in the canonical workspace create real entities through
  the existing handlers.
- Duplicate lower add containers no longer compete visually with the canonical
  workspace.
- Existing lower edit/delete/library functionality remains available.
- The visual treatment remains aligned with the founder Planning reference.
- Web validation gates are green.

## Definition Of Done

- Implementation output exists.
- Validation evidence is recorded.
- Task board, project state, and design memory are updated.
- Remaining migration work is explicit.

## Result Report

Phase I is implemented. The canonical workspace now owns primary inline
creation for Tasks, Lists, Goals, and Targets, while older lower library/edit
surfaces remain available for the next migration slice.

Evidence:

- Main:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseI.png`
- Lists inline creation:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-lists-preview-phaseI.png`
- Goals inline creation:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-goals-preview-phaseI.png`
- Targets inline creation:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-targets-preview-phaseI.png`
- Mobile Lists inline creation:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-mobile-lists-preview-phaseI.png`

Known follow-up:

- Edit/delete functionality is still primarily in lower library panels and
  should migrate into canonical row actions next.
- Task board filters and kanban remain below the canonical area for now.
