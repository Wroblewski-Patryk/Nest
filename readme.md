# Repository Documentation

Nest is a LifeOS application: one structured source of truth for tasks,
goals, habits, routines, calendar, and reflections.

Primary documentation index: `docs/README.md`.

## Quick Links

- Product overview: `docs/product/overview.md`
- MVP scope: `docs/product/mvp_scope.md`
- Roadmap: `docs/product/roadmap.md`
- System architecture: `docs/architecture/system-architecture.md`
- Tech stack: `docs/architecture/tech-stack.md`
- API contracts index: `docs/engineering/api_contracts.md`
- Repository structure policy: `docs/governance/repository-structure-policy.md`
- Working agreements: `docs/governance/working-agreements.md`

## Current Direction

- Backend: Laravel + PostgreSQL
- Web: Next.js
- Mobile: Expo/React Native
- Tenancy: multi-tenant architecture with single-user launch profile

## Local Run

There is no root `package.json` in this repository.

Install and run each app from its own directory.

### 1. Install dependencies

- API:
  - `composer install --working-dir apps/api`
- Web:
  - `pnpm install --dir apps/web`
- Mobile:
  - `pnpm install --dir apps/mobile`

### 2. Prepare backend environment

- copy `apps/api/.env.example` to `apps/api/.env`
- configure PostgreSQL and Redis values from that file
- default documented local baseline is PostgreSQL + Redis, not root-level
  sqlite bootstrap

### 3. Run migrations and seeders

From `apps/api`:

- `php artisan migrate --seed`

### 4. Start backend services

From `apps/api`:

- API: `php artisan serve --host=127.0.0.1 --port=9000`
- Queue worker: `php artisan queue:work redis --queue=default,integrations`

### 5. Start clients

- Web:
  - `pnpm --dir apps/web dev`
- Mobile:
  - `pnpm --dir apps/mobile start`

### 6. Open app

- welcome page: `http://localhost:9001`
- auth module: `http://localhost:9001/auth`
- dashboard (after login): `http://localhost:9001/dashboard`

Default seeded account after `migrate --seed`:

- email: `admin@admin.com`
- password: `password`
- onboarding: already completed for seeded admin user
- demo planning dataset: prefilled `Goals + Targets + Lists + Tasks` is added
  for this account so `/tasks` is not empty on first run

For more detailed environment guidance, see
`docs/engineering/development_and_deployment.md`.

## Coolify

Deploy from the repository root with `docker-compose.coolify.yml`.

Full guide: `docs/operations/coolify.md`

## License

This project is proprietary software. See `LICENSE`.
