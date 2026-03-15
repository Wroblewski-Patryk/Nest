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

## Data Protection and Recovery

- Daily encrypted database backups.
- Point-in-time recovery configuration.
- Quarterly restore drill with documented RTO/RPO outcomes.

## Observability Baseline

- Centralized logs with request/job correlation IDs.
- Metrics dashboards: API latency, error rate, queue depth, sync failures.
- Alerting on SLO breaches and integration outage patterns.

## Security Baseline

- Secrets manager for environment secrets.
- Automated dependency updates and CVE scanning.
- TLS everywhere.
- Least-privilege roles for infrastructure and provider credentials.
