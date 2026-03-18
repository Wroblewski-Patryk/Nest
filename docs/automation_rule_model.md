# Automation Rule Model (NEST-056)

Last updated: 2026-03-19

## Purpose

Define the baseline trigger/condition/action model for cross-module automation
and specify execution boundaries for v1.

## Rule Entity (v1)

- `id`
- `tenant_id`
- `user_id`
- `name`
- `status` (`active`, `paused`)
- `trigger` (single trigger definition)
- `conditions[]` (all conditions must pass)
- `actions[]` (ordered actions)
- `created_at`, `updated_at`

## Trigger Model

Supported trigger categories in v1 contract:

- `event`: fire on domain event names (`tasks.task.completed`, etc.)
- `schedule`: fire on cron-like schedule profile (`daily`, `weekly`)
- `metric_threshold`: fire when aggregated metric crosses threshold

Example:

```json
{
  "type": "event",
  "event_name": "tasks.task.completed",
  "debounce_seconds": 120
}
```

## Condition Model

Condition operators:

- `equals`
- `not_equals`
- `contains`
- `greater_than`
- `less_than`
- `in`

Example:

```json
{
  "field": "task.priority",
  "operator": "in",
  "value": ["high", "urgent"]
}
```

## Action Model

Allowed action families in v1:

- `create_task`
- `update_task`
- `schedule_event`
- `log_habit`
- `create_journal_entry`
- `send_notification`

Example:

```json
{
  "type": "create_journal_entry",
  "payload": {
    "title": "Completion reflection",
    "body_template": "Completed: {{task.title}}"
  }
}
```

## Execution Constraints

- Rules are tenant/user scoped by design.
- Max actions per rule: 10.
- Max conditions per rule: 10.
- Action execution is deterministic and ordered.
- Failures must be auditable through run records (`NEST-057+`).

## API Contract Source

- OpenAPI draft: `docs/openapi_automation_rules_v1.yaml`
- Runtime implementation baseline: `docs/automation_engine_v1.md`
