# Integration Near-Real-Time Sync Triggers V2 (NEST-147)

Last updated: 2026-03-31

## Goal

Enable provider webhook/event ingestion paths for near-real-time sync while
preserving deterministic replay protection and operational visibility.

## Delivered Scope

- New event ingestion API endpoints:
  - `POST /api/v1/integrations/events/{provider}/ingest`
  - `GET /api/v1/integrations/events/ingestions`
- Supported event providers in this wave:
  - `trello`
  - `todoist`
  - `google_calendar`
  - `clickup`
  - `microsoft_todo`
- Event ingestion persistence:
  - table: `integration_event_ingestions`
  - model: `IntegrationEventIngestion`
- Event ingestion orchestration service:
  - `App\Integrations\Services\IntegrationEventIngestionService`
- Queue job lifecycle linkage:
  - ingestions are marked `processed` after successful sync job execution,
  - ingestions are marked `dropped` with `drop_reason=queue_job_failed` when
    queued sync processing fails.

## Deduplication and Replay Protection

- A strict unique key enforces replay safety:
  - `(tenant_id, user_id, provider, event_id)`
- Duplicate replay behavior:
  - duplicate event returns `status=duplicate`,
  - no new job is enqueued,
  - replay-protection flag is returned in API payload.

## Monitoring and Alert Signals

Near-real-time ingestion metrics:

- `integration.events.received`
- `integration.events.duplicate`
- `integration.events.dropped`
- `integration.events.lag.count`
- `integration.events.lag.sum_ms`
- latency buckets: `integration.events.lag.bucket_*`

Alert thresholds are configurable in:

- `apps/api/config/observability.php`
- `.env` keys:
  - `INTEGRATION_EVENT_ALERT_WARNING_DROP_RATE_ABOVE_PERCENT`
  - `INTEGRATION_EVENT_ALERT_WARNING_AVG_LAG_MS_ABOVE`
  - `INTEGRATION_EVENT_ALERT_CRITICAL_DROP_RATE_ABOVE_PERCENT`
  - `INTEGRATION_EVENT_ALERT_CRITICAL_AVG_LAG_MS_ABOVE`

Operational check command:

- `php artisan integrations:event-ingestion-stats --json`
- strict gate: `php artisan integrations:event-ingestion-stats --json --strict`

## Validation

- Automated:
  - `php artisan test --filter "IntegrationEventIngestionApiTest|IntegrationEventIngestionStatsCommandTest"` (PASS)
  - `pnpm --dir apps/web build` (PASS)
  - `pnpm --dir apps/mobile test:smoke` (PASS)
  - `pnpm --dir apps/api run openapi:lint` (PASS)
- Manual:
  - webhook replay simulation via repeated ingest call (PASS)
  - ingestion list and lag metrics review via command output (PASS)

## Known Limits

- Provider signature verification and webhook secret rotation remain provider
  specific and are tracked in follow-up reliability/health tasks.
- Event payload schema validation currently enforces contract baseline fields
  and accepts provider-specific payload details as flexible object metadata.
