# PROJECT_STATE

Last updated: 2026-03-16

## Product

- Name: Nest (LifeOS)
- Goal: unified life orchestration platform with AI support
- Commercial intent: SaaS

## Product Decisions (Confirmed)

- Tenancy: multi-tenant architecture from day one
- Launch mode: one active user (founder)
- Audience: private users first, then family/friends shared collaboration
- Planning hierarchy: goals -> targets -> lists/tasks -> habits/routines ->
  calendar -> journal

## Platform Strategy

- Web app: desktop/tablet/mobile browser
- Mobile app: tablet/phone native
- Feature parity required for core modules

## Technical Baseline

- Backend: Laravel 12 + PHP 8.4
- Database: PostgreSQL 17 default (18 where stable in provider)
- Cache/Queue: Redis
- Web: Next.js 16 + React 19.2 + TypeScript 5.x
- Mobile: Expo SDK 55 + React Native + TypeScript 5.x
- Local default ports: API `9000`, Web `9001`

## Current Phase

- Architecture and documentation foundation complete
- Planning baseline complete for MVP and full-product roadmap
- `NEST-001` completed: monorepo structure approved and documented in
  `docs/monorepo_structure.md`
- `NEST-002` completed: Laravel backend skeleton bootstrapped in `apps/api`
  with health endpoint (`GET /health`) and passing baseline tests
- `NEST-003` completed: Next.js web shell bootstrapped in `apps/web` with
  baseline layout and passing production build
- `NEST-004` completed: Expo mobile shell bootstrapped in `apps/mobile` with
  base tabs navigation and passing web export build
- `NEST-005` completed: OpenAPI v1 draft for tasks/lists created in
  `docs/openapi_tasks_lists_v1.yaml` and referenced from docs
- `NEST-006` completed: minimum CI pipeline configured in
  `.github/workflows/ci.yml` (backend/web/mobile checks + security + OpenAPI validation)
- `NEST-007` completed: OpenAPI v1 draft for remaining MVP modules created in
  `docs/openapi_core_modules_v1.yaml` and referenced from docs
- `NEST-008` completed: shared API/domain package created in
  `packages/shared-types` and consumed by both web and mobile clients
- `NEST-009` completed: tenant-ready MVP PostgreSQL schema migrated with FK and
  index baseline (`apps/api/database/migrations/2026_03_15_230000_create_mvp_domain_tables.php`)
- `NEST-010` completed: baseline dictionary migration and seed data added
  (`task_statuses`, `task_priorities`, `life_area_templates`) with successful
  `migrate:fresh --seed` verification
- `NEST-011` completed: email/password auth and user settings API implemented
  with Sanctum token authentication
- `NEST-012` completed: tasks/lists API with CRUD + filter/sort/pagination and
  tenant isolation checks
- `NEST-013` completed: habits/routines API with habit logging and routine step
  sequences, covered by feature tests
- `NEST-014` completed: goals/targets API with CRUD and measurable progress
  update support, covered by feature tests
- `NEST-015` completed: journal/life areas API with CRUD, mood/search filtering,
  archived life area support, and tenant-scoped journal tagging
- `NEST-016` completed: internal calendar events API with CRUD, planning window
  filters, and tenant-scoped linked entity validation
- `NEST-017` completed: integration infrastructure baseline with provider
  adapter registry, sync mapping/idempotency service, queued retries, and DLQ
  persistence
- `NEST-018` completed: list/task integration baseline for `trello` and
  `google_tasks` with authenticated sync trigger and idempotent re-sync
- `NEST-019` completed: MVP AI surface guard enforced with default-off feature
  flag, route-level absence checks, and documented policy
- `NEST-020` completed: observability baseline with API trace IDs, queue/sync
  counters, and middleware + queue event instrumentation
- `NEST-021` completed: web MVP module screens delivered for tasks/lists,
  habits/routines, goals/targets, journal/life areas, and calendar
- `NEST-022` completed: mobile MVP module screens delivered in Expo tabs for
  tasks/lists, habits/routines, goals/targets, journal/life areas, and calendar
