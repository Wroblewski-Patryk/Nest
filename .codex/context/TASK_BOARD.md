# TASK_BOARD

Last updated: 2026-03-16

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

- [x] NEST-019 Enforce no end-user AI surface in MVP
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-011
  - Done when: AI UI/public endpoints are disabled in MVP and documented.
  - Done on: 2026-03-15
  - Notes:
    - Added explicit MVP feature flag config with `AI_SURFACE_ENABLED=false`
      default in backend.
    - Added guard tests that enforce absence of public `/api/v1/ai/*` routes
      and verify AI endpoint pattern returns `404`.
    - Updated `docs/ai_layer.md` with MVP enforcement policy.

- [x] NEST-020 Add observability baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-017
  - Done when: logs, trace IDs, and core API/queue/sync metrics are active.
  - Done on: 2026-03-15
  - Notes:
    - Added API trace middleware with response header `X-Trace-Id` and logging
      context enrichment.
    - Added cache-based metric counter baseline for API, queue, and integration
      sync flows.
    - Added queue processed/failed hooks and observability feature tests.

- [x] NEST-021 Deliver web MVP screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Done when: MVP module screens work in web app.
  - Done on: 2026-03-16
  - Notes:
    - Replaced web shell with complete MVP navigation and screen set.
    - Delivered module screens for tasks/lists, habits/routines,
      goals/targets, journal/life areas, and calendar.
    - Verified frontend quality gates: `pnpm lint` and `pnpm build` pass with
      static routes generated for all MVP module pages.

- [x] NEST-022 Deliver mobile MVP screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Done when: MVP module screens work in mobile app.
  - Done on: 2026-03-16
  - Notes:
    - Replaced Expo template tabs with MVP module tab set.
    - Delivered mobile screens for tasks/lists, habits/routines,
      goals/targets, journal/life areas, and calendar.
    - Verified mobile web export build with
      `pnpm exec expo export --platform web`.

- [x] NEST-023 Align shared UX states and telemetry naming
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-021, NEST-022
  - Done when: loading/empty/error/success and telemetry naming are aligned.
  - Done on: 2026-03-16
  - Notes:
    - Extended shared types with aligned `UiAsyncState` and
      `TelemetryEventName` contracts.
    - Applied the same state labels and screen telemetry naming in both web and
      mobile clients.
    - Verified web and mobile build checks after alignment changes.

- [x] NEST-024 Integrate clients with shared API client/types
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-008, NEST-021, NEST-022
  - Done when: both clients use shared client/types end-to-end.
  - Done on: 2026-03-16
  - Notes:
    - Extended `@nest/shared-types` with typed API client contract and
      collection response types.
    - Integrated shared API client contract in both web and mobile apps with
      live `/lists` connectivity checks on tasks screens.
    - Verified client build checks (`pnpm lint`, `pnpm build`, Expo web export)
      after integration.

- [x] NEST-025 Add backend test suites
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016, NEST-017
  - Done when: unit/feature/integration tests cover core behavior.
  - Done on: 2026-03-16
  - Notes:
    - Added dedicated `Integration` test suite in `phpunit.xml`.
    - Added new unit tests for observability counter and integration adapter
      registry behavior.
    - Added end-to-end integration tests validating API task/list creation and
      provider sync pipeline idempotency.

- [x] NEST-026 Add frontend/mobile test suites
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-021, NEST-022, NEST-024
  - Done when: client unit/smoke tests cover critical paths.
  - Done on: 2026-03-16
  - Notes:
    - Added web unit contract and smoke route checks (`pnpm test:unit`,
      `pnpm test:smoke`).
    - Added mobile unit contract and smoke export route checks
      (`pnpm test:unit`, `pnpm test:smoke`).
    - Verified all new frontend/mobile test scripts pass.

- [x] NEST-027 Implement security baseline controls
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011, NEST-017
  - Done when: credential protection and dependency security checks are active.
  - Done on: 2026-03-16
  - Notes:
    - Added `integration_credentials` storage with encrypted token casts and
      tenant/user/provider uniqueness.
    - Added credential vault service supporting secure store, active lookup, and
      revoke flow.
    - Added feature tests validating encrypted-at-rest behavior and revoke
      protection.

- [x] NEST-028 Run backup and restore drill with documentation
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-020
  - Done when: backup/restore drill is executed and documented.
  - Done on: 2026-03-16
  - Notes:
    - Executed local backup/restore drill for API SQLite database snapshot.
    - Verified backup integrity with SHA256 checksum match.
    - Documented runbook and outcomes in `docs/backup_restore_drill.md`
      including observed RTO/RPO.

