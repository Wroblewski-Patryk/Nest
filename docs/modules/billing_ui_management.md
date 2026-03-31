# Billing and Plan Management UI (NEST-068, NEST-149)

## Scope

`NEST-068` delivers baseline billing management UI surfaces on web and mobile.
`NEST-149` extends the same screens with self-serve and dunning workflows:

- subscription status and plan visibility,
- lifecycle control actions (trial/activate/past_due/cancel),
- billing event history as invoice/audit stream.
- self-serve checkout + portal sessions.
- dunning attempts and reconciliation visibility.

## Backend dependency

UI is powered by:

- `GET /api/v1/billing/subscription`
- `GET /api/v1/billing/events`
- `POST /api/v1/billing/subscription/start-trial`
- `POST /api/v1/billing/subscription/activate`
- `POST /api/v1/billing/subscription/past-due`
- `POST /api/v1/billing/subscription/cancel`
- `POST /api/v1/billing/subscription/recover`
- `POST /api/v1/billing/checkout/session`
- `POST /api/v1/billing/portal/session`
- `GET /api/v1/billing/dunning/attempts`
- `GET /api/v1/billing/audit/reconciliation`

## Web delivery

- Route: `apps/web/src/app/billing/page.tsx`
- Added to module readiness navigation:
  `apps/web/src/lib/mvp-snapshot.ts`
- Self-serve and dunning expansion:
  `docs/modules/billing_self_serve_checkout_portal_dunning_v2.md`

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
