# Manual Sync Retry and Conflict Resolution Baseline v1 (NEST-112)

Date: 2026-03-21
Task: `NEST-112`

## Delivered Baseline

- Manual retry flow added in web/mobile sync options.
- Retry semantics:
  - retry starts from queue beginning,
  - queue keeps `synced` items and skips them (idempotency-safe path),
  - failed items are returned to `pending` before retry pass.
- Conflict resolution baseline in web/mobile:
  - conflict UI shows `base/local/remote` values for conflict fields,
  - user chooses resolution action (`accept` or `override`) in both clients.

## API and Client Contract Updates

- Conflict listing response includes `comparison` object per field
  (`base`, `local`, `remote`) with safe fallback values when snapshots are
  unavailable.
- Shared type contract updated (`IntegrationConflictItem.comparison`).

## Validation

- `php artisan test --filter=IntegrationConflictQueueApiTest` (PASS)
- `pnpm --dir apps/web build` (PASS)
- `pnpm --dir apps/mobile exec expo export --platform web` (PASS)
