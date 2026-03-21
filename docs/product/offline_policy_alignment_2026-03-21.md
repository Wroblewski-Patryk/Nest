# Offline Policy Drift Resolution (NEST-121)

Date: 2026-03-21
Task: `NEST-121`

## Scope

Aligned MVP offline/manual-sync policy wording across:

- `docs/product/mvp_scope.md`
- `docs/product/overview.md`
- `.codex/context/PROJECT_STATE.md`

## Policy Baseline (v1)

- Offline changes are queued locally.
- Synchronization is manual-only via force-sync action in settings/options.
- Processing is oldest-first.
- Sync stops on first error and shows explicit reason.
- Retry starts from queue beginning and skips already-synced items.

## Drift Removed

- Removed outdated `online-only / no offline support` phrasing from MVP scope.
- Replaced stale `Offline: not planned in MVP` summary in `PROJECT_STATE`.

## Result

- Product docs and project context now describe one consistent MVP offline policy.
