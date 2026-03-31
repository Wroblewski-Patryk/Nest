# Billing Self-Serve Checkout, Portal, and Dunning (NEST-149)

## Scope

`NEST-149` expands billing from lifecycle-only controls to self-serve operations
and recovery automation:

- checkout session creation for plan purchase/upgrade flow,
- customer portal session creation for self-management,
- past-due subscription recovery endpoint,
- automated dunning attempts with cancel-after-threshold policy,
- reconciliation snapshot for billing event/audit completeness.

## Backend delivery

- Controller:
  - `apps/api/app/Http/Controllers/Api/BillingSelfServeController.php`
- Services:
  - `apps/api/app/Billing/Services/BillingSelfServeService.php`
  - `apps/api/app/Billing/Services/BillingDunningService.php`
- Models:
  - `apps/api/app/Models/BillingSelfServeSession.php`
  - `apps/api/app/Models/BillingDunningAttempt.php`
- Migration:
  - `apps/api/database/migrations/2026_03_31_230000_create_billing_self_serve_and_dunning_tables.php`
- Console command:
  - `php artisan billing:dunning:run {--tenant=} {--dry-run} {--json}`

## API endpoints

- `POST /api/v1/billing/checkout/session`
- `POST /api/v1/billing/portal/session`
- `POST /api/v1/billing/subscription/recover`
- `GET /api/v1/billing/dunning/attempts`
- `GET /api/v1/billing/audit/reconciliation`

## Audit and reconciliation behavior

- Every checkout and portal self-serve session appends a billing event.
- Dunning attempts append billing events and keep `billing_event_id` link for
  each attempt.
- Reconciliation response reports:
  - expected status-event presence for current subscription state,
  - latest event summary,
  - count of dunning attempts without event linkage,
  - global `is_reconciled` signal.

## Web and mobile surfaces

- Web billing page now exposes self-serve actions, dunning visibility, and
  reconciliation status:
  - `apps/web/src/app/billing/page.tsx`
- Mobile billing tab now includes dunning/reconciliation metrics:
  - `apps/mobile/app/(tabs)/billing.tsx`

## Shared contracts

- `packages/shared-types/src/client.js`
- `packages/shared-types/src/client.d.ts`
- `packages/shared-types/src/index.d.ts`

## Validation

- `apps/api/tests/Feature/BillingSelfServeApiTest.php`
- `apps/api/tests/Feature/BillingDunningCommandTest.php`
