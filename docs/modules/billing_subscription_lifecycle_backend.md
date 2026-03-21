# Billing Subscription Lifecycle Backend (NEST-066)

## Scope

`NEST-066` implements tenant-scoped subscription lifecycle backend for:

- `trialing`
- `active`
- `past_due`
- `canceled`

with auditable billing events and entitlement-aware subscription snapshot.

## Data layer

- `billing_plans`
- `billing_plan_entitlements`
- `tenant_subscriptions`
- `tenant_billing_events`

Migration:
- `apps/api/database/migrations/2026_03_19_140000_create_billing_lifecycle_tables.php`

## API endpoints

- `GET /api/v1/billing/subscription`
- `POST /api/v1/billing/subscription/start-trial`
- `POST /api/v1/billing/subscription/activate`
- `POST /api/v1/billing/subscription/past-due`
- `POST /api/v1/billing/subscription/cancel`

## Lifecycle service

- Service: `App\Billing\Services\SubscriptionLifecycleService`
- Enforces allowed transitions:
  - `trialing|past_due -> active`
  - `active -> past_due`
  - `trialing|active|past_due -> canceled`
- Invalid transitions return `422` with clear message.

## Audit events

Each lifecycle action appends normalized event rows to `tenant_billing_events`,
including:

- `billing.subscription.trial_started`
- `billing.subscription.activated`
- `billing.subscription.past_due`
- `billing.subscription.canceled`

## Validation coverage

- `tests/Feature/BillingSubscriptionLifecycleApiTest.php`
  - end-to-end lifecycle transitions,
  - tenant isolation and invalid transition handling,
  - guest route protection.
