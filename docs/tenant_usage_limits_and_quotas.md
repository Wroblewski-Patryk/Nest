# Tenant Usage Limits and Quotas (NEST-063)

## Scope

`NEST-063` introduces per-tenant quota enforcement for create flows in core API
resources with clear user-facing errors.

## Configuration

- File: `apps/api/config/tenant_usage_limits.php`
- Resource map defines:
  - model used for current usage counting,
  - hard limit per tenant.

## Enforcement model

- Middleware: `App\Http\Middleware\EnforceTenantUsageQuota`
  - attached to authenticated API group via `tenant.usage` alias,
  - checks only `POST` create endpoints,
  - maps request path to quota resource key.
- Service: `App\Tenancy\Services\TenantUsageQuotaService`
  - computes tenant usage count (`where tenant_id = ?`),
  - blocks when current count reaches configured limit.

## User-facing errors

- Exception: `App\Tenancy\Exceptions\TenantQuotaExceededException`
- API response for exceeded quota:
  - HTTP `429`,
  - `error.code = tenant_quota_exceeded`,
  - payload includes `resource`, `limit`, and `current`.

## Covered create endpoints

- `POST /api/v1/lists`
- `POST /api/v1/tasks`
- `POST /api/v1/habits`
- `POST /api/v1/habits/{habitId}/logs`
- `POST /api/v1/routines`
- `POST /api/v1/goals`
- `POST /api/v1/targets`
- `POST /api/v1/life-areas`
- `POST /api/v1/journal-entries`
- `POST /api/v1/calendar-events`
- `POST /api/v1/automations/rules`

## Validation coverage

- `tests/Feature/TenantUsageLimitApiTest.php`
  - verifies tenant-scoped enforcement,
  - verifies clear and consistent quota error payload.
