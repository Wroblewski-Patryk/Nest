# Organization and Workspace Domain Model (NEST-070)

## Scope

`NEST-070` adds organization/workspace domain primitives as tenant-scoped
entities with membership baseline.

## Data model

- `organizations`
  - tenant owner, name/slug, status.
- `organization_members`
  - role/status per user in organization.
- `workspaces`
  - organization-scoped work context with default flag.
- `workspace_members`
  - role/status per user in workspace.

Migration:
- `apps/api/database/migrations/2026_03_19_160000_create_organization_workspace_tables.php`

## API baseline

- `GET /api/v1/orgs`
- `POST /api/v1/orgs`
- `POST /api/v1/orgs/{organizationId}/members`
- `GET /api/v1/workspaces`
- `POST /api/v1/workspaces`

## Behavior

- organization creator becomes owner member automatically.
- workspace creation is allowed for owner/admin organization users.
- active organization members are projected into workspace membership on create.
- all routes are tenant-scoped and authenticated.

## Validation coverage

- `tests/Feature/OrganizationWorkspaceDomainApiTest.php`
  - organization create/member add/workspace create flow,
  - member visibility on org/workspace lists,
  - tenant isolation and guest protection.
