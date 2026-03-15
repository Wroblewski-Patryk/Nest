# Backup and Restore Drill (MVP)

Last updated: 2026-03-16

## Scope

- Environment: local development (`apps/api`, SQLite)
- Objective: verify backup snapshot integrity and restore viability
- Data domain: tenant + reference dictionaries baseline

## Drill Execution (2026-03-16)

### 1) Baseline snapshot

- Command: `php artisan migrate:fresh --seed`
- Result: migrations + baseline seed completed successfully.

### 2) Backup creation

- Backup path:
  `apps/api/database/backups/drill/database-20260316-004810.sqlite`
- Source SHA256:
  `FB00C54B3F1F9BFADEBC7ED7309A970011A03E7A2C33C2D6BD67953E73D817DB`
- Backup SHA256:
  `FB00C54B3F1F9BFADEBC7ED7309A970011A03E7A2C33C2D6BD67953E73D817DB`
- Integrity check: PASS (hash match)

### 3) Failure simulation

- Command: `php artisan migrate:fresh`
- Validation command (tenant count script): returned `0`
- Interpretation: simulated data-loss state confirmed.

### 4) Restore

- Action: restored database file from backup snapshot to
  `apps/api/database/database.sqlite`.
- Validation command (tenant count script): returned `1`
- Interpretation: baseline tenant data restored successfully.

## Outcomes

- Backup creation: PASS
- Restore execution: PASS
- Integrity validation: PASS

## Recovery Metrics

- Estimated RPO: near-zero for file snapshot (point-in-time at backup creation)
- Observed RTO (local drill): under 5 minutes end-to-end

## Follow-ups

- Repeat drill on staging PostgreSQL environment with production-like volumes.
- Automate periodic backup verification and checksum logging.
- Extend restore validation with domain row-count checks (tasks, goals, habits,
  calendar events).
