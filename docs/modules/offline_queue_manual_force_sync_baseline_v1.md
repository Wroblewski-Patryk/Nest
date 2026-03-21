# Offline Queue and Manual Force-Sync Baseline v1 (NEST-111)

Date: 2026-03-21
Task: `NEST-111`

## Delivered Baseline

- Local offline queue support in clients:
  - Web: localStorage-backed queue in `apps/web/src/components/offline-sync-card.tsx`
  - Mobile: local queue helper in `apps/mobile/constants/offlineQueue.ts`
- Manual force-sync controls available in settings/options surfaces:
  - Web: `Sync Options` panel on home page
  - Mobile: `Sync Options` section in `app/modal.tsx`
- Sync execution rules implemented:
  - process queue oldest-first,
  - stop on first error,
  - expose clear error reason (HTTP status) in UI feedback.

## Sync Actions

- List/tasks sync -> `POST /api/v1/integrations/list-task-sync`
- Calendar sync -> `POST /api/v1/integrations/calendar-sync`
- Journal sync -> `POST /api/v1/integrations/journal-sync`

## Validation

- `pnpm --dir apps/web build` (PASS)
- `pnpm --dir apps/mobile exec expo export --platform web` (PASS)
