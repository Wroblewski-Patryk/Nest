# In-App Notification Center with Actionable Events v2 (NEST-137)

## Scope

`NEST-137` delivers a first-class in-app notification center across API, web,
and mobile so users can:
- review grouped activity,
- act on pending items (`read`, `unread`, `snooze`),
- navigate directly to relevant module context.

## Data model

New table:
- `in_app_notifications`
  - `tenant_id`, `user_id`
  - `event_type`, `title`, `body`
  - `module`, `entity_type`, `entity_id`, `deep_link`
  - `payload` (JSON)
  - `is_read`, `read_at`, `snoozed_until`

Migration:
- `apps/api/database/migrations/2026_03_31_140000_create_in_app_notifications_table.php`

## API surface

New endpoints:
- `GET /api/v1/notifications/in-app`
- `POST /api/v1/notifications/in-app/{notificationId}/read`
- `POST /api/v1/notifications/in-app/{notificationId}/unread`
- `POST /api/v1/notifications/in-app/{notificationId}/snooze`

Behavior:
- list endpoint supports `per_page`, `unread_only`, `include_snoozed`, and
  `module` filters,
- response contains grouped summary (`groups`) and unread totals (`meta`),
- mutation endpoints are strictly tenant/user-scoped.

Controller:
- `apps/api/app/Http/Controllers/Api/InAppNotificationController.php`

## Event generation

In-app notifications are created during:
- task assignment/handoff/reminder-owner updates,
- calendar event assignment/handoff/reminder-owner updates,
- successful mobile push reminder delivery.

Updated services/controllers:
- `apps/api/app/Http/Controllers/Api/TaskController.php`
- `apps/api/app/Http/Controllers/Api/CalendarEventController.php`
- `apps/api/app/Notifications/Services/MobilePushReminderService.php`
- `apps/api/app/Notifications/Services/InAppNotificationService.php`

## Client parity

Web:
- Notification Center panel on dashboard with grouped items and actions.
- File: `apps/web/src/components/notification-center-card.tsx`

Mobile:
- Notification center section in options modal with action controls and module
  deep-link routing to tab contexts.
- File: `apps/mobile/app/modal.tsx`

Shared client/types:
- `packages/shared-types/src/client.js`
- `packages/shared-types/src/client.d.ts`
- `packages/shared-types/src/index.d.ts`

## Contract updates

OpenAPI contract extended with notification-center endpoints and schemas:
- `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`

## Validation

Backend:
- `php artisan test --filter "InAppNotificationCenterApiTest|TasksAndListsApiTest|CalendarEventsApiTest|MobilePushReminderCommandTest"`

Frontend:
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`
