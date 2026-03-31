# Integrations

## Purpose

Integrations synchronize external systems with Nest while Nest remains the
source of truth for internal life structure.

## Provider Strategy

Nest should support multiple providers per functional area over time
(up to 3 major providers per area where practical).

## Initial Sequence

1. List/task integrations first:
   - Trello
   - Google Tasks (Google To Do)
   - Todoist (selected as current demand-driven third provider)
   - ClickUp (next-wave demand-selected provider)
   - Microsoft To Do (next-wave demand-selected provider)
2. Google Calendar integration after list/task baseline.
3. Obsidian integration at the end of the initial wave.

Current status:

- Google Calendar sync baseline is active via
  `POST /api/v1/integrations/calendar-sync` (`provider=google_calendar`).
- Calendar sync writes audit trail records and flags high-value field changes as
  conflict candidates (`title`, `start_at`, `end_at`, `timezone`, `all_day`).
- Obsidian sync baseline is active via
  `POST /api/v1/integrations/journal-sync` (`provider=obsidian`) for journal
  markdown note export with audit trail metadata.
- Conflict queue workflows are active via:
  - `GET /api/v1/integrations/conflicts`
  - `POST /api/v1/integrations/conflicts/{conflictId}/resolve`
  supporting `accept` and `override` resolution actions.
- Failed sync replay tooling is active via:
  - `GET /api/v1/integrations/failures`
  - `POST /api/v1/integrations/failures/{failureId}/replay`
  with tenant/user scoping and replay idempotency key rotation.
- Provider connection management is active via:
  - `GET /api/v1/integrations/connections`
  - `PUT /api/v1/integrations/connections/{provider}`
  - `DELETE /api/v1/integrations/connections/{provider}`
  with tenant/user-scoped connect, reconnect, and revoke flows.
  - Web and mobile screens show granted scopes and least-privilege warnings
    when extra or missing permissions are detected.
- Integration marketplace catalog management is active via:
  - `GET /api/v1/integrations/marketplace/providers`
  - `POST /api/v1/integrations/marketplace/providers/{provider}/install`
  - `POST /api/v1/integrations/marketplace/providers/{provider}/uninstall`
  - `GET /api/v1/integrations/marketplace/audits`
  with provider metadata/status exposure and auditable reversible
  install/uninstall lifecycle.
  - Detailed contract:
    `docs/modules/integration_marketplace_framework_v2.md`.
- Next-wave provider rollout details (demand scoring, caveats, limits):
  - `docs/modules/next_wave_provider_rollout_v2.md`.
- Near-real-time event ingestion is active via:
  - `POST /api/v1/integrations/events/{provider}/ingest`
  - `GET /api/v1/integrations/events/ingestions`
  with deduplication/replay protection and ingestion lag/drop monitoring.
  - Detailed contract:
    `docs/modules/integration_near_real_time_sync_triggers_v2.md`.
- Integration health center is active via:
  - `GET /api/v1/integrations/health`
  - `POST /api/v1/integrations/health/{provider}/remediate`
  with provider health scoring, one-click replay remediation, and guided
  reconnect flows.
  - Detailed contract:
    `docs/modules/integration_health_center_remediation_playbooks_v2.md`.
  - Provider incident runbooks:
    `docs/operations/integration_health_center_provider_incident_playbooks_v2.md`.

## Integration Data Model

Each synchronized object stores:

- provider
- external_id
- internal_entity_type
- internal_entity_id
- last_sync_at
- last_sync_status
- sync_version/hash

## Sync Rules

- Pull external changes on schedule and by webhook (where available).
- Push internal updates asynchronously by queue.
- All write operations must be idempotent.
- Every failed sync stores error code + provider payload reference.

## Conflict Policy (MVP)

- Timestamp-based conflict resolution for low-risk fields.
- Manual resolution queue for high-value fields (title, due date,
  recurrence pattern).
- Sync actions are traceable in audit logs.
- Deterministic provider/field matrix:
  - `docs/modules/integration_conflict_policy_matrix.md`

## Sync SLOs and Alerts

- Sync reliability targets and alert thresholds are defined in:
  - `docs/modules/integration_sync_slos.md`
- Runtime SLO evaluation command:
  - `php artisan integrations:sync-slo-check`
- Near-real-time ingestion lag/drop monitoring command:
  - `php artisan integrations:event-ingestion-stats`

## Security

- Encrypted provider tokens.
- Least-privilege provider scopes.
- Credential rotation and revoke support.

## Contract Versioning

Post-MVP provider contracts follow a dedicated versioning and migration policy:

- `docs/engineering/integration_contract_versioning.md`

## Regression Suite

- Provider end-to-end regression coverage and CI execution are defined in:
  - `docs/engineering/integration_regression_suite.md`

## Failed Sync Replay

- Failed queue jobs are persisted in `integration_sync_failures` as replayable
  records.
- Replays execute through the same sync service path with a derived
  idempotency key (`{original}:replay:{n}`) to keep retries deterministic.
- Replay metadata (`replay_count`, last replay status/error/time, last replay
  idempotency key) is stored for operational traceability.

