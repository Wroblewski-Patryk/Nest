# Access Control Management Surface v1

## Scope

`NEST-166` delivers a combined GUI + API management surface for:

- delegated user-issued AI credentials,
- AI agent principal lifecycle and credentials,
- access-boundary audit visibility.

## Web GUI (`/settings`)

- Delegated credentials section:
  - create credential with scopes and optional expiry,
  - list active/expired/revoked credentials,
  - revoke active credentials.
- AI agent section:
  - create agent principal,
  - review agent status and existing credentials,
  - issue/revoke agent credentials,
  - deactivate AI agent (revokes all agent credentials).
- Access audits section:
  - displays boundary/security events (`boundary_mismatch`, `route_not_allowed`,
    `missing_scope`, `ai_agent_revoked`, `credential_revoked`,
    `credential_expired`) for current user and owned AI agents.

## API Surface (Auth group)

- Delegated credentials:
  - `GET /api/v1/auth/delegated-credentials`
  - `POST /api/v1/auth/delegated-credentials`
  - `POST /api/v1/auth/delegated-credentials/{credentialId}/revoke`
- AI agents:
  - `GET /api/v1/auth/ai-agents`
  - `POST /api/v1/auth/ai-agents`
  - `GET /api/v1/auth/ai-agents/{agentId}/credentials`
  - `POST /api/v1/auth/ai-agents/{agentId}/credentials`
  - `POST /api/v1/auth/ai-agents/{agentId}/credentials/{credentialId}/revoke`
  - `POST /api/v1/auth/ai-agents/{agentId}/deactivate`
- Access audit:
  - `GET /api/v1/auth/access-audits`

## Route Guard / Navigation

- `/settings` is now protected by auth/onboarding middleware.
- Workspace shell exposes `Access Control` shortcut to `/settings`.

## Contract / Client

- OpenAPI auth contract updated in:
  `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`.
- Shared client contract updated with access-control methods and types:
  `packages/shared-types/src/client.js`,
  `packages/shared-types/src/index.d.ts`,
  `packages/shared-types/src/client.d.ts`.

## Validation

- Backend:
  - `php artisan test --filter=AiAgentAccountApiTest`
  - `php artisan test --filter=DelegatedCredentialApiTest`
  - `php artisan test --filter=AuthApiTest`
  - `php artisan route:list --path=api/v1/auth/access-audits`
  - `php artisan route:list --path=api/v1/auth/ai-agents`
- Web:
  - `pnpm --dir apps/web test:unit`
  - `pnpm --dir apps/web build`
  - `pnpm --dir apps/web test:smoke`

