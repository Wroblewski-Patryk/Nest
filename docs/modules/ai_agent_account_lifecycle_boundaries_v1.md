# AI Agent Account Lifecycle and Boundaries v1

## Scope

`NEST-165` introduces tenant-scoped AI agent principals with explicit lifecycle
and capability boundaries between:

- `ai_agent` own-account operation mode,
- `delegated_agent` user-delegated operation mode.

## Delivered API

- `GET /api/v1/auth/ai-agents`
  - lists AI agent principals owned by authenticated human user.
- `POST /api/v1/auth/ai-agents`
  - creates AI agent principal in tenant context.
- `POST /api/v1/auth/ai-agents/{agentId}/credentials`
  - issues scope-limited AI agent credential.
- `POST /api/v1/auth/ai-agents/{agentId}/credentials/{credentialId}/revoke`
  - revokes AI agent credential.
- `POST /api/v1/auth/ai-agents/{agentId}/deactivate`
  - deactivates AI agent principal and revokes all agent credentials.

## Principal Model

- User model now supports principal metadata:
  - `principal_type` (`human_user` | `ai_agent`),
  - `owner_user_id` (human owner for AI principal),
  - `agent_status` (`active` | `revoked` for AI principal).

## Boundary Enforcement

- Credential marker modes:
  - `delegated:access` for delegated user credentials,
  - `ai_agent:access` for AI agent own credentials.
- Middleware enforces:
  - marker mode must match principal type,
  - only scoped routes/modules are accessible,
  - revoked/expired credentials are denied,
  - revoked AI agent principal is denied.

## Unauthorized Boundary Audit

- Denied cross-boundary attempts are persisted in `actor_boundary_audits`
  (`reason` examples: `boundary_mismatch`, `route_not_allowed`,
  `missing_scope`, `ai_agent_revoked`, `credential_revoked`,
  `credential_expired`).

## Validation

- `php artisan test --filter=AiAgentAccountApiTest`
- `php artisan test --filter=DelegatedCredentialApiTest`
- `php artisan test --filter=IntegrationListTaskSyncApiTest`
- `php artisan test --filter=IntegrationMarketplaceApiTest`
- `php artisan test --filter=AuthApiTest`

