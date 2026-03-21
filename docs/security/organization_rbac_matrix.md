# Organization RBAC Matrix (NEST-071)

## Scope

`NEST-071` introduces role-based policy enforcement for organization/workspace
API flows.

## Roles

- `owner`
- `admin`
- `member`

## Permission matrix

- `org.view`
  - owner, admin, member
- `org.members.create`
  - owner
- `org.members.update_role`
  - owner
- `workspace.create`
  - owner, admin

## Enforcement implementation

- Policy service:
  - `App\Organization\Services\OrganizationRbacService`
- API controller integration:
  - `OrganizationWorkspaceController`

## API surface with RBAC checks

- `POST /api/v1/orgs/{organizationId}/members` (owner only)
- `PATCH /api/v1/orgs/{organizationId}/members/{memberUserId}` (owner only)
- `POST /api/v1/workspaces` (owner/admin)

## Validation coverage

- `tests/Feature/OrganizationRbacApiTest.php`
  - admin denied member management,
  - admin allowed workspace creation,
  - member denied workspace creation,
  - owner role update allows promoted user to create workspace.
