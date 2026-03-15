# TASK_BOARD

Last updated: 2026-03-15

## Backlog

- [x] NEST-015 Implement journal and life areas module
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: journal and life area tagging/balance data are available.
  - Done on: 2026-03-15
  - Notes:
    - Delivered life areas CRUD endpoints (`/api/v1/life-areas`) with archived
      filtering support.
    - Delivered journal entries CRUD endpoints (`/api/v1/journal-entries`) with
      mood filtering and search.
    - Delivered tenant-scoped journal life area tagging via pivot table and
      feature tests for module behavior.

- [x] NEST-016 Implement internal calendar module
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: calendar planning/events work without external sync dependency.
  - Done on: 2026-03-15
  - Notes:
    - Delivered calendar event CRUD endpoints (`/api/v1/calendar-events`).
    - Added range/all-day/linked-entity filtering for event listing.
    - Added tenant-scoped validation for linked entities (`task`, `goal`,
      `routine`) and feature test coverage.

- [x] NEST-017 Implement integration infrastructure
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: adapters, mapping, idempotency, retry, and DLQ are in place.
  - Done on: 2026-03-15
  - Notes:
    - Added integration adapter registry baseline with `trello` and
      `google_tasks` adapters.
    - Added sync orchestration service with idempotency lock and `sync_mappings`
      upsert flow.
    - Added queued sync job with retry/backoff and dead-letter persistence in
      `integration_sync_failures`.

- [x] NEST-018 Deliver list/task integration baseline (Trello + Google Tasks)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-017
  - Done when: list/task sync baseline works for Trello and Google Tasks.
  - Done on: 2026-03-15
  - Notes:
    - Added authenticated endpoint to trigger list/task sync baseline:
      `POST /api/v1/integrations/list-task-sync`.
    - Added list/task provider sync flow for `trello` and `google_tasks` on top
      of integration job infrastructure and `sync_mappings`.
    - Added idempotent re-sync behavior (unchanged payloads skipped) with
      feature test coverage for provider sync and tenant scope.

- [ ] NEST-019 Enforce no end-user AI surface in MVP
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-011
  - Done when: AI UI/public endpoints are disabled in MVP and documented.

- [ ] NEST-020 Add observability baseline
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-017
  - Done when: logs, trace IDs, and core API/queue/sync metrics are active.

- [ ] NEST-021 Deliver web MVP screens
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Done when: MVP module screens work in web app.

- [ ] NEST-022 Deliver mobile MVP screens
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Done when: MVP module screens work in mobile app.

- [ ] NEST-023 Align shared UX states and telemetry naming
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-021, NEST-022
  - Done when: loading/empty/error/success and telemetry naming are aligned.

- [ ] NEST-024 Integrate clients with shared API client/types
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-008, NEST-021, NEST-022
  - Done when: both clients use shared client/types end-to-end.

- [ ] NEST-025 Add backend test suites
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016, NEST-017
  - Done when: unit/feature/integration tests cover core behavior.

- [ ] NEST-026 Add frontend/mobile test suites
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-021, NEST-022, NEST-024
  - Done when: client unit/smoke tests cover critical paths.

- [ ] NEST-027 Implement security baseline controls
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-011, NEST-017
  - Done when: credential protection and dependency security checks are active.

- [ ] NEST-028 Run backup and restore drill with documentation
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-020
  - Done when: backup/restore drill is executed and documented.

- [ ] NEST-029 Finalize MVP release checklist and staging sign-off
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-018, NEST-019, NEST-025, NEST-026, NEST-027, NEST-028
  - Done when: MVP sign-off is recorded for agreed scope.

- [ ] NEST-030 Enforce quality gate before commit
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: none
  - Done when:
    - automated checks are defined and executed before commits,
    - manual regression checklist (feature + UI) is applied before commits,
    - unintended change detection (`git diff --name-only` + diff review) is
      part of commit workflow.

- [ ] NEST-031 Phase 2 integration expansion release program
  - Status: BACKLOG
  - Owner: Planning Agent
  - Depends on: NEST-029
  - Done when: all tasks `NEST-031` to `NEST-045` from
    `docs/implementation_plan_full.md` are delivered and signed off.

- [ ] NEST-046 Phase 3 intelligence and insights release program
  - Status: BACKLOG
  - Owner: Planning Agent
  - Depends on: NEST-031
  - Done when: all tasks `NEST-046` to `NEST-060` from
    `docs/implementation_plan_full.md` are delivered and signed off.

