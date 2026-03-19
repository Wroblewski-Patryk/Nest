# Security Control Verification Suite (NEST-076)

## Scope

- Added recurring security control verification command for CI and staging.
- Added warning/critical control severity model with strict-mode support.
- Added CI integration to run security control checks automatically.

## Command

- `php artisan security:controls:verify`
- `php artisan security:controls:verify --json`
- `php artisan security:controls:verify --strict`

Behavior:

- Returns non-zero on `critical` failures.
- With `--strict`, also fails on `warning` findings.

## Verified Controls

- `app_key_configured` (critical)
- `oauth_provider_allowlist` (critical)
- `organization_sso_protocol_allowlist` (critical)
- `saml_signed_assertions_required` (warning)
- `secret_rotation_recency` (warning)
- `expired_active_integration_credentials` (warning)

## CI Integration

- Backend CI job runs:
  - `php artisan security:controls:verify --json --env=testing`

## Test Coverage

- `apps/api/tests/Feature/SecurityControlVerificationCommandTest.php`
  - non-strict mode passes with warnings only,
  - command fails on critical control violation,
  - strict mode fails on warning-level findings.
