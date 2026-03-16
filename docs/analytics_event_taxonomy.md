# Analytics Event Taxonomy (Phase 3, v1)

Last updated: 2026-03-16

## Purpose

Define a canonical analytics event dictionary across core modules for Phase 3
instrumentation and insights pipelines.

## Envelope (Required Fields)

Every event must include:

- `event_name` (snake_case)
- `event_version` (semantic, starting at `1.0`)
- `occurred_at` (ISO-8601 UTC)
- `tenant_id`
- `user_id`
- `session_id` (nullable for server-originated events)
- `platform` (`web` | `mobile` | `api` | `system`)
- `module` (`tasks` | `habits` | `goals` | `journal` | `calendar` | `integrations`)
- `trace_id` (optional, propagated when available)
- `properties` (object, event-specific payload)

## Naming Rules

- Format: `<module>.<entity>.<action>`
- Examples:
  - `tasks.task.created`
  - `calendar.event.rescheduled`
  - `integrations.sync.completed`

## Core Event Set (v1)

### Tasks / Lists

- `tasks.list.created`
- `tasks.list.updated`
- `tasks.task.created`
- `tasks.task.completed`
- `tasks.task.reopened`
- `tasks.task.deleted`

### Habits / Routines

- `habits.habit.created`
- `habits.habit.logged`
- `habits.habit.paused`
- `habits.routine.created`
- `habits.routine.executed`

### Goals / Targets

- `goals.goal.created`
- `goals.goal.status_changed`
- `goals.target.created`
- `goals.target.progress_updated`

### Journal / Life Areas

- `journal.entry.created`
- `journal.entry.updated`
- `journal.entry.deleted`
- `journal.life_area.weight_changed`

### Calendar

- `calendar.event.created`
- `calendar.event.updated`
- `calendar.event.deleted`
- `calendar.event.linked_entity_changed`

### Integrations

- `integrations.connection.connected`
- `integrations.connection.revoked`
- `integrations.sync.started`
- `integrations.sync.completed`
- `integrations.sync.failed`
- `integrations.conflict.detected`
- `integrations.conflict.resolved`

## Event Quality Constraints

- No PII in `properties` unless explicitly approved and documented.
- IDs only; avoid free-form raw content fields where possible.
- Event producers must be idempotent for retries.
- Breaking envelope/property changes require version bump and migration note.

## Rollout Notes

- This taxonomy is the source for:
  - ingestion contracts (`NEST-047`),
  - trends/insights APIs (`NEST-049`),
  - AI planning signal inputs (`NEST-051+`).
