# Audit Remediation Execution Handoff (Agent-Ready)

Date: 2026-03-19
Source audit: `docs/architecture_programming_scalability_ai_audit_2026-03-16.md`
Planning baseline: `docs/post_mvp_hardening_plan.md`

## Goal

Convert audit findings into execution-ready tasks so another agent can
implement them in sequence without additional discovery.

## Execution Rules

- One task = one PR.
- Keep branch names in format: `codex/nest-0XX-<short-topic>`.
- For each task run:
  - API: `php artisan test --testsuite=Feature --env=testing`
  - Web: `pnpm test:unit` (if web touched)
  - Mobile: `pnpm test:unit` (if mobile touched)
- Update docs + `.codex/context/TASK_BOARD.md` + `.codex/context/PROJECT_STATE.md`
  in the same PR.

## Task Queue (strict order)

### 1) NEST-087 - Fix sync idempotency correctness (P0)

- Objective:
  - remove stale-lock false duplicates for changed list/task/journal payloads.
- Primary files:
  - `apps/api/app/Integrations/Services/IntegrationSyncService.php`
  - `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php`
  - `apps/api/app/Integrations/Services/JournalIntegrationSyncService.php`
  - `apps/api/tests/Feature/IntegrationListTaskSyncApiTest.php`
  - `apps/api/tests/Feature/IntegrationJournalSyncApiTest.php`
- Required output:
  - idempotency key strategy that distinguishes changed payloads,
  - tests proving changed payload is processed and exact replay is deduplicated.
- Done when:
  - no legitimate update is skipped by previous lock semantics,
  - all integration sync feature tests pass.

### 2) NEST-088 - Enqueue-first sync execution (P1)

- Objective:
  - change sync endpoints to queue work and return quickly.
- Primary files:
  - `apps/api/app/Http/Controllers/Api/IntegrationSyncController.php`
  - `apps/api/app/Integrations/Services/*IntegrationSyncService.php`
  - `apps/api/app/Jobs/ProcessIntegrationSyncJob.php`
  - integration feature tests for sync endpoints.
- Required output:
  - async request/response flow with job reference payload,
  - preserved retry/failure/audit behavior.
- Done when:
  - endpoints do not execute full provider sync inline,
  - queue path remains observable and tested.

### 3) NEST-089 - Chunked sync processing (P1)

- Objective:
  - replace full `.get()` sync loads with bounded chunking/cursor flow.
- Primary files:
  - `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php`
  - `apps/api/app/Integrations/Services/JournalIntegrationSyncService.php`
  - `apps/api/app/Integrations/Services/CalendarIntegrationSyncService.php`
  - related feature/integration tests.
- Done when:
  - no full-table reads in sync services,
  - tests cover chunk boundary behavior.

### 4) NEST-090 - Runtime baseline alignment (PostgreSQL/Redis) (P1)

- Objective:
  - align env/runtime defaults with documented architecture.
- Primary files:
  - `apps/api/.env.example`
  - `apps/api/config/database.php`
  - `apps/api/config/queue.php`
  - `docs/system_architecture.md`
  - `docs/development_and_deployment.md`
- Done when:
  - docs and default runtime baseline are consistent,
  - local setup instructions cover PostgreSQL + Redis path explicitly.

### 5) NEST-091 - OpenAPI coverage + CI enforcement (P2)

- Objective:
  - close contract governance gap.
- Primary files:
  - `docs/openapi_*.yaml` (all active public groups)
  - `docs/api_contracts.md`
  - `.github/workflows/ci.yml`
- Done when:
  - CI validates all maintained OpenAPI specs,
  - auth/integration and new public groups are contract-documented.

### 6) NEST-092 - Shared runtime client convergence (P2)

- Objective:
  - remove duplicated web/mobile request client implementation.
- Primary files:
  - `packages/shared-types/src/client.js`
  - `packages/shared-types/src/client.d.ts`
  - `apps/web/src/lib/api-client.ts`
  - `apps/mobile/constants/apiClient.ts`
- Done when:
  - both apps instantiate shared runtime client only,
  - no duplicated `createClient` logic remains in apps.

### 7) NEST-093 - API meta shape normalization (P2)

- Objective:
  - resolve `perPage` vs `per_page` mismatch safely.
- Primary files:
  - `packages/shared-types/src/index.d.ts`
  - backend controllers returning pagination meta
  - client unit contract scripts.
- Done when:
  - one canonical shape is documented and used everywhere,
  - compatibility strategy is tested (if transitional aliases kept).

### 8) NEST-094 - Soft-delete uniqueness behavior policy + fix (P2)

- Objective:
  - deterministic recreate-after-delete behavior.
- Primary files:
  - `apps/api/database/migrations/*`
  - module controllers/models for affected entities
  - feature tests for recreate flows.
- Done when:
  - recreate behavior matches documented policy,
  - conflict/recreate edge cases are covered by tests.

### 9) NEST-095 - Policy-layer authorization consolidation (P2)

- Objective:
  - move key domains from pure query-scoping to explicit policy layer.
- Primary files:
  - `apps/api/app/Policies/*`
  - `apps/api/app/Providers/AuthServiceProvider.php` (or framework-equivalent)
  - selected API controllers.
- Done when:
  - policy checks enforce sensitive paths,
  - tests validate policy decisions + tenant isolation.

### 10) NEST-096 - AI-readiness envelope/error contract hardening (P2)

- Objective:
  - stable machine-readable envelope and actionable error taxonomy.
- Primary files:
  - API response/error formatting layer
  - shared type contracts
  - docs for AI/tool API contract and retry guidance.
- Done when:
  - deterministic envelope + error code schema is documented and implemented,
  - contract tests verify AI/tool compatibility.

## Quick Start for Execution Agent

1. Start with `NEST-087` only.
2. Open source audit and this handoff doc.
3. Implement minimal safe change + tests.
4. Update task status and project state.
5. Hand off to next task only after green checks.
