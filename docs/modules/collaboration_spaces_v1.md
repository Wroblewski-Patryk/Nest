# Collaboration Spaces v1 (NEST-064)

Follow-up expansion:
- `NEST-135` role and policy extension is documented in
  `docs/modules/shared_household_workspace_operations_v2.md`.

## Scope

`NEST-064` introduces invite-based family/friends collaboration spaces with
shared plans/lists and co-management boundaries.

Assumption for this baseline:
- "plans" are represented by `goals`.

## Data model

- `collaboration_spaces`
  - tenant-scoped collaboration container with owner and status.
- `collaboration_space_members`
  - active membership records per user and space.
- `collaboration_invites`
  - invite token lifecycle (`pending` -> `accepted`) with expiry.
- Shared visibility columns on:
  - `task_lists` (`visibility`, `collaboration_space_id`)
  - `goals` (`visibility`, `collaboration_space_id`)

## API endpoints

- `GET /api/v1/collaboration/spaces`
- `POST /api/v1/collaboration/spaces`
- `POST /api/v1/collaboration/spaces/{spaceId}/invites`
- `POST /api/v1/collaboration/invites/{token}/accept`
- `POST /api/v1/collaboration/spaces/{spaceId}/share/lists/{listId}`
- `POST /api/v1/collaboration/spaces/{spaceId}/share/goals/{goalId}`

## Permission boundaries

- Private resources (`visibility=private`) remain owner-only.
- Shared resources (`visibility=shared`) are visible/editable to active members
  of the linked space.
- Sharing and inviting are owner-only space actions.
- Non-members receive `404` for hidden shared resources.

## Co-management coverage

- Shared lists:
  - members can read/update shared list,
  - members can create tasks in shared list.
- Shared goals:
  - members can read shared goal,
  - members can create/manage targets under shared goal.

## Validation coverage

- `tests/Feature/CollaborationSpacesApiTest.php`
  - invite + accept flow,
  - shared list co-management,
  - shared goal access and target management,
  - private-vs-shared boundary checks.
