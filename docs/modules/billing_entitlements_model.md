# Billing Plans, Entitlements, and Events Model (NEST-065)

## Scope

`NEST-065` defines the v1 billing domain model for:

- subscription plans,
- feature entitlements and quotas,
- billing lifecycle states,
- canonical billing event taxonomy.

## Plan model

Each plan defines:

- `plan_code` (stable identifier, e.g. `free`, `basic`, `advanced`)
- `display_name`
- `billing_interval` (`monthly`, `yearly`)
- `price_minor` + `currency`
- `trial_days`
- `is_public` and `is_active`

## Entitlement model

Entitlements are attached per plan and represented as feature flags or limits.

Entitlement entry shape:

- `key` (e.g. `ai.weekly_planning.enabled`, `automation.rules.max`)
- `type` (`boolean`, `limit`)
- `value` (boolean or numeric)
- `soft_limit` (optional warning threshold for UX messaging)

## Subscription lifecycle states

v1 lifecycle states:

- `trialing`
- `active`
- `past_due`
- `paused`
- `canceled`
- `expired`

Transitions are event-driven and must be auditable.

## Canonical billing event taxonomy

Canonical events (provider-agnostic):

- `billing.subscription.created`
- `billing.subscription.trial_started`
- `billing.subscription.activated`
- `billing.subscription.renewed`
- `billing.subscription.past_due`
- `billing.subscription.paused`
- `billing.subscription.canceled`
- `billing.subscription.expired`
- `billing.invoice.created`
- `billing.invoice.paid`
- `billing.invoice.payment_failed`
- `billing.entitlement.changed`

## Normalized event envelope

- `event_name`
- `event_version`
- `occurred_at`
- `tenant_id`
- `subscription_id`
- `plan_code`
- `provider` (e.g. `stripe`)
- `provider_event_id`
- `payload` (normalized details)

## Data model baseline (logical)

- `billing_plans`
- `billing_plan_entitlements`
- `tenant_subscriptions`
- `tenant_billing_events`

Physical migrations and provider webhook integration are covered by `NEST-066`
and `NEST-067`.

## Rollout strategy

- v1 operates in free-first mode.
- `basic` and `advanced` plan limits/entitlements are planned and will be
  finalized in later phases.