- [ ] NEST-061 Phase 4 SaaS hardening release program
  - Status: BACKLOG
  - Owner: Planning Agent
  - Depends on: NEST-046
  - Done when: all tasks `NEST-061` to `NEST-081` from
    `docs/implementation_plan_full.md` are delivered and signed off.

- [ ] NEST-082 Resolve documentation phase sequencing inconsistencies
  - Status: BACKLOG
  - Owner: Documentation Agent
  - Depends on: none
  - Done when: AI and integration sequencing are consistent across roadmap,
    MVP scope, AI layer, and implementation plans.

## In Progress

- [ ] (none)

## Blocked

- [ ] (none)

## Done

- [x] NEST-000 Create documentation and architecture baseline
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15

- [x] NEST-001 Define monorepo structure and directory layout
  - Status: DONE
  - Owner: Planning Agent
  - Done on: 2026-03-15
  - Notes: approved structure documented in `docs/monorepo_structure.md`.

- [x] NEST-002 Bootstrap backend Laravel app skeleton
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Laravel app bootstrapped in `apps/api`.
    - Health endpoint available at `GET /health`.
    - Baseline tests pass (`php artisan test`).

- [x] NEST-003 Bootstrap web app shell (Next.js)
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Next.js app shell bootstrapped in `apps/web` (TypeScript + App Router).
    - Base layout present in `apps/web/app/layout.tsx`.
    - Production build passes (`pnpm build` in `apps/web`).

- [x] NEST-004 Bootstrap mobile app shell (Expo)
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Expo app shell bootstrapped in `apps/mobile` (Expo Router tabs template).
    - Base navigation available via tabs routes.
    - Web export/build passes (`pnpm exec expo export --platform web`).

- [x] NEST-005 Define API contract v1 for tasks and lists
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15
  - Notes:
    - OpenAPI draft created in `docs/openapi_tasks_lists_v1.yaml`.
    - Contract is referenced from `docs/api_contracts.md` and
      `docs/backend_strategy.md`.

- [x] NEST-006 Configure minimum CI pipeline
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - GitHub Actions workflow added: `.github/workflows/ci.yml`.
    - Includes lint/test/build/security checks for backend, web, and mobile.
    - Includes OpenAPI contract validation for `docs/openapi_tasks_lists_v1.yaml`.

- [x] NEST-007 Define API contract v1 for remaining MVP modules
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15
  - Notes:
    - OpenAPI draft created in `docs/openapi_core_modules_v1.yaml`.
    - Covers habits/routines, goals/targets, journal, life areas, and calendar.
    - Referenced from `docs/api_contracts.md` and `docs/backend_strategy.md`.

- [x] NEST-008 Create shared API/domain types package
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Shared package created in `packages/shared-types` as `@nest/shared-types`.
    - Web and mobile apps consume shared types via local package dependency.
    - Type/build checks pass for both apps with shared package usage.

- [x] NEST-009 Design PostgreSQL schema for MVP domain
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Tenant-ready MVP schema migrated with FK constraints and composite indexes.
    - Includes sync mapping entity baseline (`sync_mappings`).
    - Schema documented in `docs/mvp_database_schema.md`.

- [x] NEST-010 Create migrations and baseline seed data
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Added reference dictionary migration (`task_statuses`, `task_priorities`,
      `life_area_templates`).
    - Added baseline dictionary seeder (`ReferenceDictionarySeeder`).
    - `migrate:fresh --seed` passes with baseline tenant/user and life areas.

- [x] NEST-011 Implement auth and user settings
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Sanctum installed and token table migrated for UUID users.
    - API auth endpoints delivered (`register`, `login`, `logout`, `me`).
    - User settings update endpoint delivered (`PATCH /api/v1/auth/settings`).

- [x] NEST-012 Implement tasks and lists module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered list CRUD endpoints (`/api/v1/lists`).
    - Delivered task CRUD endpoints (`/api/v1/tasks`).
    - Added filter/sort/pagination for task listing and tenant-scoped access.

- [x] NEST-013 Implement habits and routines module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered habits CRUD + logging endpoints (`/api/v1/habits`, `/logs`).
    - Delivered routines CRUD endpoints with ordered step sequences.
    - Added tenant-scoped feature tests for habits/routines module.

- [x] NEST-014 Implement goals and targets module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered goals CRUD endpoints (`/api/v1/goals`).
    - Delivered targets CRUD endpoints (`/api/v1/targets`).
    - Added measurable target update flow and tenant-scoped feature tests.