- [x] NEST-029 Finalize MVP release checklist and staging sign-off
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-018, NEST-019, NEST-025, NEST-026, NEST-027, NEST-028
  - Done when: MVP sign-off is recorded for agreed scope.
  - Done on: 2026-03-16
  - Notes:
    - Created formal MVP release checklist and staging sign-off artifact in
      `docs/mvp_release_checklist.md`.
    - Recorded scope, quality, security, and resilience gates as complete.
    - Added explicit sign-off record for MVP staging baseline.

- [x] NEST-030 Enforce quality gate before commit
  - Status: DONE
  - Owner: Review Agent
  - Depends on: none
  - Done when:
    - automated checks are defined and executed before commits,
    - manual regression checklist (feature + UI) is applied before commits,
    - unintended change detection (`git diff --name-only` + diff review) is
      part of commit workflow.
  - Done on: 2026-03-16
  - Notes:
    - Added local quality gate script (`scripts/quality-gate.ps1`) with scoped
      automated checks for API/web/mobile changes.
    - Added mandatory manual checklist acknowledgement gate.
    - Added untracked/staged/unstaged diff aggregation for unintended change
      review and documented workflow in `docs/quality_gate_workflow.md`.

- [x] NEST-031 Define post-MVP integration contract versioning strategy
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-029
  - Done when: provider contract/version policy and migration rules are
    documented and linked from integration docs.
  - Done on: 2026-03-16
  - Notes:
    - Defined post-MVP integration contract versioning strategy in
      `docs/integration_contract_versioning.md`.
    - Added explicit integration docs link to versioning strategy from
      `docs/integrations.md`.
    - Established migration, compatibility, deprecation, rollback, and
      validation rules for provider contract evolution.

- [x] NEST-032 Deliver Trello synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: list/task synchronization with Trello works with idempotency,
    mapping integrity, and audit trail.
  - Done on: 2026-03-16
  - Notes:
    - Added durable sync audit trail table/model (`integration_sync_audits`)
      for `success`, `duplicate_skipped`, and `failed` outcomes.
    - Enforced sync mapping integrity with conflict checks in integration sync
      service and unique internal mapping constraint in DB migrations.
    - Extended Trello integration coverage with tests validating idempotency,
      mapping integrity conflict protection, and audit persistence.

- [x] NEST-033 Deliver Google Tasks synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: list/task synchronization with Google Tasks works with retry/
    backoff and consistent field mappings.
  - Done on: 2026-03-16
  - Notes:
    - Hardened `GoogleTasksAdapter` with deterministic field mapping for
      `task_list` and `task` payloads and canonical `sync_hash` generation.
    - Extended sync metadata with mapping version and retry profile details
      persisted in integration audit trail.
    - Added tests for Google Tasks mapping consistency and retry/backoff
      profile coverage.

- [x] NEST-034 Deliver third list/task provider (demand-driven)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: one additional provider is selected by product demand and
    delivered with the same sync quality bar.
  - Done on: 2026-03-16
  - Notes:
    - Selected `todoist` as the demand-driven third list/task provider and
      integrated it into adapter registry and sync API validation.
    - Added deterministic Todoist mapping profile (`todoist.v1`) with canonical
      sync hash behavior and retry profile metadata.
    - Added unit and feature tests for Todoist sync behavior, mapping metadata,
      and end-to-end list/task synchronization.

- [x] NEST-035 Deliver Google Calendar synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033
  - Done when: calendar sync is delivered after list/task baseline and follows
    conflict/audit requirements.
  - Done on: 2026-03-16
  - Notes:
    - Added Google Calendar adapter (`google_calendar.v1`) and calendar sync
      API endpoint `POST /api/v1/integrations/calendar-sync`.
    - Delivered tenant/user-scoped calendar sync service with idempotent skip
      behavior and conflict-candidate detection for high-value event fields.
    - Persisted sync audit metadata for conflict detection and added dedicated
      unit/feature test coverage for calendar sync flows.

- [x] NEST-036 Deliver Obsidian synchronization as final provider in wave 1
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-035
  - Done when: markdown note sync is delivered as the last provider in initial
    integration sequence.
  - Done on: 2026-03-16
  - Notes:
    - Added Obsidian adapter (`obsidian.v1`) with journal entry to markdown note
      mapping and deterministic sync hashing.
    - Delivered authenticated journal sync API endpoint:
      `POST /api/v1/integrations/journal-sync` (`provider=obsidian`).
    - Added tenant/user-scoped journal sync service with idempotent re-sync
      behavior and audit metadata test coverage.

