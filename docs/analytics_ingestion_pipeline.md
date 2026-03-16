# Analytics Ingestion Pipeline (Phase 3 Baseline)

Last updated: 2026-03-16

## Purpose

Provide validated analytics event ingestion, durable storage, and retention
operations for Phase 3 insights work.

Life-area scoring baseline that consumes this pipeline is defined in:

- `docs/life_area_balance_score_model.md`

## Ingestion API

- Endpoint: `POST /api/v1/analytics/events`
- Auth: `auth:sanctum`
- Payload: batch of events (`events[]`) up to configured max size.
- Validation:
  - required envelope fields (`event_name`, `event_version`, `occurred_at`,
    `platform`, `module`),
  - allowlisted platforms/modules/event names from taxonomy config,
  - event-level rejection with validation error response.

## Storage

- Table: `analytics_events`
- Key columns:
  - tenant/user scope
  - name/version/platform/module
  - session/trace IDs
  - properties JSON
  - `occurred_at`, `received_at`
- Indexes:
  - tenant + occurred_at
  - tenant + module + occurred_at
  - tenant + event_name + occurred_at

## Monitoring

- Ingestion counters:
  - `analytics.events.ingested`
  - `analytics.events.rejected`

## Retention Policy

- Config: `ANALYTICS_RETENTION_DAYS` (default `180`)
- Command:
  - `php artisan analytics:prune-events`
  - `php artisan analytics:prune-events --days=<n>`
- Prunes events older than the retention window.
