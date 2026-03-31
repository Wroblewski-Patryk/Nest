# Shared Household Workspace Operations v2 (NEST-135)

## Scope

`NEST-135` extends collaboration spaces to support explicit household/friends
role semantics and policy-enforced shared-object permissions.

## Role model

- `owner`
  - manages membership lifecycle (invite, role update, remove),
  - can share lists/goals to the space,
  - can read/write shared resources.
- `editor`
  - can read/write shared lists, tasks, goals, and targets,
  - cannot manage membership lifecycle.
- `viewer`
  - read-only access to shared lists/goals and related details,
  - cannot mutate shared lists/tasks/goals/targets.

Backward compatibility:
- legacy `member` records are treated as editor-level for write permissions.

## API surface updates

- Existing:
  - `POST /api/v1/collaboration/spaces/{spaceId}/invites`
    - `role` now supports `editor|viewer` (default `editor`).
- New:
  - `GET /api/v1/collaboration/spaces/{spaceId}/members`
  - `PATCH /api/v1/collaboration/spaces/{spaceId}/members/{memberUserId}`
  - `DELETE /api/v1/collaboration/spaces/{spaceId}/members/{memberUserId}`

OpenAPI contract updated in:
- `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`

## Policy enforcement

Policy-layer authorization is now explicit for shared collaboration resources:

- `TaskListPolicy`
- `TaskPolicy`
- `GoalPolicy`

Controllers now authorize read/write actions through policies for:
- lists, tasks, goals, and goal targets (through goal policy checks).

## Validation and boundary audit coverage

- `apps/api/tests/Feature/CollaborationSpacesApiTest.php`
  - viewer read-only boundary checks (`403` on write),
  - owner role-promotion flow (`viewer` -> `editor`) with successful writes,
  - non-owner membership-management denial checks (`404`),
  - existing private-vs-shared visibility boundaries retained.

## Notes

- Manual two-account device smoke remains recommended before production rollout,
  but automated API role/boundary coverage is now in place for release gating.
