# Organization Audit Export Package (NEST-074)

## Scope

- Added organization compliance export endpoint for security-sensitive events.
- Added export formats:
  - `json`
  - `csv`

## API

- `GET /api/v1/orgs/{organizationId}/audit-exports`
- Query:
  - `format=json|csv` (default `json`)
  - `from` (optional date filter)
  - `to` (optional date filter)

Authorization:

- org RBAC permission `org.audit.export` (`owner`, `admin`).

## Included Event Sources

- Organization membership changes:
  - `org.member.added`
  - `org.member.updated`
- Organization SSO provider lifecycle:
  - `org.sso.provider.created`
  - `org.sso.provider.updated`
- Organization SSO identity links:
  - `org.sso.identity.linked`
- Tenant lifecycle compliance events:
  - `tenant.lifecycle.*` (from tenant lifecycle audit log)

## Export Schema

- `event_name`
- `occurred_at`
- `severity`
- `actor_user_id`
- `entity_type`
- `entity_id`
- `payload`

CSV includes `payload_json` as serialized JSON.

## Test Coverage

- `apps/api/tests/Feature/OrganizationAuditExportApiTest.php`
  - owner can export JSON,
  - owner can export CSV,
  - member cannot export.
