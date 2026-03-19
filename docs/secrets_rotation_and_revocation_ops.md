# Secrets Rotation and Revocation Operations (NEST-075)

## Scope

- Added automated secret rotation workflow for encrypted sensitive fields.
- Added scoped integration credential revocation workflow.
- Added operational audit trail for both workflows.

## Commands

- Rotate encrypted secrets:
  - `php artisan secrets:rotate`
  - `php artisan secrets:rotate --tenant=<tenant-id>`
  - `php artisan secrets:rotate --dry-run`
  - `php artisan secrets:rotate --json`
- Revoke integration credentials by scope:
  - `php artisan secrets:credentials:revoke`
  - `php artisan secrets:credentials:revoke --tenant=<tenant-id>`
  - `php artisan secrets:credentials:revoke --provider=<provider>`
  - `php artisan secrets:credentials:revoke --user=<user-id>`
  - `php artisan secrets:credentials:revoke --dry-run`
  - `php artisan secrets:credentials:revoke --json`

## Rotation Coverage

- `integration_credentials.access_token`
- `integration_credentials.refresh_token`
- `mobile_push_devices.device_token`
- `organization_sso_providers.saml_assertion_signing_secret`

Rotation re-encrypts values in place and preserves decrypted values.

## Auditing

- Added audit table: `secret_rotation_audits`
- Captures:
  - operation (`rotate_secrets`, `revoke_credentials`),
  - status (`completed`, `dry_run`),
  - affected record count,
  - scope and metadata payload,
  - execution timestamp.

## Test Coverage

- `apps/api/tests/Feature/SecretRotationOperationsCommandTest.php`
  - secret rotation re-encrypts scoped records and preserves data readability,
  - credential revoke command respects tenant/provider scope and writes audit.
