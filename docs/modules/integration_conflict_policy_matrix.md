# Integration Conflict Policy Matrix

Last updated: 2026-03-16

## Purpose

Define deterministic conflict handling per provider and field so manual queue
workflows are predictable and testable.

## Resolution Modes

- `manual_queue`: conflict is added to conflict queue and requires user action
  (`accept` or `override`), with contextual presentation of base value,
  local/offline change, and remote/online change.
  By default, no system recommendation is provided for winner selection.
- `auto_latest_timestamp`: conflict is not queued; latest sync update wins.

## Matrix

### Trello / Google Tasks / Todoist

- `task`
  - `title`: `manual_queue`
  - `due_date`: `manual_queue`
  - `status`: `auto_latest_timestamp`
  - `priority`: `auto_latest_timestamp`
  - `description`: `auto_latest_timestamp`
  - `list_id`: `auto_latest_timestamp`
- `task_list`
  - `name`: `manual_queue`
  - `position`: `auto_latest_timestamp`
  - `color`: `auto_latest_timestamp`

### Google Calendar

- `calendar_event`
  - `title`: `manual_queue`
  - `start_at`: `manual_queue`
  - `end_at`: `manual_queue`
  - `timezone`: `manual_queue`
  - `all_day`: `manual_queue`
  - `description`: `auto_latest_timestamp`
  - `linked_entity_type`: `auto_latest_timestamp`
  - `linked_entity_id`: `auto_latest_timestamp`

### Obsidian

- `journal_entry`
  - `title`: `manual_queue`
  - `entry_date`: `manual_queue`
  - `mood`: `manual_queue`
  - `body`: `auto_latest_timestamp`
  - `life_areas`: `auto_latest_timestamp`

## Enforcement

- Code source of truth:
  - `apps/api/app/Integrations/Services/IntegrationConflictPolicyMatrixService.php`
- Queue enforcement:
  - `apps/api/app/Integrations/Services/IntegrationConflictQueueService.php`
- Tests:
  - `apps/api/tests/Unit/IntegrationConflictPolicyMatrixServiceTest.php`
  - `apps/api/tests/Feature/IntegrationConflictPolicyEnforcementTest.php`
