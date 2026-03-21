# Stitch Screen Registry (2026-03-21)

## Purpose

Track the active Stitch source artifact set for the current unified UX/UI
cycle, including screen IDs, ownership intent, and update scope.

## Active Project

- Stitch project: `projects/11122321523690086751`
- Project title: `Nest LifeOS Unified UX Mix Ideal v2`
- Baseline style source:
  `docs/ux/nest_os_design_system_mix_ideal_v1.md`

## Screen Inventory

- `projects/11122321523690086751/screens/1c9ea10850b64bdbbb2f9a1ae3967efc`
  - Title: `Nest OS Foundation Board`
  - Purpose: cross-module foundation and visual rule board
- `projects/11122321523690086751/screens/3b773ae837ed44488d15cdee78a6e532`
  - Title: `Nest Design System Board`
  - Purpose: shared token/component language
- `projects/11122321523690086751/screens/64341b8036e1470b83a4ae630a00aa83`
  - Title: `Nest Home Dashboard`
  - Purpose: daily overview and execution center
- `projects/11122321523690086751/screens/7decc38f1eaf4da3ae262c145d21c231`
  - Title: `Nest Home Today (Mobile)`
  - Purpose: mobile day timeline and now-focus
- `projects/11122321523690086751/screens/47539c8935d044f2b7de82e34b2676da`
  - Title: `Nest Journal and Reflection`
  - Purpose: reflection, notes, mood journaling
- `projects/11122321523690086751/screens/81fbbc74978a4d7cb180d0bd2ceeef80`
  - Title: `Nest Tasks and Habits Command`
  - Purpose: execution list, habits, actionable queue
- `projects/11122321523690086751/screens/b22c7912224e4fa2ae3101789a5287c7`
  - Title: `Nest Calendar and Timeboxing`
  - Purpose: scheduling and planning windows
- `projects/11122321523690086751/screens/71322468b72a4d6bba2f1b56f047ab36`
  - Title: `Nest AI Planner and Explainability`
  - Purpose: planned AI planning/explanation surfaces
- `projects/11122321523690086751/screens/fa4aa25ee4354516b0e817bd5fce3a7b`
  - Title: `Integrations and Sync Center`
  - Purpose: integration status, manual sync, conflict visibility
- `projects/11122321523690086751/screens/71d241c92bc944a9b86033bbe5456fb4`
  - Title: `Nest Insights and Trends (Desktop)`
  - Purpose: analytics and insight visualization

## Update Log

- 2026-03-21:
  - Stitch MCP connectivity validated (`list_projects`, `list_screens`).
  - Mobile unification edit batch executed for:
    - `7decc38f1eaf4da3ae262c145d21c231`
    - `47539c8935d044f2b7de82e34b2676da`
    - `81fbbc74978a4d7cb180d0bd2ceeef80`
  - Desktop/cross-module update batch requested; follow-up verification is
    required after asynchronous completion response.

## Working Rules for Next Iterations

- Keep prompt constraints aligned with Mix Ideal baseline document.
- Edit screens in module batches to avoid timeout and keep change logs clear.
- Every batch must include state visibility requirements:
  loading, empty, error, success.
- Keep implementation blocked until explicit approval of the final Stitch pack.
