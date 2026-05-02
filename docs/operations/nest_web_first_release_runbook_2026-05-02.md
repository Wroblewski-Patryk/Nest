# Nest Web-First Release Runbook

Date: 2026-05-02
Stage: release planning
Applies to: Coolify web-first deployment

## Release Scope

This runbook covers the web-first Nest deployment path:

- Laravel API
- Laravel queue worker
- PostgreSQL 17
- Redis 7
- Next.js web app
- OpenAPI contract validation

Native mobile remains outside the release claim until `NEST-309` explicitly
moves it into scope.

## Required Environment

API and worker:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL`
- `APP_KEY`
- `APP_SEED_ON_BOOT=false` unless an intentional seed operation is planned
- `DB_CONNECTION=pgsql`
- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_DATABASE=nest`
- `DB_USERNAME=nest`
- `DB_PASSWORD`
- `CACHE_STORE=redis`
- `SESSION_DRIVER=redis`
- `QUEUE_CONNECTION=redis`
- `REDIS_CLIENT=phpredis`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `REDIS_PASSWORD` when Redis auth is enabled
- `REDIS_DB=0`
- `REDIS_CACHE_DB=1`
- `REDIS_QUEUE=integrations`
- `SANCTUM_STATEFUL_DOMAINS`
- `CORS_ALLOWED_ORIGINS`
- `AI_SURFACE_ENABLED=false` unless AI release evidence is attached
- `OPENAI_API_KEY` only when AI is enabled
- `OPENAI_MODEL`

Worker-only:

- `RUN_QUEUE_WORKER=true`
- `QUEUE_WORKER_QUEUE=integrations,default`
- `QUEUE_WORKER_TIMEOUT=90`

Web:

- `NODE_ENV=production`
- `PORT=3000`
- `NEST_API_URL=http://api:9000/api/v1` or the equivalent internal service URL
- `NEXT_PUBLIC_NEST_WEB_API_PROXY=/api/nest`
- `NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE=en`
- `NEXT_PUBLIC_NEST_OFFLINE_CACHE_RETENTION_DAYS`
- `NEXT_PUBLIC_NEST_OFFLINE_CACHE_SECRET` if offline cache encryption is used

## Deployment Order

1. Build API image.
2. Build web image.
3. Start PostgreSQL and Redis.
4. Start API service.
5. Let API entrypoint run `php artisan migrate --force`.
6. Confirm API health endpoint passes.
7. Start worker service.
8. Start web service.
9. Run smoke checks.
10. Watch API, worker, and web logs during the first release window.

## Required Local Validation Before Deploy

Run the feasible full baseline before cutting a release:

```powershell
cd apps/api
composer validate --no-check-publish
php artisan test --testsuite=Unit --env=testing
php artisan test --testsuite=Feature --env=testing
php artisan test --testsuite=Integration --env=testing
php artisan security:controls:verify --json --env=testing

cd ../web
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm test:unit

cd ../mobile
pnpm exec tsc --noEmit
pnpm test:unit
pnpm exec expo export --platform web

cd ../..
pnpm --package=@redocly/cli dlx redocly lint docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml docs/engineering/contracts/openapi_automation_rules_v1.yaml docs/engineering/contracts/openapi_billing_events_v1.yaml docs/engineering/contracts/openapi_core_modules_v1.yaml docs/engineering/contracts/openapi_tasks_lists_v1.yaml
git diff --check
```

If the local PHP runtime is below the production PHP requirement, record that
API test execution is blocked locally and run API validation in the PHP 8.4
container before release.

## Smoke Checks

API:

- `GET /health` returns 200.
- `POST /api/v1/auth/register` creates a test account in the target staging
  environment.
- `GET /api/v1/auth/me` succeeds with the issued token.
- `POST /api/v1/auth/logout` revokes the token.

Web:

- `/auth` renders.
- Login/register flow reaches `/onboarding` or `/dashboard`.
- Browser dev tools do not show `nest.auth.token` in `localStorage`.
- Protected route without a valid session redirects to `/auth`.
- If the API is unavailable, protected routes fail closed instead of entering
  the app shell.

Worker/queue:

- Worker logs show `queue:work redis`.
- A sync or replay job can be queued and processed in staging.
- Failed jobs remain observable in the configured failed-job store.

Contracts:

- Redocly lint passes with no warnings.

## Health And Observability

Critical journey:

- User can authenticate, load Dashboard, and create/read core data through the
  API-backed web app.

SLIs:

- API health availability.
- Auth route success rate.
- Dashboard API response success rate.
- Queue job processing success/failure count.
- Integration sync SLO command result.

Initial SLO targets for staging:

- API health: 99% during release window.
- Auth and Dashboard smoke: 100% for release smoke.
- Queue smoke job: processed within 2 minutes.

Operator checks:

- API logs include request trace IDs.
- Worker logs include job start/failure context.
- Security control command returns severity `ok`.
- Integration SLO command returns success or documented warning.

## Disable And Rollback Paths

Feature flags and disable paths:

- AI: set `AI_SURFACE_ENABLED=false`.
- Provider integrations: revoke provider credentials or pause worker.
- Billing self-serve: unset provider secrets or disable exposed billing links.
- Web release: roll web image back to previous build.
- API release: roll API and worker image back together.

Rollback sequence:

1. Stop new web traffic or roll web back first if the issue is UI/session-only.
2. Pause worker if queue jobs are corrupting data or retrying aggressively.
3. Roll API and worker to the last known good image.
4. Keep PostgreSQL data; do not run destructive migration rollback without a
   verified database backup and explicit approval.
5. Re-run smoke checks.
6. Record incident notes and follow-up tasks.

## Hard Blocks

Do not deploy if any of these are true:

- Required env vars are missing.
- API health fails.
- Database migrations fail.
- Redis is not reachable while production config requires Redis.
- OpenAPI lint has errors or release-relevant warnings.
- Web build fails.
- Auth smoke fails.
- Security controls do not return severity `ok`.
- Rollback owner/path is unknown.

## Result Report Template

- Build or commit:
- Environment:
- Deploy started:
- Deploy completed:
- Migrations:
- API health:
- Web smoke:
- Auth smoke:
- Worker smoke:
- Security controls:
- OpenAPI lint:
- Observability checked:
- Rollback path confirmed:
- Residual risks:
