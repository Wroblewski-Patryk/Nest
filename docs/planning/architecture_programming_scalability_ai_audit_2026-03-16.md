# Architecture / Engineering / Scalability / AI-Readiness Audit

Date: 2026-03-16
Reviewer stance: senior, strict, implementation-first

## Scope

- backend architecture and implementation quality (`apps/api`)
- web/mobile client architecture (`apps/web`, `apps/mobile`, `packages/shared-types`)
- documentation vs reality consistency (`docs/*`, `.codex/context/*`)
- future AI agent operability/readability

## Executive Verdict

The project is in good momentum and has strong test discipline, but there are
critical architecture drifts and one sync correctness bug that must be fixed
before scaling traffic and before enabling larger integration volumes.

Most important: current idempotency design can silently block legitimate
list/task and journal updates for up to 24h.

## Findings (ordered by severity)

### P0 - Sync correctness bug: idempotency key strategy blocks valid updates

Evidence:

- `apps/api/app/Integrations/Services/IntegrationSyncService.php:82`
  (`Cache::add(... now()->addHours(24))`)
- `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php:130`
  (`idempotency_key` does not include payload/hash)
- `apps/api/app/Integrations/Services/JournalIntegrationSyncService.php:94`
  (`idempotency_key` does not include payload/hash)

Impact:

- a changed entity can be treated as duplicate for 24h,
- external systems may stay stale despite internal changes,
- low observability risk because flow returns `duplicate_skipped`.

### P1 - Queue-first architecture is declared, but sync is executed synchronously

Evidence:

- contract statement: `docs/architecture/backend_strategy.md:50` (queue-first)
- sync request path uses immediate execution:
  - `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php:55`
  - `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php:88`
  - `apps/api/app/Integrations/Services/JournalIntegrationSyncService.php:53`
  - `apps/api/app/Integrations/Services/CalendarIntegrationSyncService.php:60`

Impact:

- request latency grows linearly with data volume,
- higher timeout risk and weaker horizontal scalability,
- operationally harder back-pressure management.

### P1 - Full-table fetch patterns in sync paths reduce scalability

Evidence:

- `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php:23`
- `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php:29`
- `apps/api/app/Integrations/Services/JournalIntegrationSyncService.php:23`
- `apps/api/app/Integrations/Services/CalendarIntegrationSyncService.php:22`

Impact:

- memory pressure for larger tenants,
- degraded performance and noisy neighbor effects.

### P1 - Docs vs runtime drift for infra baseline (PostgreSQL/Redis vs SQLite/database)

Evidence:

- architecture docs:
  - `docs/architecture/system-architecture.md:43`
  - `docs/architecture/system-architecture.md:44`
  - `docs/architecture/system-architecture.md:55`
- runtime defaults:
  - `apps/api/.env.example:23`
  - `apps/api/.env.example:38`
  - `apps/api/.env.example:40`
  - `apps/api/config/database.php:20`

Impact:

- team and AI agents optimize for a different platform than runtime reality,
- false confidence in queue/cache/lock characteristics.

### P2 - OpenAPI governance gap (implementation exceeds validated contracts)

Evidence:

- CI validates only one spec: `.github/workflows/ci.yml:32`
- docs describe OpenAPI as contract source: `docs/architecture/backend_strategy.md:12`
- API includes auth/integration routes in code:
  - `apps/api/routes/api.php:20`
  - `apps/api/routes/api.php:83`

Impact:

- contract drift,
- weaker AI/tooling integration reliability,
- harder SDK generation and agent-safe automation.

### P2 - Shared API runtime client exists but is not actually reused by apps

Evidence:

- shared runtime client exists:
  - `packages/shared-types/src/client.js:10`
  - `packages/shared-types/src/index.d.ts:129`
- web/mobile define separate clients:
  - `apps/web/src/lib/api-client.ts:6`
  - `apps/mobile/constants/apiClient.ts:5`
- no repository usage of `createNestApiClient` outside package declaration.

Impact:

- duplicated behavior and divergence risk,
- higher maintenance overhead and inconsistent bug fixes.

### P2 - API response contract mismatch in shared types (`perPage` vs `per_page`)

Evidence:

- shared contract: `packages/shared-types/src/index.d.ts:37`
- API responses: 
  - `apps/api/app/Http/Controllers/Api/TaskController.php:64`
  - `apps/api/app/Http/Controllers/Api/TaskListController.php:32`

Impact:

- type-level confusion,
- brittle downstream integrations and AI tool assumptions.

### P2 - Soft-delete + unique constraints can block recreate flows

Evidence:

- soft delete and unique on life areas:
  - `apps/api/database/migrations/2026_03_15_230000_create_mvp_domain_tables.php:23`
  - `apps/api/database/migrations/2026_03_15_230000_create_mvp_domain_tables.php:25`
- soft delete and unique on task lists:
  - `apps/api/database/migrations/2026_03_15_230000_create_mvp_domain_tables.php:53`
  - `apps/api/database/migrations/2026_03_15_230000_create_mvp_domain_tables.php:55`

Impact:

- user can archive/delete a name and then fail to recreate same name,
- product friction in long-lived tenants.

### P3 - Authorization architecture drift (policy-based declared, query-scoped implemented)

Evidence:

- documented target: `docs/architecture/backend_strategy.md:28`
- implementation pattern is controller-level tenant/user filtering and
  `findOrFail`, without dedicated policy layer.

Impact:

- works today, but policy surface will become harder to govern as routes and
  roles grow.

## Strengths worth keeping

- broad backend feature test coverage passes (`61` feature tests green).
- integration audit/failure/replay baseline is present.
- multi-tenant filtering is consistently applied in query paths.
- AI surface is explicitly disabled for MVP and regression-protected.

## Recommended Work Split

### Next conversation (Planning Agent): convert findings to executable tasks

1. Define a hardening epic with explicit priorities: P0 -> P1 -> P2.
2. Split integration sync redesign into:
   - idempotency semantics,
   - async fan-out model,
   - chunked processing + pagination.
3. Define API contract governance tasks:
   - OpenAPI coverage for auth/integrations,
   - CI lint for both specs and route-contract parity checks.
4. Define client architecture tasks:
   - migrate web/mobile to shared runtime client,
   - normalize auth token strategy.
5. Define schema/task for soft-delete uniqueness policy.
6. Define AI-readiness contract:
   - stable machine-readable envelopes,
   - idempotent action semantics,
   - explicit tool-safe error taxonomy.

### Later conversation (Execution Agent): implementation order

1. Fix idempotency bug first (P0).
2. Move sync execution to true async job orchestration + chunking.
3. Add OpenAPI coverage for missing route groups and CI enforcement.
4. Replace duplicate app clients with shared runtime client.
5. Normalize response meta naming (`per_page`/`perPage`) with migration plan.
6. Resolve soft-delete uniqueness behavior with clear product policy.

## Suggested acceptance criteria baseline for the hardening program

- changed entity sync is never blocked by stale idempotency lock,
- sync endpoints return quickly and only enqueue work,
- OpenAPI covers all public endpoints and is CI-validated,
- web/mobile share one API runtime client implementation,
- contract metadata naming is consistent and tested,
- recreate-after-delete behavior is deterministic and tested.

