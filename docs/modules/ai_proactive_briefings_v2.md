# AI Proactive Briefings v2 (NEST-143)

Date: 2026-03-31  
Task: `NEST-143`

## Scope

- Deliver daily and weekly AI briefing generation.
- Add user-level controls for cadence and content scope.
- Create in-app notification with deep-link context to insights briefing view.

## API

- Preferences:
  - `GET /api/v1/ai/briefings/preferences`
  - `PATCH /api/v1/ai/briefings/preferences`
- Briefings:
  - `GET /api/v1/ai/briefings`
  - `POST /api/v1/ai/briefings/generate`
  - `GET /api/v1/ai/briefings/{briefingId}`

## Data model

- `ai_briefing_preferences`
  - cadence toggles (`daily_enabled`, `weekly_enabled`)
  - `scope_modules`
  - `timezone`
- `ai_briefings`
  - cadence (`daily|weekly`)
  - scope modules
  - generated summary + sections
  - context fingerprint and timestamp

## Notification/deep-link behavior

- On briefing generation, system creates `in_app_notification`:
  - `event_type=ai_briefing_generated`
  - `module=insights`
  - `entity_type=ai_briefing`
  - `entity_id=<briefingId>`
  - `deep_link=/insights`
  - payload includes `briefing_id` for summary context

## Client integration

- Shared client supports preferences/list/generate/fetch briefing endpoints:
  - `packages/shared-types/src/client.js`
  - `packages/shared-types/src/client.d.ts`
  - `packages/shared-types/src/index.d.ts`
- Insights surfaces display latest briefing summary:
  - `apps/web/src/app/insights/page.tsx`
  - `apps/mobile/app/(tabs)/insights.tsx`

## Validation

- `php artisan test --filter "AiBriefingApiTest|AiActionProposalApiTest|AiCopilotConversationApiTest|AiContextGraphApiTest|AiWeeklyPlanningApiTest|AiPolicyRegressionTest|MvpAiSurfaceGuardTest"`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`
- `pnpm --package=@redocly/cli dlx redocly lint docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`
