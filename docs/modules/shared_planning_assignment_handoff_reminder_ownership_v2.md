# Shared Planning Assignment, Handoff, and Reminder Ownership v2 (NEST-136)

## Scope

`NEST-136` introduces assignment workflows for shared planning objects with
explicit reminder ownership and auditable handoff history.

Covered entities:
- `tasks`
- `calendar_events`

## Data model updates

- `tasks`
  - `assignee_user_id` (nullable FK users)
  - `reminder_owner_user_id` (nullable FK users)
- `calendar_events`
  - `assignee_user_id` (nullable FK users)
  - `reminder_owner_user_id` (nullable FK users)
- `assignment_timelines`
  - generic assignment/handoff log for `task|calendar_event`,
  - action types: `assigned`, `handoff`, `reminder_owner_changed`,
  - from/to actor tracking + optional handoff note.

Migration:
- `apps/api/database/migrations/2026_03_31_120000_add_assignment_workflow_columns.php`

## API surface

- Existing update flows now support:
  - `assignee_user_id`
  - `reminder_owner_user_id`
  - `handoff_note`
- New timeline endpoints:
  - `GET /api/v1/tasks/{taskId}/assignment-timeline`
  - `GET /api/v1/calendar-events/{eventId}/assignment-timeline`

## Assignment rules

- Shared task assignment:
  - assignee and reminder owner must be active members of the linked
    collaboration space.
- Private task assignment:
  - assignee/reminder owner restricted to list owner.
- Calendar event assignment:
  - assignee/reminder owner must belong to the same tenant.

## Reminder ownership behavior

Mobile reminder dispatch now resolves recipients by explicit ownership:

1. `reminder_owner_user_id`
2. fallback: `assignee_user_id` (legacy null-owner compatibility)
3. fallback: creator `user_id` (legacy compatibility)

Updated service:
- `apps/api/app/Notifications/Services/MobilePushReminderService.php`

## Validation coverage

- `apps/api/tests/Feature/TasksAndListsApiTest.php`
  - shared assignment + handoff + timeline assertions.
- `apps/api/tests/Feature/CalendarEventsApiTest.php`
  - event assignment + handoff + timeline assertions.
- `apps/api/tests/Feature/MobilePushReminderCommandTest.php`
  - reminder ownership recipient routing assertions.

## Shared contract updates

- Shared client/types include assignment fields and timeline payload methods:
  - `packages/shared-types/src/client.js`
  - `packages/shared-types/src/client.d.ts`
  - `packages/shared-types/src/index.d.ts`
