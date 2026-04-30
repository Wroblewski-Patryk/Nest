# NEST-267 Planning Canonical Tab Depth

Date: 2026-04-30
Stage: verification
Owner: Execution Agent

## Context

The Planning canonical screen already owned the founder-approved hero, weekly
flow, support rail, workspace tabs, inline creation, row management, and task
board tools. The remaining gap was that `Lists`, `Goals`, and `Targets` still
fell back too quickly into legacy lower libraries instead of extending the
canonical story on their own.

## Goal

Give each Planning tab its own canonical depth layer and reduce lower preview
noise so every mode reads like one coherent screen, not a canonical top half
followed by legacy management blocks.

## Scope

- Web Planning route: `apps/web/src/app/tasks/page.tsx`
- Planning visual system: `apps/web/src/app/globals.css`
- UX documentation and execution context sync

## Implementation Plan

1. Keep the canonical first viewport unchanged.
2. Add one tab-aware canonical context panel beneath the Planning ladder.
3. Reuse live data when available and preserve showcase fallback values.
4. Hide lower legacy libraries in preview mode where the canonical layer now
   carries enough context.
5. Refresh evidence for all Planning tabs.

## 25 Micro-Slice Batch

- [x] 1. Add canonical deep panel for `Tasks`.
- [x] 2. Add canonical deep panel for `Lists`.
- [x] 3. Add canonical deep panel for `Goals`.
- [x] 4. Add canonical deep panel for `Targets`.
- [x] 5. Add task execution summary cards below the ladder.
- [x] 6. Add task anchor note below the execution summary.
- [x] 7. Add list structure summary cards below the ladder.
- [x] 8. Add list structure note about intentional context use.
- [x] 9. Add goal momentum summary cards below the ladder.
- [x] 10. Add goal momentum note about path clarity.
- [x] 11. Add target health summary cards below the ladder.
- [x] 12. Add target health note about measurable checkpoints.
- [x] 13. Add tab-aware canonical CTA button inside the deep panel.
- [x] 14. Add goal-linked list count for canonical list depth.
- [x] 15. Add target-linked list count for canonical list depth.
- [x] 16. Add life-area-linked list count for canonical list depth.
- [x] 17. Add goals-with-targets count for canonical goal depth.
- [x] 18. Add goals-with-lists count for canonical goal depth.
- [x] 19. Add paused/completed goal rollup for canonical goal depth.
- [x] 20. Add targets-with-lists count for canonical target depth.
- [x] 21. Add due-soon target count for canonical target depth.
- [x] 22. Add average target progress for canonical target depth.
- [x] 23. Add overdue-target detection for target review notes.
- [x] 24. Hide `List Library`, `Goal Roadmaps`, and `Target Checkpoints` in
  preview mode.
- [x] 25. Refresh phase L evidence and rerun web validation gates.

## Acceptance Criteria

- Every Planning tab has a canonical lower context layer instead of depending
  on legacy libraries for meaning.
- Lower list/goal/target libraries do not compete with preview-mode canonical
  layout.
- Existing data and CRUD handlers remain the single source of runtime truth.
- Fresh evidence exists for the default Planning view and the `Lists`,
  `Goals`, and `Targets` tabs.
- Web validation gates pass.

## Definition Of Done

- Implementation output exists.
- Visual evidence is refreshed.
- Validation evidence is recorded.
- Task board, project state, and design memory are updated.
- Remaining work is explicit.

## Result Report

Phase L is implemented. Planning now keeps its canonical language alive below
the ladder through one tab-aware context panel per mode: execution signals,
list structure, goal momentum, and target health. Preview mode no longer drops
back into the lower legacy list/goal/target libraries, so the route reads as a
more complete canonical product surface.

Evidence:

- Main:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseL.png`
- Lists:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-lists-preview-phaseL.png`
- Goals:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-goals-preview-phaseL.png`
- Targets:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-targets-preview-phaseL.png`

Validation:

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

Known follow-up:

- The lower legacy libraries are still preserved for non-preview/live-data
  management and can be collapsed into one advanced management surface in a
  future slice.
- The preview fallback still shows the live-data notice at the bottom of the
  canonical stack, which is truthful and calm, but can later be integrated into
  a more native canonical system-status treatment.
