# Organization SSO (OIDC/SAML) - NEST-073

## Scope

- Added organization-level SSO provider management for enterprise plans.
- Added OIDC login exchange flow (id_token verification with JWK).
- Added SAML login exchange flow via signed assertion bridge token.

## Provider Management API (Authenticated)

- `GET /api/v1/orgs/{organizationId}/sso/providers`
- `POST /api/v1/orgs/{organizationId}/sso/providers`
- `PATCH /api/v1/orgs/{organizationId}/sso/providers/{providerId}`

Access control:

- managed by org RBAC permission `org.sso.manage` (`owner`, `admin`).

## Login Exchange API (Public)

- `POST /api/v1/auth/orgs/{organizationSlug}/sso/{providerSlug}/exchange`

Payload by protocol:

- OIDC provider:
  - `id_token`
- SAML provider:
  - `saml_assertion_jwt` (signed bridge token produced by trusted IdP broker)

Response:

- `token`
- `user`
- `organization_id`
- `provider`
- `created`

## Security Controls

- Provider allowlist by explicit organization SSO provider records only.
- Tenant + organization scoped provider and identity resolution.
- OIDC:
  - JWK fetch with cache,
  - signature verification,
  - issuer, audience, and expiry validation.
- SAML:
  - signed bridge assertion token (`HS256`) verification,
  - expiry validation.
- Optional domain allowlist (`allowed_email_domains`).
- Verified email requirement toggle (`require_verified_email`).
- Auto-provisioning toggle (`auto_provision_users`) for JIT enterprise onboarding.

## Persistence Model

- `organization_sso_providers`
  - protocol config for `oidc` and `saml`,
  - security toggles and allowlist settings,
  - tenant/org scoping with unique `organization_id + slug`.
- `organization_sso_identities`
  - user linkage to external SSO subject,
  - unique linkage per provider subject and provider user.

## Tests

- `apps/api/tests/Feature/OrganizationSsoApiTest.php`
  - owner can create OIDC provider,
  - member is blocked from SSO config management,
  - OIDC exchange links existing org member,
  - SAML exchange can auto-provision member when enabled,
  - domain allowlist is enforced.