- `NEST-023` completed: shared UX states and telemetry naming aligned across
  web/mobile clients through common type contracts
- `NEST-024` completed: web/mobile clients integrated with shared API client
  contract and shared domain response types
- `NEST-025` completed: backend unit/feature/integration suite baseline
  expanded with integration pipeline coverage
- `NEST-026` completed: frontend/mobile client unit and smoke checks added for
  UX contract and MVP route coverage
- `NEST-027` completed: integration credential security baseline added with
  encrypted token vault and revoke coverage tests
- `NEST-028` completed: backup/restore drill executed and documented with local
  integrity and recovery metrics
- `NEST-029` completed: MVP release checklist finalized with staging baseline
  sign-off record
- `NEST-030` completed: pre-commit quality gate workflow enforced with script,
  manual checklist acknowledgement, and diff review support
- `NEST-082` completed: documentation sequencing aligned so Phase 2 remains
  integration-focused and first end-user AI surface starts in Phase 3
- `NEST-085` completed: UX/UI MCP collaboration standard added with
  Figma-first design-source policy, optional Stitch ideation role, and
  evidence-gated UX implementation/review workflow
- `NEST-086` in progress: unified Stitch UX/UI approval baseline is being
  prepared before implementation, with design-system and acceptance spec in
  `docs/ux_ui_stitch_unified_spec_v1.md`
- `NEST-031` completed: post-MVP integration contract versioning strategy
  documented with compatibility, migration, rollback, and deprecation rules and
  linked from integration docs
- `NEST-032` completed: Trello sync reliability hardened with durable audit
  trail (`integration_sync_audits`) and strict sync mapping integrity checks
  with dedicated test coverage
- `NEST-033` completed: Google Tasks sync hardened with deterministic payload
  mapping, canonical sync hashing, and audit metadata for mapping version and
  retry profile
- `NEST-034` completed: demand-driven third list/task provider selected as
  Todoist with adapter registration, API support, and sync quality parity tests
- `NEST-035` completed: Google Calendar sync baseline added with dedicated
  calendar sync endpoint, audit metadata, and conflict-candidate detection for
  high-value event fields
- `NEST-036` completed: Obsidian sync baseline added for journal markdown note
  export with dedicated journal sync endpoint and audit-backed idempotent flow
- `NEST-037` completed: conflict queue API and UI workflows added for review
  and resolution (`accept`/`override`) of high-value sync conflicts across web
  and mobile calendar surfaces
- `NEST-038` completed: deterministic provider/field conflict policy matrix
  documented and enforced in queue logic with dedicated unit/feature coverage
- `NEST-039` completed: failed sync replay tooling added with tenant/user
  scoped failure listing, safe replay API, replay metadata tracking, and
  idempotency key rotation for deterministic reprocessing
- `NEST-040` completed: integration sync SLO baseline added with success
  rate/p95 latency targets, error budget burn evaluation, warning/critical
  thresholds, and runtime check command (`integrations:sync-slo-check`)
- `NEST-041` completed: provider connection management delivered across API,
  web, and mobile with tenant/user-scoped connect, reconnect, and revoke flows
  plus shared client contract coverage
- `NEST-042` completed: provider permission scope review screens added in web
  and mobile with granted scope visibility and least-privilege warnings for
  extra or missing permissions
- `NEST-043` completed: provider end-to-end integration regression suite added
  and enforced in CI with explicit Integration/Unit/Feature suite execution
- `NEST-044` completed: mobile push notification baseline delivered with
  device registration API, reminder dispatch command, explicit reminder scope,
  and delivery monitoring metrics/logging
- `NEST-045` completed: Phase 2 integration expansion release sign-off recorded
  with operational and product validation baseline
- `NEST-084` completed: strict architecture/programming/scalability/AI-readiness
  audit delivered with prioritized hardening recommendations and implementation
  sequencing (`docs/architecture_programming_scalability_ai_audit_2026-03-16.md`)
- `NEST-083` completed: post-MVP hardening plan translated from audit into
  sequenced P0/P1/P2 implementation backlog with dependencies and acceptance
  criteria (`docs/post_mvp_hardening_plan.md`)
