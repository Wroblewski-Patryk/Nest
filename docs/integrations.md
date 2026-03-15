# Integrations

## Purpose

Integrations synchronize external systems with Nest while Nest remains the
source of truth for internal life structure.

## Initial Providers

- ClickUp: task/project synchronization.
- Google Calendar: event sync and time blocking.
- Microsoft To Do: simple list/task sync.
- Obsidian: markdown note synchronization.

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