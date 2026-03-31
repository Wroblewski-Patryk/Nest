# Delegated AI API Credentials v1

## Scope

`NEST-164` introduces user-issued delegated API credentials for AI automation
with:

- least-privilege scoped abilities,
- explicit expiry (`expires_at`),
- explicit revoke controls,
- deterministic denial of revoked/expired credentials.

## Delivered API

- `GET /api/v1/auth/delegated-credentials`
  - Lists active and historical delegated credentials for current user.
- `POST /api/v1/auth/delegated-credentials`
  - Issues delegated credential with `name`, `scopes[]`, optional `expires_at`.
  - Returns one-time `plain_text_token`.
- `POST /api/v1/auth/delegated-credentials/{credentialId}/revoke`
  - Revokes credential in-place (`revoked_at`) and forces immediate expiry.

## Security Model

- Delegated credentials are implemented via Sanctum personal access tokens with
  marker ability `delegated:access`.
- Route access is enforced by delegated-scope middleware:
  - request is mapped to required scope,
  - missing scope -> `403 forbidden`,
  - route outside delegated scope map -> `403 forbidden`.
- Revoked credentials (`revoked_at` set) and expired credentials are denied
  with `401 auth_required` under the API error envelope contract.

## Initial Scope Catalog

- `tasks:read`, `tasks:write`
- `lists:read`, `lists:write`
- `habits:read`, `habits:write`
- `routines:read`, `routines:write`
- `goals:read`, `goals:write`
- `targets:read`, `targets:write`
- `life_areas:read`, `life_areas:write`
- `journal:read`, `journal:write`
- `calendar:read`, `calendar:write`
- `integrations:read`, `integrations:write`
- `insights:read`

## Actor Context

- Delegated credential requests are automatically tagged as
  `actor_type=delegated_agent` by request middleware.
- Audit and policy layers consume this actor context from authenticated request
  flow.

## Validation

- `php artisan test --filter=DelegatedCredentialApiTest`
- `php artisan test --filter=AuthApiTest`

