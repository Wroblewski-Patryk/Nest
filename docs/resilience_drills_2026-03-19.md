# Resilience Drills Report (2026-03-19) - NEST-078

## Scope

- Local resilience drill executed for:
  - backup integrity,
  - restore viability check,
  - queued recovery path for tenant deletion workflow,
  - retention workflow dry-run health.

## Drill Execution Summary

Date:

- 2026-03-19

Environment:

- local development (`apps/api`, SQLite)

### 1. Backup Integrity Drill

Actions:

- Created snapshot:
  - `storage/app/backups/resilience-post-migrate-20260319-191423.sqlite`
- Compared SHA256:
  - source DB: `5CC6B3331E7F6A7A6170B3D344EA07C2D8E5F912364BA2D3962BB4EFA9D09A24`
  - backup DB: `5CC6B3331E7F6A7A6170B3D344EA07C2D8E5F912364BA2D3962BB4EFA9D09A24`

Result:

- PASS (hash match confirms backup integrity)

### 2. Retention Workflow Health Drill

Actions:

- Executed:
  - `php artisan tenants:retention-prune --dry-run --json`

Result:

- PASS after schema sync (command completed successfully, no rows affected in local baseline).

### 3. Queue Recovery Drill (Deletion Dry-Run)

Actions:

- Enqueued dry-run deletion:
  - `php artisan tenants:delete-data <tenant-id> --queue --dry-run --json`
- Processed one queued job:
  - `php artisan queue:work --once --queue=default --json`

Observed worker output:

- job `App\Jobs\DeleteTenantDataJob` started and completed with `status=success`.

Result:

- PASS (queued recovery path operational in local profile)

## Corrective Actions

1. Local schema drift detected before drill:
   - Initial retention dry-run failed due missing table `analytics_events`.
2. Corrective action applied:
   - Ran `php artisan migrate --force` to synchronize schema.
3. Prevention action:
   - Keep local readiness checklist step to run migrations before resilience drills.
   - Preserve CI security/control gates and migration checks as baseline deployment hygiene.

## Follow-up Recommendation

- Execute the same drill set on staging with production-like data volume and capture:
  - RTO timing per workflow,
  - queue drain duration under load,
  - observed recovery variance across repeated runs.