- [x] NEST-037 Implement conflict queue API + UI workflows
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036
  - Done when: users can review, accept, or override high-value field conflicts.
  - Done on: 2026-03-16
  - Notes:
    - Added persistent conflict queue domain (`integration_sync_conflicts`) with
      open/resolved lifecycle and resolution payload support.
    - Added conflict queue API routes for listing and resolving conflicts:
      `GET /api/v1/integrations/conflicts` and
      `POST /api/v1/integrations/conflicts/{conflictId}/resolve`.
    - Delivered web/mobile UI workflows on calendar screens to review open
      conflicts and execute `accept` or `override` actions.

- [x] NEST-038 Add deterministic conflict policy matrix by field/provider
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: documented policy is enforced in code and covered by tests.
  - Done on: 2026-03-16
  - Notes:
    - Added deterministic provider/field conflict matrix documentation in
      `docs/integration_conflict_policy_matrix.md`.
    - Implemented policy enforcement service used by conflict queue to persist
      only `manual_queue` fields.
    - Added unit and feature tests validating policy matrix output and queue
      filtering behavior for non-manual fields.

- [x] NEST-039 Add sync replay tooling for failed jobs
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: failed sync jobs can be replayed safely with idempotency guards.
  - Done on: 2026-03-16
  - Notes:
    - Added replay tracking metadata for failed sync records
      (`replay_count`, replay status/error/time, replay idempotency key).
    - Added replay tooling API routes:
      `GET /api/v1/integrations/failures` and
      `POST /api/v1/integrations/failures/{failureId}/replay`.
    - Added tenant/user-scoped replay service and feature tests covering list,
      replay success path, scope protection, and guest authorization.

- [x] NEST-040 Introduce sync SLOs and alert thresholds
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: SLO targets exist for success latency/error budget and alerting
    is configured.
  - Done on: 2026-03-16
  - Notes:
    - Added integration sync SLO config with success rate, p95 latency targets,
      and warning/critical alert thresholds.
    - Added integration sync SLO evaluation service and operational command
      `php artisan integrations:sync-slo-check` with severity-based signaling.
    - Added latency metric bucketing in sync flow plus unit/feature tests for
      SLO evaluation and command exit behavior.

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

- [ ] NEST-083 Deliver post-MVP hardening plan from architecture/code audit
  - Status: BACKLOG
  - Owner: Planning Agent
  - Depends on: NEST-040
  - Done when:
    - audit findings are translated into sequenced implementation tasks,
    - each task has acceptance criteria and dependency mapping,
    - execution order is defined with P0/P1/P2 priorities.
  - Notes:
    - Source audit: `docs/architecture_programming_scalability_ai_audit_2026-03-16.md`
    - Priority starts with sync idempotency correctness and async scalability.

- [x] NEST-082 Resolve documentation phase sequencing inconsistencies
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: none
  - Done when: AI and integration sequencing are consistent across roadmap,
    MVP scope, AI layer, and implementation plans.
  - Done on: 2026-03-16
  - Notes:
    - Aligned AI sequencing to start with first end-user surface in Phase 3.
    - Clarified that Phase 2 remains integration-only and AI surface stays
      disabled there.
    - Clarified MVP vs post-MVP integration scope wording in `docs/mvp_scope.md`.

- [x] NEST-084 Run strict architecture/programming/scalability/AI-readiness audit
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-040
  - Done when:
    - architecture and implementation are reviewed against documentation,
    - high-impact risks are prioritized by severity,
    - follow-up split is prepared for planning chat and execution chat.
  - Done on: 2026-03-16
  - Notes:
    - Audit delivered in
      `docs/architecture_programming_scalability_ai_audit_2026-03-16.md`.
    - Includes prioritized findings and recommended sequencing for next phases.

- [x] NEST-083 Establish UX/UI MCP collaboration standard
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-021, NEST-023
  - Done when: AI-to-AI UX workflow is documented, linked from frontend
    strategy, and embedded in agent operating contract.
  - Done on: 2026-03-16
  - Notes:
    - Added UX/UI MCP operating standard in
      `docs/ux_ui_mcp_collaboration.md`.
    - Linked UX/UI MCP standard from `docs/frontend_strategy.md`.
    - Updated `AGENTS.md` with mandatory UX/UI MCP contract for all agents.

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
