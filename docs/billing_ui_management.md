# Billing and Plan Management UI (NEST-068)

## Scope

`NEST-068` delivers billing management UI surfaces on web and mobile with:

- subscription status and plan visibility,
- lifecycle control actions (trial/activate/past_due/cancel),
- billing event history as invoice/audit stream.

## Backend dependency

UI is powered by:

- `GET /api/v1/billing/subscription`
- `GET /api/v1/billing/events`
- `POST /api/v1/billing/subscription/start-trial`
- `POST /api/v1/billing/subscription/activate`
- `POST /api/v1/billing/subscription/past-due`
- `POST /api/v1/billing/subscription/cancel`

## Web delivery

- Route: `apps/web/src/app/billing/page.tsx`
- Added to module readiness navigation:
  `apps/web/src/lib/mvp-snapshot.ts`

## Mobile delivery

- Tab screen: `apps/mobile/app/(tabs)/billing.tsx`
- Tab navigation update:
  `apps/mobile/app/(tabs)/_layout.tsx`
- Snapshot baseline update:
  `apps/mobile/constants/mvpData.ts`

## Shared client contract updates

- Shared types and runtime API client now include billing methods and payload
  types:
  - `packages/shared-types/src/index.d.ts`
  - `packages/shared-types/src/client.d.ts`
  - `packages/shared-types/src/client.js`
  - `apps/web/src/lib/api-client.ts`
  - `apps/mobile/constants/apiClient.ts`
