# Notification Channel Matrix (Push/Email/In-App) v2 (NEST-138)

## Scope

`NEST-138` introduces user-configurable notification channel routing with:
- global channel preferences (`push`, `email`, `in_app`),
- per-event channel overrides,
- quiet-hours suppression windows with timezone/locale-aware defaults,
- unified delivery telemetry with explicit failure/suppression reasons.

## Data model

New tables:
- `notification_preferences`
  - channel toggles, per-event overrides, quiet-hours settings, locale
- `notification_channel_deliveries`
  - per-channel delivery attempt/suppression log with status and reason

Migration:
- `apps/api/database/migrations/2026_03_31_160000_create_notification_preferences_and_channel_deliveries_tables.php`

## API surface

New endpoints:
- `GET /api/v1/notifications/preferences`
- `PATCH /api/v1/notifications/preferences`
- `GET /api/v1/notifications/deliveries`

Updated endpoints:
- existing notification center endpoints remain active (`/notifications/in-app/*`)
  and now operate under channel-matrix dispatch rules.

## Runtime behavior

New services:
- `NotificationPreferenceService` (effective channel matrix + quiet-hours policy)
- `NotificationChannelMatrixDispatcher` (channel decision + dispatch)
- `MobilePushChannelService` (push dispatch + `mobile_push_deliveries` persistence)
- `EmailNotificationService` (email channel dispatch)
- `NotificationChannelTelemetryService` (unified delivery telemetry log)

Dispatch integration points:
- task assignment/handoff/reminder-owner events
  (`TaskController`)
- calendar assignment/handoff/reminder-owner events
  (`CalendarEventController`)
- reminder command events (`task_due_today`, `calendar_upcoming`)
  via `MobilePushReminderService`

Quiet-hours policy:
- applied to `push` and `email`,
- `in_app` remains immediate (not suppressed),
- locale-aware default windows:
  - `pl*` -> `21:00-06:00`
  - others -> `22:00-07:00`

## Client parity

Web:
- added notification preferences panel and telemetry preview:
  - `apps/web/src/components/notification-channel-matrix-card.tsx`
  - `apps/web/src/app/page.tsx`

Mobile:
- added notification matrix controls and telemetry section in options modal:
  - `apps/mobile/app/modal.tsx`

Shared client/types:
- `packages/shared-types/src/client.js`
- `packages/shared-types/src/client.d.ts`
- `packages/shared-types/src/index.d.ts`

## Contracts

Updated OpenAPI notifications contract:
- `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`

## Validation

- `php artisan test --filter "NotificationChannelMatrixApiTest|InAppNotificationCenterApiTest|TasksAndListsApiTest|CalendarEventsApiTest|MobilePushReminderCommandTest"`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`
- `pnpm --package=@redocly/cli dlx redocly lint docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`
