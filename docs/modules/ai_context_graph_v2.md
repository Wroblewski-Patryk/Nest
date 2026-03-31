# AI Context Graph v2 (NEST-140)

Date: 2026-03-31  
Task: `NEST-140`

## Scope

- Build one deterministic retrieval payload that joins context from:
  - tasks,
  - calendar events,
  - habits and recent habit logs,
  - goals,
  - journal entries.
- Add a versioned API surface for copilot context retrieval.
- Enforce privacy redaction for sensitive long-form fields before payload
  assembly.

## API

- `GET /api/v1/ai/context-graph`
- Middleware:
  - `auth:sanctum`
  - `tenant.usage`
  - `entitlements`
  - `ai.surface`
- Query parameters:
  - `window_days` (`1..60`, default `14`)
  - `entity_limit` (`1..50`, default `20`)
  - `as_of` (optional fixed snapshot anchor for deterministic replay)

## Payload contract

- `data.schema_version`: `ai-context.v1`
- `data.snapshot`:
  - `as_of`
  - `window_days`
  - `window_start`
  - `window_end`
  - `fingerprint` (`sha256` of canonicalized payload)
- `data.privacy`:
  - `redaction_policy_version`: `ai-context-redaction.v1`
  - `mode`: `strict`
  - `redacted_fields` map by module
- `data.signals`:
  - module-level aggregate behavior signals
- `data.entities`:
  - deterministic module slices for retrieval

## Redaction policy

Sensitive raw text fields are never emitted in context entities:

- `tasks.description`
- `calendar_events.description`
- `habits.description`
- `goals.description`
- `journal_entries.body`

To preserve context signal without exposing raw content, payload includes
booleans (`has_description`, `has_body`) instead of text.

## Files

- API controller:
  - `apps/api/app/Http/Controllers/Api/AiContextGraphController.php`
- Context builder:
  - `apps/api/app/AI/Services/AiContextGraphService.php`
- Route:
  - `apps/api/routes/api.php`
- Shared client/types:
  - `packages/shared-types/src/client.js`
  - `packages/shared-types/src/client.d.ts`
  - `packages/shared-types/src/index.d.ts`
- OpenAPI:
  - `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`

## Validation

- `php artisan test --filter "AiContextGraphApiTest|AiWeeklyPlanningApiTest|AiPolicyRegressionTest|MvpAiSurfaceGuardTest"`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`
- `pnpm --package=@redocly/cli dlx redocly lint docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`
