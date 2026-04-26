# Coolify Deployment

`Nest` should be deployed from the repository root.

## Current production shape

The project is currently set up in Coolify as two separate `Application`
resources, both built from the repo root with `Dockerfile` build pack:

- `web`
  - base directory: `/`
  - dockerfile: `/apps/web/Dockerfile`
  - exposed port: `3000`
- `api`
  - base directory: `/`
  - dockerfile: `/apps/api/Dockerfile`
  - exposed port: `9000`

This is the path that is already working in production and should be kept for
future redeploys unless you intentionally migrate to Compose.

## Why the old setup failed

`apps/web/package.json` depends on `file:../../packages/shared-types`.
If Coolify builds only the `apps/web` subdirectory with Nixpacks, that local
dependency falls outside the build context and install/build breaks.

## Required application variables

Set these in Coolify:

- `APP_KEY`
  - generate with `php artisan key:generate --show` from `apps/api`
- `API_URL`
  - example: `https://api.nest.twojadomena.pl`
- `NEXT_PUBLIC_NEST_API_URL`
  - example: `https://api.nest.twojadomena.pl/api/v1`
- `CORS_ALLOWED_ORIGINS`
  - example: `https://nest.twojadomena.pl`
- `SANCTUM_STATEFUL_DOMAINS`
  - example: `nest.twojadomena.pl`

## Database options

### Current fallback

The current deploy can run on SQLite.
Recommended value:

- `DB_CONNECTION=sqlite`
- `DB_DATABASE=/var/www/html/database/database.sqlite`

The API entrypoint automatically:

- normalizes the legacy `/app/...` sqlite path to `/var/www/html/...`
- creates the sqlite file if missing
- runs `php artisan migrate --force` on startup

That means a normal redeploy is enough to apply pending Laravel migrations.

### Preferred long-term setup

If you want a more production-ready database, switch to Postgres and set:

- `DB_CONNECTION=pgsql`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

The repository already contains [docker-compose.coolify.yml](/C:/Personal/Projekty/Aplikacje/Nest/docker-compose.coolify.yml)
if you later decide to move the whole stack to a single Coolify Compose
resource with bundled Postgres and worker.

## Domains

- `web` -> `https://nest.twojadomena.pl`
- `api` -> `https://api.nest.twojadomena.pl`

Then set:

- `API_URL=https://api.nest.twojadomena.pl`
- `NEXT_PUBLIC_NEST_API_URL=https://api.nest.twojadomena.pl/api/v1`
- `CORS_ALLOWED_ORIGINS=https://nest.twojadomena.pl`
- `SANCTUM_STATEFUL_DOMAINS=nest.twojadomena.pl`

## Notes

- `web` uses a standalone Next.js build.
- `api` migrates automatically on boot.
- old cached browser tabs may log Next.js `Failed to find Server Action` after a
  deploy; a refresh clears that.
