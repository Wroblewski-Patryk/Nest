# Production Topology and Environment Contract v1 (NEST-115)

Date: 2026-03-21
Task: `NEST-115`

## Production Topology

- `api`: Laravel app service (HTTP API).
- `web`: Next.js service (SSR/static hybrid).
- `db`: PostgreSQL primary.
- `redis`: cache + queue broker.
- `workers`: queue worker deployment (integrations, automations, notifications).
- `cron`: scheduled jobs runner (`php artisan schedule:run`).

## Required Environment and Secrets

### API service

- `APP_ENV=production`
- `APP_KEY`
- `APP_URL`
- `DB_CONNECTION=pgsql`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `QUEUE_CONNECTION=redis`
- `CACHE_STORE=redis`
- `SANCTUM_STATEFUL_DOMAINS`
- `SESSION_DOMAIN`
- `BILLING_STRIPE_WEBHOOK_SECRET` (if Stripe enabled)

### Web service

- `NODE_ENV=production`
- `NEXT_PUBLIC_NEST_API_URL`
- optional: `NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE`

### Mobile release env

- `EXPO_PUBLIC_NEST_API_URL`
- optional: `EXPO_PUBLIC_NEST_DEFAULT_LANGUAGE`
- signing credentials managed in EAS/CI secret store

## TLS / Domain Prerequisites

- TLS certificates provisioned for API and web domains.
- HSTS and HTTPS redirect enabled at ingress.
- API and web domain allowlist synchronized with Sanctum/CORS configuration.

## Backup and Restore Prerequisites

- Daily PostgreSQL backups with retention policy and integrity checks.
- Redis persistence/backup strategy documented for queue recovery posture.
- Restore drill command path documented and exercised before go-live window.
