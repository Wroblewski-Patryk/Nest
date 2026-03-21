# Next Execution Wave (Post-Docs Update)

Date: 2026-03-21
Scope: complete remaining UX parity remediation and start v1 localization +
offline/manual-sync delivery decisions that are confirmed in `PROJECT_STATE`.

## Primary Objectives

1. Close remaining UX remediation blockers (`NEST-103`, `NEST-106`).
2. Translate confirmed product decisions (localization + offline/manual sync)
   into executable implementation slices.
3. Keep commit scope small, testable, and reversible.

## Commit Plan (ordered)

### Commit 1 - `chore(ux): generate deterministic parity capture pipeline`

- Tasks: `NEST-103`
- Changes:
  - add deterministic screenshot/parity capture script wrappers (web + mobile),
  - store artifact index in `docs/ux_parity_evidence/...`,
  - document run instructions and expected outputs.
- Validation:
  - web build/export for capture target,
  - mobile export for capture target,
  - parity artifact manifest present for all legacy UX-heavy tasks.

### Commit 2 - `docs(ux): publish parity packs and visual diff index`

- Tasks: `NEST-103`
- Changes:
  - commit side-by-side parity packs and diff index links for legacy tasks,
  - record unresolved visual diff list as implementation input for `NEST-106`.
- Validation:
  - all required task references include parity evidence links,
  - no missing screen/task pairs in index.

### Commit 3 - `feat(web): apply legacy UX visual parity fixes (wave 1)`

- Tasks: `NEST-106`
- Changes:
  - implement web parity fixes for legacy UX-heavy web screens
    (`NEST-021`, `NEST-037`, `NEST-041`, `NEST-042`, `NEST-050`, `NEST-058`,
    `NEST-068` where web scope applies).
- Validation:
  - `pnpm --dir apps/web lint`
  - `pnpm --dir apps/web build`
  - update parity evidence for changed screens.

### Commit 4 - `feat(mobile): apply legacy UX visual parity fixes (wave 2)`

- Tasks: `NEST-106`
- Changes:
  - implement mobile parity fixes for legacy UX-heavy mobile surfaces.
- Validation:
  - `pnpm --dir apps/mobile exec expo export --platform web`
  - parity artifacts refreshed for mobile views.

### Commit 5 - `docs(ux): close evidence gate re-check for legacy tasks`

- Tasks: `NEST-106`
- Changes:
  - rerun full UX evidence gate (source, parity, states, responsive, a11y),
  - publish re-check report and close/fail each legacy task explicitly.
- Validation:
  - evidence report includes pass/fail table per task,
  - `TASK_BOARD` reflects closure status.

### Commit 6 - `feat(i18n): add localization foundation (en/pl + shared contracts)`

- Tasks: `NEST-109`
- Changes:
  - add shared localization primitives for web/mobile/api contracts,
  - enable English + Polish resources and fallback policy,
  - add locale-aware formatting utilities baseline.
- Validation:
  - backend and web/mobile type checks/tests for localization primitives,
  - translation key coverage script baseline.

### Commit 7 - `feat(i18n): onboarding and account localization preferences`

- Tasks: `NEST-110`
- Changes:
  - pre-auth language selector,
  - onboarding language/display-name step,
  - account preference persistence and immediate apply flow.
- Validation:
  - feature tests for preference persistence and propagation,
  - web/mobile smoke checks for language switching paths.

### Commit 8 - `feat(sync): offline queue + manual force-sync baseline`

- Tasks: `NEST-111`, `NEST-112`
- Changes:
  - local offline change queue,
  - manual force-sync action in settings/options,
  - oldest-first processing, stop-on-first-error, retry semantics, and
    conflict-resolution UI baseline.
- Validation:
  - API feature tests for idempotent replay/retry behavior,
  - web/mobile smoke tests for manual sync flow and conflict path.

## Exit Criteria for This Wave

- `NEST-103` and `NEST-106` moved to `DONE` with complete evidence links.
- Localization baseline (`en` + `pl`) is active in pre-auth + onboarding +
  settings flows.
- Offline/manual-sync baseline is functional, documented, and tested.
- `TASK_BOARD` and `PROJECT_STATE` are updated after each meaningful slice.
