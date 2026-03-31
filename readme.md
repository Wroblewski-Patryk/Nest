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

## Local Run (Web + API)

1. Install dependencies:
   - `pnpm install`
   - `composer install --working-dir apps/api`
2. Prepare backend environment:
   - copy `apps/api/.env.example` to `apps/api/.env`
   - create database (default local setup can use sqlite file or PostgreSQL, per `apps/api/.env`)
3. Run migrations and seeders:
   - `php artisan migrate --seed` (from `apps/api`)
4. Start API:
   - `php artisan serve --host=127.0.0.1 --port=9000` (from `apps/api`)
5. Start web:
   - `pnpm --dir apps/web dev`
6. Open app:
   - welcome page: `http://localhost:9001`
   - auth module: `http://localhost:9001/auth`
   - dashboard (after login): `http://localhost:9001/dashboard`

Default seeded account after `migrate --seed`:

- email: `admin@admin.com`
- password: `password`

## License

This project is proprietary software. See `LICENSE`.
