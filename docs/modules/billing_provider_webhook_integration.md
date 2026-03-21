# Billing Provider Integration and Webhook Handling (NEST-067)

## Scope

`NEST-067` implements Stripe webhook ingestion for subscription/payment sync
with idempotent processing and audit receipts.

## Webhook endpoint

- `POST /api/v1/billing/providers/stripe/webhook`

The endpoint is public (provider callback) and validates payload/signature when
`BILLING_STRIPE_WEBHOOK_SECRET` is configured.

## Reliability controls

- Signature verification:
  - validates `Stripe-Signature` (`t` + `v1`) against HMAC SHA-256.
- Idempotency:
  - deduplicates on `(provider, provider_event_id)` in
    `billing_webhook_receipts`.
- Receipt audit:
  - stores every unique webhook payload with processing status:
    `received`, `processed`, `ignored`.

## Event synchronization behavior

Mapped Stripe events:

- `invoice.paid` -> subscription `active`, normalized event
  `billing.invoice.paid`.
- `invoice.payment_failed` -> subscription `past_due`, normalized event
  `billing.invoice.payment_failed`.
- `customer.subscription.deleted` -> subscription `canceled`, normalized event
  `billing.subscription.canceled`.
- `customer.subscription.updated` -> status mapped from provider payload
  (`trialing`, `active`, `past_due`, `canceled`) and normalized event
  `billing.subscription.renewed`.

All processed events are persisted in `tenant_billing_events`.

## Validation coverage

- `tests/Feature/BillingWebhookApiTest.php`
  - processed + idempotent retry behavior,
  - signature validation path,
  - unresolved subscription path recorded as `ignored`.
