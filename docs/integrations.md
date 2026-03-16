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
2. Google Calendar integration after list/task baseline.
3. Obsidian integration at the end of the initial wave.

Current status:

- Google Calendar sync baseline is active via
  `POST /api/v1/integrations/calendar-sync` (`provider=google_calendar`).
- Calendar sync writes audit trail records and flags high-value field changes as
  conflict candidates (`title`, `start_at`, `end_at`, `timezone`, `all_day`).

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

## Security

- Encrypted provider tokens.
- Least-privilege provider scopes.
- Credential rotation and revoke support.

## Contract Versioning

Post-MVP provider contracts follow a dedicated versioning and migration policy:

- `docs/integration_contract_versioning.md`