- `NEST-046` completed: analytics event taxonomy documented with canonical
  envelope, naming rules, and v1 cross-module event dictionary
  (`docs/analytics_event_taxonomy.md`)
- `NEST-047` completed: analytics ingestion pipeline delivered with validated
  ingest API, durable event storage, and retention command baseline
- `NEST-048` completed: life-area balance scoring baseline delivered with
  formula-driven API endpoint, tenant/user scoped aggregation, and feature
  coverage
- `NEST-049` completed: trends API delivered for tasks/habits/goals with
  weekly/monthly bucket aggregation, tenant/user scope controls, and feature
  coverage
- `NEST-050` completed: insights UI delivered in web and mobile clients with
  life-area balance/trend API integration and fallback snapshots
- `NEST-051` completed: AI weekly planning baseline delivered with
  feature-gated API endpoint, explicit constraints, and rationale-backed
  proposal items
- `NEST-052` completed: AI recommendation responses now include reason codes
  and source-entity provenance payloads with explainability metadata
- `NEST-053` completed: AI planning suggestions now include confidence scoring
  and low-confidence guardrail routing to review queue
- `NEST-054` completed: AI feedback loop delivered with persistent
  accept/reject/edit recommendation tracking under tenant/user scope
- `NEST-055` completed: assistant policy regression suite delivered for AI
  planning context safety/guardrail rules with CI-backed coverage
- `NEST-056` completed: automation trigger/condition/action model and API
  contract draft documented for upcoming engine implementation
- `NEST-057` completed: automation engine delivered with rule CRUD, manual
  execution, and persisted execution run audits
- `NEST-058` completed: web automation builder delivered with rule creation,
  active/paused toggles, manual execution, and recent run visibility
- Current execution focus: automation execution history/debugging UI (`NEST-059`)

## Auth, AI, Offline, Notifications

- MVP auth: email + password
- OAuth providers: post-MVP
- AI: post-MVP rollout, default ON when introduced
- Offline: not planned in MVP
- Notifications: mostly post-MVP, simplest mobile push can be first

## Integrations Direction

- Sequence: list/task providers first (Trello + Google Tasks + Todoist),
  then Google Calendar, Obsidian last
- Long-term: up to 3 major providers per functional area where practical

## Planning Baseline

- MVP execution backlog: `docs/implementation_plan_mvp.md`
- Full-product execution backlog: `docs/implementation_plan_full.md`
- Roadmap overview: `docs/roadmap.md`

## Confirmed Decisions (2026-03-15)

- MVP launch profile: single active user on top of multi-tenant architecture.
- MVP auth: email + password only; OAuth providers are post-MVP.
- MVP AI policy: no end-user AI surface in MVP.
- Integration sequence: list/task providers first (Trello + Google Tasks +
  Todoist),
  Google Calendar after baseline, Obsidian as the last provider in initial
  wave.

## Working Agreements

- Every meaningful change must update at least one of:
  `docs/`, `.codex/context/TASK_BOARD.md`, `.codex/context/PROJECT_STATE.md`.
- Before each commit, run available automated checks for changed areas
  (tests/lint/typecheck/build where applicable).
- Before each commit, run manual regression checks for changed behavior and UI
  (desktop/mobile where applicable).
- Validate no unintended file changes before commit (`git diff --name-only` and
  diff review).
- Use Conventional Commits and keep commits small, single-purpose, and scoped.
- Do not mark tasks as DONE unless Definition of Done is fully satisfied
  (output + acceptance criteria + board status + updated project state).

## Canonical Docs

- `docs/overview.md`
- `docs/system_architecture.md`
- `docs/tech_stack.md`
- `docs/database_decision.md`
- `docs/frontend_strategy.md`
- `docs/ux_ui_mcp_collaboration.md`
- `docs/backend_strategy.md`
- `docs/monorepo_structure.md`
- `docs/api_contracts.md`
- `docs/development_and_deployment.md`
- `docs/openapi_core_modules_v1.yaml`
- `docs/mvp_database_schema.md`
