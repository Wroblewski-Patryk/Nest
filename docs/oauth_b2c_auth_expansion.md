# OAuth B2C Auth Expansion (NEST-072)

## Scope

- Added OAuth id_token exchange for `google` and `apple` providers.
- Added tenant-safe account linking controls for multi-tenant B2C auth.
- Added signature verification via provider JWK sets.

## API

- Public exchange endpoint:
  - `POST /api/v1/auth/oauth/{provider}/exchange`
- Supported providers:
  - `google`
  - `apple`
- Request payload:
  - `id_token` (required)
  - `tenant_slug` (optional, required for safe disambiguation when email exists
    in multiple tenants)
- Response payload:
  - `token`
  - `user`
  - `provider`
  - `linked`
  - `created`

## Security Controls

- id_token signature verification using provider JWK set.
- Provider allowlist enforcement (`google`, `apple`).
- Issuer validation against provider configuration.
- Audience validation against configured client IDs.
- Expiration (`exp`) validation.
- Mandatory verified email (`email_verified=true`) before linking.
- Ambiguous email linking blocked without explicit `tenant_slug`.

## Persistence Model

- Added `oauth_identities` table:
  - unique provider identity: (`provider`, `provider_user_id`)
  - unique provider binding per user: (`user_id`, `provider`)
  - tenant index: (`tenant_id`, `provider`)
- Added `OAuthIdentity` model with explicit table mapping.

## Configuration

- Added `apps/api/config/oauth.php`.
- Provider configuration keys:
  - `OAUTH_GOOGLE_CLIENT_ID`
  - `OAUTH_APPLE_CLIENT_ID`
  - optional override JWK URLs:
    - `OAUTH_GOOGLE_JWKS_URL`
    - `OAUTH_APPLE_JWKS_URL`

## Test Coverage

- `apps/api/tests/Feature/OAuthProviderAuthApiTest.php`
  - creates new account + links identity,
  - links existing account by `tenant_slug`,
  - blocks ambiguous multi-tenant email linking,
  - blocks unverified email,
  - blocks unsupported providers.
