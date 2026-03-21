# Entitlement Enforcement Across API and Tools (NEST-069)

## Scope

`NEST-069` enforces plan entitlements in API execution paths for feature gates
and usage limits tied to active tenant subscription.

## Enforcement layer

- Middleware: `App\Http\Middleware\EnforceBillingEntitlements`
- Service: `App\Billing\Services\EntitlementService`
- Applied to authenticated API group (`auth:sanctum`) via `entitlements` alias.

Behavior:

- if tenant has no subscription -> no entitlement blocking (compatibility mode),
- if tenant has subscription -> entitlement rules are enforced.

## Enforced entitlements

- `automation.rules.max`
  - blocks `POST /api/v1/automations/rules` with HTTP `403` when limit reached.
  - response code: `entitlement_limit_exceeded`.
- `ai.weekly_planning.enabled`
  - gates `POST /api/v1/ai/weekly-plan/propose`.
- `ai.feedback.enabled`
  - gates `POST /api/v1/ai/feedback`.
  - denied feature response code: `entitlement_denied`.

## Error payload contract

- limit exceeded:
  - `error.code = entitlement_limit_exceeded`
  - includes `entitlement`, `limit`, `current`
- feature denied:
  - `error.code = entitlement_denied`
  - includes `entitlement`

## Validation coverage

- `tests/Feature/EntitlementEnforcementApiTest.php`
  - automation rule limit enforcement,
  - AI route feature gate enforcement.
