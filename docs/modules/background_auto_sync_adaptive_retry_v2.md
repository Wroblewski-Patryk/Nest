# Background Auto-Sync with Adaptive Retry/Backoff v2 (NEST-130)

Date: 2026-03-31
Task: `NEST-130`

## Scope

- Add automatic background sync for queued offline actions on web/mobile.
- Add adaptive retry/backoff with deterministic jitter for failed sync items.
- Preserve manual force-sync and manual retry controls.

## Client Behavior

### Web

- File: `apps/web/src/components/offline-sync-card.tsx`
- Auto-sync interval: `15s`.
- Retry model for failed items:
  - exponential backoff from `15s` up to `300s`,
  - deterministic jitter `0..4s` derived from queue item ID and retry count,
  - failed item is retried when `next_retry_at` is due.
- Manual controls preserved:
  - `Force Sync`,
  - `Retry Sync`,
  - queue actions for tasks/calendar/journal.
- Added auto-sync pause/resume control.

### Mobile

- Files:
  - `apps/mobile/app/modal.tsx`
  - `apps/mobile/constants/offlineQueue.ts`
- Auto-sync interval: `15s`.
- Retry model mirrors web:
  - exponential backoff `15s`..`300s`,
  - deterministic jitter `0..4s`,
  - due-time retry via `next_retry_at`.
- Manual controls preserved:
  - `Force Sync`,
  - `Retry Sync`,
  - queue actions for tasks/calendar/journal.
- Added auto-sync pause/resume control.

## Queue Metadata

Queue items now support retry metadata:

- `retry_count`
- `next_retry_at`

## Validation

- `pnpm --dir apps/web test:unit`
- `pnpm --dir apps/mobile test:unit`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`

All checks passed in current implementation cycle.
