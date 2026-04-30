# NEST-266 Planning Canonical Legacy Reduction

Date: 2026-04-30
Stage: verification
Owner: Execution Agent

## Context

The Planning canonical view already had the founder-approved first viewport,
workspace tabs, inline creation, and row management. The remaining friction was
that several useful controls still lived in lower legacy containers, and the
fallback preview could still expose non-canonical board structure.

## Goal

Move the next set of existing Planning functions into the canonical workspace
and reduce lower legacy noise so the screen reads closer to the approved
Planning reference while preserving the existing CRUD/data paths.

## Scope

- Web Planning route: `apps/web/src/app/tasks/page.tsx`
- Planning visual system: `apps/web/src/app/globals.css`
- UX documentation and execution context sync

## Implementation Plan

1. Keep the founder-approved Planning composition as the visible source of
   truth.
2. Move task filters and board utility controls into the canonical workspace.
3. Route quick-add actions to the canonical composers.
4. Hide duplicate lower controls in preview mode where the canonical surface
   now owns the workflow.
5. Preserve live-data paths so existing functionality is not forked or mocked.

## 25 Micro-Slice Batch

- [x] 1. Add a canonical task summary strip inside the workspace.
- [x] 2. Move open task count into the canonical workspace.
- [x] 3. Move today task count into the canonical workspace.
- [x] 4. Move overdue task count into the canonical workspace.
- [x] 5. Move standalone task count into the canonical workspace.
- [x] 6. Move contextual list count into the canonical workspace.
- [x] 7. Add canonical board tools disclosure.
- [x] 8. Move search filtering into canonical board tools.
- [x] 9. Move task status filtering into canonical board tools.
- [x] 10. Move list context filtering into canonical board tools.
- [x] 11. Move life-area filtering into canonical board tools.
- [x] 12. Move hide-empty-lists toggle into canonical board tools.
- [x] 13. Move reset filters action into canonical board tools.
- [x] 14. Move refresh action into canonical board tools.
- [x] 15. Route quick-add task to the canonical task composer.
- [x] 16. Route quick-add list to the canonical list composer.
- [x] 17. Route quick-add goal to the canonical goal composer.
- [x] 18. Route quick-add target to the canonical target composer.
- [x] 19. Hide the old Today Focus panel from the canonical first flow.
- [x] 20. Hide the old Setup/Board Filters utility panels.
- [x] 21. Hide the legacy Kanban board when the screen is in canonical preview
  fallback mode.
- [x] 22. Replace raw preview-mode API failure wording with a calmer live-data
  notice.
- [x] 23. Keep preview rows visually canonical by removing visible fallback
  action labels.
- [x] 24. Preserve the advanced Kanban board for live data outside preview
  fallback.
- [x] 25. Refresh phase K screenshot evidence and run web validation gates.

## Acceptance Criteria

- Primary task summary and filters are reachable from the canonical Planning
  workspace.
- Quick-add actions for Tasks, Lists, Goals, and Targets open the matching
  canonical composer path.
- Duplicate lower controls no longer compete with the founder-approved
  composition in preview mode.
- Existing API-backed handlers remain the single runtime path for writes.
- Web validation gates pass.

## Definition Of Done

- Implementation output exists.
- Visual evidence is refreshed.
- Validation evidence is recorded.
- Task board, project state, and design memory are updated.
- Remaining work is explicit.

## Result Report

Phase K is implemented. The canonical Planning workspace now carries the
important task board controls and quick-add routing, while the preview fallback
keeps the founder-approved composition cleaner by hiding the lower Kanban
surface and duplicate utility panels. The live-data notice remains visible but
is moved below the canonical ladder so it does not interrupt the main visual
story.

Evidence:

- Main:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseK.png`

Validation:

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

Known follow-up:

- Manually verify the preserved lower Kanban board with seeded live API data,
  because local screenshot evidence is still captured in preview fallback mode.
- Continue migrating lower list/goal/target library management into canonical
  surfaces once live-data row behavior is checked end to end.
