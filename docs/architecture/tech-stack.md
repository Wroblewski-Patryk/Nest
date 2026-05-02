# Tech Stack (Decision)

As of March 15, 2026.

## Backend

- Framework: Laravel 12.x
- Runtime: PHP 8.4
- Database: PostgreSQL 17 (prefer), PostgreSQL 18 when provider support is
  mature in the target environment
- Cache/Queue: Redis 7.x+
- API style: REST + OpenAPI contract

## Frontend

- Web app: Next.js 16 + React 19.2 + TypeScript 5.x
- Mobile app: Expo SDK 55 + React Native (SDK-aligned) + TypeScript 5.x
- Shared packages: UI tokens/components, API client, domain schemas

## Platform and Tooling

- Node.js: 24 LTS for frontend/tooling
- Package management: pnpm (frontend workspace)
- CI/CD: GitHub Actions (lint, test, build, security checks)
- Containers: Docker for local/dev parity

## Why This Stack

- Laravel + PostgreSQL: fast delivery, mature ecosystem, excellent relational
  modeling for Nest entities and sync metadata.
- Next.js + React Native (Expo): two product editions with near-identical
  business logic and highly consistent UX.
- Redis queues: reliable async integrations and AI/integration job processing.

## Version Policy

- Pin major versions in docs and lock exact versions in project lockfiles.
- Patch updates: weekly automated checks, monthly rollout.
- Minor updates: monthly review.
- Major updates: quarterly evaluation with migration notes.

## Source References

- Laravel release notes and support policy:
  https://laravel.com/docs/12.x/releases
- PHP supported versions:
  https://www.php.net/supported-versions
- PostgreSQL versioning policy:
  https://www.postgresql.org/support/versioning/
- Next.js 16 release notes:
  https://nextjs.org/blog/next-16
- React 19.2 release post:
  https://react.dev/blog
- Expo versions and release notes:
  https://docs.expo.dev/versions/latest/
- React Native release notes:
  https://reactnative.dev/blog
- Node.js release schedule:
  https://nodejs.org/en/about/previous-releases