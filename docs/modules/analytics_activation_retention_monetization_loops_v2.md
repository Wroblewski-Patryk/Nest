# Activation, Retention, and Monetization Analytics Loops (NEST-150)

## Scope

`NEST-150` delivers a growth-loop analytics layer for weekly product decisions:

- activation funnel snapshot (`signups -> onboarding -> trial -> activation`),
- 7-day retention cohort deltas (`current`, `previous`, `retained`, `churned`),
- monetization pulse (`active/past_due/canceled`, estimated MRR, recovery rate),
- onboarding/pricing experiment hooks for exposure and conversion tracking.

## API delivery

- `GET /api/v1/analytics/loops/decision-dashboard`
  - returns aggregated funnel/retention/monetization metrics and weekly action
    suggestions.
- `POST /api/v1/analytics/experiments/hook`
  - tracks experiment lifecycle events for:
    - `context=onboarding|pricing`
    - `action=exposed|converted`

## Backend implementation

- Controller:
  - `apps/api/app/Http/Controllers/Api/AnalyticsLoopController.php`
- Services:
  - `apps/api/app/Analytics/Services/AnalyticsLoopDecisionDashboardService.php`
  - `apps/api/app/Analytics/Services/AnalyticsExperimentHookService.php`
- Route wiring:
  - `apps/api/routes/api.php`
- Analytics allowlist expansion:
  - `apps/api/config/analytics.php`

## Client integration

- Shared client/runtime contracts:
  - `packages/shared-types/src/client.js`
  - `packages/shared-types/src/client.d.ts`
  - `packages/shared-types/src/index.d.ts`
- Web surfaces:
  - onboarding experiment hooks:
    `apps/web/src/app/onboarding/page.tsx`
  - pricing experiment hooks:
    `apps/web/src/app/billing/page.tsx`
  - weekly growth dashboard:
    `apps/web/src/app/insights/page.tsx`
- Mobile surface:
  - growth-loop metric integration in insights:
    `apps/mobile/app/(tabs)/insights.tsx`

## Validation

- `apps/api/tests/Feature/AnalyticsLoopDecisionDashboardApiTest.php`
- `apps/api/tests/Feature/AnalyticsIngestionApiTest.php`
- `apps/api/tests/Feature/InsightsTrendApiTest.php`
