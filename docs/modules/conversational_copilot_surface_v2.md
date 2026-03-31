# Conversational Copilot Surface v2 (NEST-141)

Date: 2026-03-31  
Task: `NEST-141`

## Scope

- Add conversational copilot endpoint for natural-language planning/execution
  prompts.
- Deliver copilot UI surfaces in web and mobile clients.
- Ensure graceful fallback behavior when AI provider credentials are not
  available.
- Include explainability metadata and source references in each response.

## API

- Endpoint: `POST /api/v1/ai/copilot/conversation`
- Middleware:
  - `auth:sanctum`
  - `tenant.usage`
  - `entitlements`
  - `ai.surface`
- Request:
  - `message` (required)
  - `context.window_days` (optional)
  - `context.entity_limit` (optional)
  - `context.as_of` (optional)

## Response contract

- `data.answer`: generated copilot text answer.
- `data.intent`: detected intent (`planning|execution|reflection|general`).
- `data.provider`:
  - `mode` (`primary|fallback`)
  - `reason` (`provider_unavailable|primary_available`)
- `data.context_snapshot`:
  - `schema_version`
  - `as_of`
  - `fingerprint`
- `data.explainability`:
  - `strategy`
  - `reason_codes[]`
  - `source_references[]`

## Web surface

- Added copilot panel on home dashboard:
  - `apps/web/src/components/ai-copilot-card.tsx`
  - `apps/web/src/app/page.tsx`
- User can enter natural-language prompt, submit request, and view:
  - answer,
  - provider mode,
  - source references.

## Mobile surface

- Added copilot section in options modal:
  - `apps/mobile/app/modal.tsx`
- User can submit prompt and view:
  - answer,
  - intent/provider summary,
  - source references.

## Fallback behavior

- Provider configuration is read from:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
- If credentials are missing, response returns fallback mode with deterministic
  rule-based answer and full explainability payload.

## Validation

- `php artisan test --filter "AiCopilotConversationApiTest|AiContextGraphApiTest|AiWeeklyPlanningApiTest|AiPolicyRegressionTest|MvpAiSurfaceGuardTest"`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`
- `pnpm --package=@redocly/cli dlx redocly lint docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`
