# Durable Local Sync Scheduler v2 (NEST-131)

Date: 2026-03-31
Task: `NEST-131`

## Scope

- Persist scheduler runtime state across app restarts.
- Deduplicate pending sync jobs before enqueue.
- Add scheduler lag and stuck-job detection signals.

## Implementation

### Web

- New scheduler state helper:
  - `apps/web/src/lib/offline-sync-scheduler.ts`
- Integrated in:
  - `apps/web/src/components/offline-sync-card.tsx`
- Persisted scheduler fields:
  - `auto_sync_enabled`,
  - `last_run_at`,
  - `last_success_at`,
  - `consecutive_failures`,
  - `scheduler_lag_seconds`,
  - `stuck_detected`,
  - `stuck_reason`,
  - `last_error`.
- Queue deduplication:
  - skip enqueue when same action already exists in `pending` state.

### Mobile

- New scheduler state helper:
  - `apps/mobile/constants/offlineSyncScheduler.ts`
- Integrated in:
  - `apps/mobile/app/modal.tsx`
  - `apps/mobile/constants/offlineQueue.ts`
- Same persisted scheduler fields and deduplication behavior as web.

## Monitoring Signals

- Scheduler lag:
  - seconds from now to oldest non-synced queue item.
- Stuck detection:
  - lag threshold breach (`>= 600s`) or
  - retry threshold breach (`retry_count >= 5`).
- Signal exposure:
  - status text in sync UI on web/mobile.

## Validation

- `pnpm --dir apps/web test:unit`
- `pnpm --dir apps/mobile test:unit`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`

All checks passed in current cycle.
