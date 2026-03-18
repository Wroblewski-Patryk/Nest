# Tenant Data Retention and Deletion Workflows (NEST-062)

## Scope

`NEST-062` introduces tenant-scoped lifecycle operations for:

- retention pruning (time-window cleanup),
- tenant deletion (data erasure),
- auditable execution history for both workflows.

## Retention workflow

- Command:
  - `php artisan tenants:retention-prune`
  - `php artisan tenants:retention-prune --tenant=<tenant-id>`
  - `php artisan tenants:retention-prune --dry-run`
  - `php artisan tenants:retention-prune --json`
- Service: `App\Tenancy\Services\TenantDataRetentionService`.
- Policy source: `config/tenant_data_lifecycle.php` (`retention_policies`).
- Current policy tables:
  - `analytics_events` (`occurred_at`, 180 days),
  - `integration_sync_audits` (`occurred_at`, 90 days),
  - `integration_sync_failures` (`failed_at`, 90 days),
  - `integration_sync_conflicts` (`created_at`, 90 days),
  - `mobile_push_deliveries` (`sent_at`, 30 days),
  - `automation_runs` (`created_at`, 180 days).

## Tenant deletion workflow

- Command:
  - `php artisan tenants:delete-data <tenant-id>`
  - `php artisan tenants:delete-data <tenant-id> --dry-run`
  - `php artisan tenants:delete-data <tenant-id> --queue`
  - `php artisan tenants:delete-data <tenant-id> --json`
- Service: `App\Tenancy\Services\TenantDataDeletionService`.
- Queue job: `App\Jobs\DeleteTenantDataJob`.
- Behavior:
  - deletes session/token/password-reset artifacts for tenant users,
  - deletes tenant record (domain data removed via FK cascade),
  - supports `dry-run` estimation without deleting data.

## Audit trail

- Storage table: `tenant_data_lifecycle_audits`.
- Model: `App\Models\TenantDataLifecycleAudit`.
- Captured fields:
  - workflow (`retention` / `deletion`),
  - status (`completed` / `dry_run`),
  - target,
  - rows affected,
  - execution timestamp,
  - metadata (policy/deletion breakdown).

## Validation coverage

- `tests/Feature/TenantDataLifecycleCommandTest.php` verifies:
  - retention pruning is tenant-scoped and audited,
  - tenant deletion removes data and records audit entries,
  - deletion command can enqueue `DeleteTenantDataJob`.
