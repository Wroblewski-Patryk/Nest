# Encrypted Local Cache Profile v2 (NEST-133)

Date: 2026-03-31
Task: `NEST-133`

## Scope

- Encrypt offline queue and scheduler cache payloads at rest.
- Add retention and cleanup policy for local cache entries.
- Add secure wipe flow for device-local cache.

## Implementation

### Web

- Files:
  - `apps/web/src/components/offline-sync-card.tsx`
  - `apps/web/src/lib/offline-cache-crypto.ts`
  - `apps/web/src/lib/offline-sync-scheduler.ts`
- Delivered:
  - encrypted localStorage payload profile (`enc.v1:*`),
  - retention cleanup (`NEXT_PUBLIC_NEST_OFFLINE_CACHE_RETENTION_DAYS`,
    default `30`),
  - secure wipe action (`Secure Wipe Cache`) for queue + scheduler state.

### Mobile

- Files:
  - `apps/mobile/constants/offlineCacheCrypto.ts`
  - `apps/mobile/constants/offlineQueue.ts`
  - `apps/mobile/constants/offlineSyncScheduler.ts`
  - `apps/mobile/app/modal.tsx`
- Delivered:
  - encrypted offline cache payload profile (`enc.v1:*`) for queue and
    scheduler state,
  - retention cleanup (`EXPO_PUBLIC_NEST_OFFLINE_CACHE_RETENTION_DAYS`,
    default `30`),
  - secure wipe action (`Secure Wipe Cache`) for queue + scheduler state.

## Retention Policy

- Local cache retention is configurable per client via env var.
- Allowed retention window: `1..365` days.
- Queue size is capped to prevent unbounded growth (`500` entries).

## Secure Wipe

- User-accessible secure wipe removes:
  - offline queue payload,
  - scheduler state payload.
- Intended hook points:
  - explicit logout flow,
  - account removal flow.

## Validation

- `pnpm --dir apps/web test:unit`
- `pnpm --dir apps/mobile test:unit`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`

All checks passed in current cycle.
