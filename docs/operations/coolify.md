# Coolify Deployment

`Nest` should be deployed from the repository root, not from `apps/web`.

## Why the previous setup likely failed

`apps/web/package.json` depends on `file:../../packages/shared-types`.
If Coolify builds only the `apps/web` subdirectory, that dependency is missing
inside the build context and the install/build step breaks.

## Recommended setup

Create a new Coolify `Docker Compose` resource and point it at:

- repository root
- compose file: `docker-compose.coolify.yml`

This starts:

- `web` on port `3000`
- `api` on port `9000`
- `worker` for Laravel queue jobs
- `postgres` as the application database

## Required environment variables

Set these in Coolify before the first deployment:

- `APP_KEY`
  - generate with `php artisan key:generate --show` from `apps/api`
- `POSTGRES_PASSWORD`
- `API_URL`
  - example: `https://nest-api.twojadomena.pl`
- `NEXT_PUBLIC_NEST_API_URL`
  - must be the public API URL with `/api/v1`
  - example: `https://nest-api.twojadomena.pl/api/v1`
- `CORS_ALLOWED_ORIGINS`
  - example: `https://nest.twojadomena.pl`

Recommended:

- `SANCTUM_STATEFUL_DOMAINS`
  - example: `nest.twojadomena.pl`
- `SESSION_DOMAIN`
  - leave empty for bearer-token auth unless you intentionally share cookies
- `APP_SEED_ON_BOOT=false`
  - set to `true` only for the very first boot if you want seeded demo data
- `AI_SURFACE_ENABLED=false`
  - enable only after adding a valid `OPENAI_API_KEY`

## Domain mapping

Map separate domains in Coolify:

- `web` -> `https://nest.twojadomena.pl`
- `api` -> `https://nest-api.twojadomena.pl`

Then set:

- `API_URL=https://nest-api.twojadomena.pl`
- `NEXT_PUBLIC_NEST_API_URL=https://nest-api.twojadomena.pl/api/v1`
- `CORS_ALLOWED_ORIGINS=https://nest.twojadomena.pl`
- `SANCTUM_STATEFUL_DOMAINS=nest.twojadomena.pl`

## Notes

- `web` uses a standalone Next.js build for a smaller, simpler runtime.
- `api` migrates the database automatically on boot.
- `worker` is required because parts of the Laravel app enqueue background jobs.
- This setup uses database-backed cache, sessions, and queues to avoid adding
  Redis unless you specifically want it later.
