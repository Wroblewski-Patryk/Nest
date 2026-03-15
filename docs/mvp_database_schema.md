# MVP Database Schema (NEST-009)

Last updated: 2026-03-15

## Purpose

Define tenant-ready relational schema for MVP modules and provide migration
baseline for implementation.

## Migration Artifacts

- Base auth + tenancy: `apps/api/database/migrations/0001_01_01_000000_create_users_table.php`
- MVP domain schema: `apps/api/database/migrations/2026_03_15_230000_create_mvp_domain_tables.php`

## Tenant Model

- `tenants` is the root isolation boundary.
- Core domain tables include `tenant_id` and required foreign keys.
- Query/index strategy prioritizes composite tenant filters.

## MVP Domain Tables

- `life_areas`
- `projects`
- `task_lists`
- `tasks`
- `habits`
- `habit_logs`
- `routines`
- `routine_steps`
- `goals`
- `targets`
- `journal_entries`
- `journal_entry_life_area` (pivot)
- `calendar_events`
- `sync_mappings` (internal<->external provider mapping baseline)

## Constraint and Index Strategy

- UUID primary keys across tenant and domain entities.
- Foreign keys with explicit cascade/null behavior.
- Composite indexes for key access paths, including:
  - tenant + task status + due date
  - tenant + priority + due date
  - tenant + goal status
  - tenant + calendar start window
  - tenant + sync provider/external id uniqueness

## Verification

- `php artisan migrate:fresh --seed` passes.
- `php artisan test` passes.
