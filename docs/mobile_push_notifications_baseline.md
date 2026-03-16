# Mobile Push Notifications Baseline

## Purpose

Deliver the first operational mobile push notification step for key reminders.

## Scope (Phase 2)

Current reminder scope is intentionally narrow:

- `task_due_today`: first not-done task due today for a user
- `calendar_upcoming`: first calendar event starting within next 60 minutes

This baseline does not yet include rich scheduling policies, batching strategy,
or user preference center.

## API

Authenticated user routes:

- `GET /api/v1/notifications/mobile/devices`
- `POST /api/v1/notifications/mobile/devices`
- `DELETE /api/v1/notifications/mobile/devices/{deviceId}`

Device tokens are stored encrypted at rest with deterministic token hash for
safe upsert/deduplication.

## Dispatch Operation

Command:

```bash
php artisan notifications:send-mobile-reminders
php artisan notifications:send-mobile-reminders --tenant=<tenant-id>
php artisan notifications:send-mobile-reminders --json
```

Current gateway is a log-backed adapter for safe baseline operation.

## Delivery Monitoring

- Delivery ledger table: `mobile_push_deliveries`
- Metrics:
  - `notifications.push.sent`
  - `notifications.push.failed`
- Structured dispatch logs include reminder payload metadata and token hash.
