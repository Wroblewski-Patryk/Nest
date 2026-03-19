# Development and Deployment

## Environments

- Local: developer workstation with Docker services.
- Staging: production-like environment for integration and regression tests.
- Production: hardened environment with backup and observability.

## Local Development Baseline

- Backend: PHP 8.4, Composer, PostgreSQL, Redis.
- Frontend: Node.js 24 LTS, pnpm.
- Use `.env.example` templates for backend and frontend apps.

## CI Pipeline (Minimum)

- Backend lint/static analysis/tests.
- Frontend lint/typecheck/tests.
- API contract validation.
- Dependency vulnerability scan.
- Build artifacts for web and mobile.

Current workflow implementation:

- `.github/workflows/ci.yml`
  - `api-contract`: OpenAPI lint for `docs/openapi_tasks_lists_v1.yaml`
  - `backend`: Composer install + Pint + Laravel tests + Composer audit
  - `web`: pnpm install + lint + typecheck + build + pnpm audit
  - `mobile`: pnpm install + typecheck + Expo web export + pnpm audit

## CD and Release Workflow

- Trunk-based development with short-lived branches.
- Conventional commits and semantic version tagging.
- Staging deploy on merge to main.
- Production deploy via manual approval gate.
- Zero-downtime migration strategy for schema changes.

## Pre-commit Quality Gate

- Local gate script: `scripts/quality-gate.ps1`
- Usage: `pwsh ./scripts/quality-gate.ps1 -AcknowledgeManualChecks`
- Workflow details: `docs/quality_gate_workflow.md`

## Data Protection and Recovery

- Daily encrypted database backups.
- Point-in-time recovery configuration.
- Quarterly restore drill with documented RTO/RPO outcomes.
- Latest local drill runbook: `docs/backup_restore_drill.md`.

## Observability Baseline

- Centralized logs with request/job correlation IDs.
- Metrics dashboards: API latency, error rate, queue depth, sync failures.
- Alerting on SLO breaches and integration outage patterns.
- MVP implementation note:
  - backend API responses expose `X-Trace-Id`,
  - queue and integration counters are emitted (`api.requests.*`,
    `queue.jobs.*`, `integration.sync.*`).

## Mobile Push Baseline Operations

- Device registration API:
  - `GET /api/v1/notifications/mobile/devices`
  - `POST /api/v1/notifications/mobile/devices`
  - `DELETE /api/v1/notifications/mobile/devices/{deviceId}`
- Reminder dispatch command:
  - `php artisan notifications:send-mobile-reminders`
  - `php artisan notifications:send-mobile-reminders --tenant=<tenant-id>`
  - `php artisan notifications:send-mobile-reminders --json`
- Detailed baseline scope and monitoring:
  - `docs/mobile_push_notifications_baseline.md`

## Analytics Baseline Operations

- Ingestion endpoint:
  - `POST /api/v1/analytics/events`
- Retention command:
  - `php artisan analytics:prune-events`
  - `php artisan analytics:prune-events --days=<n>`
- Reference:
  - `docs/analytics_ingestion_pipeline.md`

## Tenant Data Lifecycle Operations

- Retention workflow:
  - `php artisan tenants:retention-prune`
  - `php artisan tenants:retention-prune --tenant=<tenant-id>`
  - `php artisan tenants:retention-prune --dry-run`
  - `php artisan tenants:retention-prune --json`
- Deletion workflow:
  - `php artisan tenants:delete-data <tenant-id>`
  - `php artisan tenants:delete-data <tenant-id> --dry-run`
  - `php artisan tenants:delete-data <tenant-id> --queue`
  - `php artisan tenants:delete-data <tenant-id> --json`
- Reference:
  - `docs/tenant_data_lifecycle_workflows.md`

## Tenant Usage Quota Operations

- Quota configuration source:
  - `apps/api/config/tenant_usage_limits.php`
- Runtime behavior:
  - create endpoints enforce per-tenant limits,
  - quota overflow returns clear API error payload (`tenant_quota_exceeded`).
- Reference:
  - `docs/tenant_usage_limits_and_quotas.md`

## Collaboration Operations

- Collaboration spaces API:
  - `GET /api/v1/collaboration/spaces`
  - `POST /api/v1/collaboration/spaces`
  - `POST /api/v1/collaboration/spaces/{spaceId}/invites`
  - `POST /api/v1/collaboration/invites/{token}/accept`
  - `POST /api/v1/collaboration/spaces/{spaceId}/share/lists/{listId}`
  - `POST /api/v1/collaboration/spaces/{spaceId}/share/goals/{goalId}`
- Reference:
  - `docs/collaboration_spaces_v1.md`

## Billing Model Baseline

- Reference model:
  - `docs/billing_entitlements_model.md`
- Contract draft:
  - `docs/openapi_billing_events_v1.yaml`

## Billing Lifecycle Operations

- Subscription endpoints:
  - `GET /api/v1/billing/subscription`
  - `POST /api/v1/billing/subscription/start-trial`
  - `POST /api/v1/billing/subscription/activate`
  - `POST /api/v1/billing/subscription/past-due`
  - `POST /api/v1/billing/subscription/cancel`
- Reference:
  - `docs/billing_subscription_lifecycle_backend.md`

## Security Baseline

- Secrets manager for environment secrets.
- Automated dependency updates and CVE scanning.
- TLS everywhere.
- Least-privilege roles for infrastructure and provider credentials.
