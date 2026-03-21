# Tenant Isolation Verification Suite (NEST-061)

## Scope

`NEST-061` hardens multi-tenant safety by validating isolation across:

- API resource access paths.
- Integration sync service ownership checks.
- Queue job execution and failure persistence paths.

## Implemented verification matrix

1. API isolation
   - Cross-tenant reads for lists, tasks, and automation rules return `404`.
2. Integration service isolation
   - `IntegrationSyncService` validates ownership of internal entities
     (`task_list`, `task`, `calendar_event`, `journal_entry`) against
     `tenant_id` and `user_id`.
   - Cross-tenant payloads fail with
     `InvalidArgumentException: Internal entity ownership verification failed.`
3. Queue isolation
   - `ProcessIntegrationSyncJob` with cross-tenant payload fails during sync.
   - Failure is persisted in `integration_sync_failures` for the authenticated
     tenant/user context.
   - No `sync_mappings` are created for unauthorized cross-tenant entities.

## Automated coverage

- `tests/Integration/TenantIsolationVerificationTest.php`
  - API resource scope checks.
  - Sync service cross-tenant payload rejection.
  - Integration list/task sync tenant mapping boundaries.
  - Queue path rejection for cross-tenant payloads.
- Existing integration and observability suites were aligned to create
  tenant-owned internal entities before sync execution.
