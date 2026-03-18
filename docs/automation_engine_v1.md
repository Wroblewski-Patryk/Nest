# Automation Engine v1 (NEST-057)

Last updated: 2026-03-19

## Purpose

Execute tenant-scoped automation rules against allowed action set and persist
execution audits.

## API Surface

- Rules:
  - `GET /api/v1/automations/rules`
  - `POST /api/v1/automations/rules`
  - `GET /api/v1/automations/rules/{ruleId}`
  - `PATCH /api/v1/automations/rules/{ruleId}`
  - `DELETE /api/v1/automations/rules/{ruleId}`
  - `POST /api/v1/automations/rules/{ruleId}/execute`
- Runs:
  - `GET /api/v1/automations/runs`
  - `GET /api/v1/automations/runs/{runId}`
  - `POST /api/v1/automations/runs/{runId}/replay`

## Execution Flow

1. Create run record with `status=running`.
2. Validate rule state (`active`) and evaluate all conditions.
3. Execute actions sequentially (deterministic order).
4. Persist action results + final status (`success|skipped|failed`) in run log.

Replay flow:

- Reuses original `trigger_payload` from selected run.
- Produces a new run record with full audit trail.

## Allowed Action Set (v1)

- `create_task`
- `update_task`
- `schedule_event`
- `log_habit`
- `create_journal_entry`
- `send_notification` (simulated delivery in v1)

## Storage

- `automation_rules`
  - trigger/conditions/actions JSON payloads
  - tenant/user scoped
- `automation_runs`
  - trigger payload
  - action results audit
  - status + error metadata + timing fields

## Notes

- Rule and run queries are tenant/user scoped.
- Unsupported action types are rejected at validation layer.
- Detailed contract baseline: `docs/openapi_automation_rules_v1.yaml`.
