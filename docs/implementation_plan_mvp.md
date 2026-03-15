# Implementation Plan (MVP)

Last updated: 2026-03-15

## Purpose

This document defines the executable MVP implementation backlog for Nest and
the mandatory quality/commit rules for delivery.

For post-MVP phases (integration expansion, intelligence, SaaS hardening), see
`docs/implementation_plan_full.md`.

## Backlog (NEST-001 to NEST-029)

### Foundation

- [ ] NEST-001 Define monorepo structure and directory layout
  - Depends on: none
  - Acceptance criteria: structure proposal approved and documented.

- [ ] NEST-002 Bootstrap backend Laravel app skeleton
  - Depends on: NEST-001
  - Acceptance criteria: app boots locally and exposes health endpoint.

- [ ] NEST-003 Bootstrap web app shell (Next.js)
  - Depends on: NEST-001
  - Acceptance criteria: app builds and includes base layout.

- [ ] NEST-004 Bootstrap mobile app shell (Expo)
  - Depends on: NEST-001
  - Acceptance criteria: app runs in Expo with base navigation.

- [ ] NEST-006 Configure minimum CI pipeline
  - Depends on: NEST-002, NEST-003, NEST-004
  - Acceptance criteria: lint/test/build/security checks and API contract
    validation run in GitHub Actions.

### API and Data Contract

- [ ] NEST-005 Define API contract v1 for tasks and lists
  - Depends on: NEST-002
  - Acceptance criteria: OpenAPI draft exists and is referenced from docs.

- [ ] NEST-007 Extend API contract v1 for core modules
  - Depends on: NEST-005
  - Acceptance criteria: OpenAPI covers habits, routines, goals, targets,
    journal, life areas, and calendar events.

- [ ] NEST-008 Create shared API/domain types package
  - Depends on: NEST-007
  - Acceptance criteria: web and mobile consume one shared type/schema package.

- [ ] NEST-009 Design PostgreSQL schema for MVP
  - Depends on: NEST-007
  - Acceptance criteria: tenant-ready schema with FKs, indexes, and sync mapping
    entities is documented and migrated.

- [ ] NEST-010 Create migrations and baseline seed data
  - Depends on: NEST-009
  - Acceptance criteria: migrations run cleanly and baseline dictionaries are
    seeded (statuses, priorities, life areas).

### Backend Modules

- [ ] NEST-011 Implement auth and user settings
  - Depends on: NEST-010
  - Acceptance criteria: Sanctum auth works, user timezone/settings are
    persisted and validated.

- [ ] NEST-012 Implement tasks and lists module
  - Depends on: NEST-011
  - Acceptance criteria: CRUD + pagination/filter/sort + priority/due date work
    through API.

- [ ] NEST-013 Implement habits and routines module
  - Depends on: NEST-011
  - Acceptance criteria: habit logging and routine sequences work through API.

- [ ] NEST-014 Implement goals and targets module
  - Depends on: NEST-011
  - Acceptance criteria: goals and measurable targets support progress updates.

- [ ] NEST-015 Implement journal and life areas module
  - Depends on: NEST-011
  - Acceptance criteria: journal entries and life-area tagging/balance view data
    are available through API.

- [ ] NEST-016 Implement calendar module
  - Depends on: NEST-011
  - Acceptance criteria: internal calendar events can be created/updated and
    linked to planning flows.

- [ ] NEST-017 Implement integration infrastructure
  - Depends on: NEST-011
  - Acceptance criteria: adapters, mapping tables, idempotency keys,
    retry/backoff, and dead-letter handling are operational.

- [ ] NEST-018 Deliver list/task integration baseline (Trello + Google Tasks)
  - Depends on: NEST-012, NEST-017
  - Acceptance criteria: list/task integration baseline exists for Trello and
    Google Tasks with provider mapping and idempotent sync jobs.

- [ ] NEST-019 Enforce no end-user AI surface in MVP
  - Depends on: NEST-011
  - Acceptance criteria: AI UI and public AI endpoints remain disabled in MVP
    scope, with feature-flag policy and documentation in place.

- [ ] NEST-020 Add observability baseline
  - Depends on: NEST-012, NEST-017
  - Acceptance criteria: structured logs, trace IDs, and metrics for API/queue/
    sync failures are available.

### Web and Mobile Delivery

- [ ] NEST-021 Deliver web MVP screens
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Acceptance criteria: MVP module screens work in web app.

- [ ] NEST-022 Deliver mobile MVP screens
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Acceptance criteria: MVP module screens work in mobile app with parity.

- [ ] NEST-023 Implement shared UX state patterns and telemetry names
  - Depends on: NEST-021, NEST-022
  - Acceptance criteria: loading/empty/error/success states and telemetry naming
    are consistent across clients.

- [ ] NEST-024 Integrate clients with shared API client/types
  - Depends on: NEST-008, NEST-021, NEST-022
  - Acceptance criteria: both clients consume shared contracts end-to-end.

### Quality, Security, Release Readiness

- [ ] NEST-025 Add backend test suites
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016, NEST-017
  - Acceptance criteria: unit/feature/integration coverage exists for core and
    sync flows.

- [ ] NEST-026 Add frontend/mobile test suites
  - Depends on: NEST-021, NEST-022, NEST-024
  - Acceptance criteria: unit + smoke E2E for critical user paths exist.

- [ ] NEST-027 Implement security baseline controls
  - Depends on: NEST-011, NEST-017, NEST-019
  - Acceptance criteria: encrypted credentials, least-privilege scopes, and
    dependency/CVE checks are active.

- [ ] NEST-028 Run backup and restore drill with documentation
  - Depends on: NEST-020
  - Acceptance criteria: backup/restore procedure is tested and runbook is
    documented with outcomes.

- [ ] NEST-029 Finalize MVP release checklist and staging sign-off
  - Depends on: NEST-018, NEST-019, NEST-025, NEST-026, NEST-027, NEST-028
  - Acceptance criteria: release checklist is complete and staging sign-off is
    recorded for MVP scope (email/password auth, no end-user AI, internal
    calendar module).

## Quality Gates Before Commit

Every commit must pass all gates below.

### 1) Automated checks

- Run all available automated checks relevant to changed areas (tests/lint/
  typecheck).
- Run build checks for impacted apps/services where commands exist.
- If full automation is not yet available, run the best available automated
  subset and explicitly record the gap in PR/commit notes.

### 2) Manual checks

- Verify critical flows touched by the change.
- Verify regression risk for both behavior and UI view consistency
  (desktop/mobile where applicable).
- Verify documentation/context consistency across `docs/`,
  `.codex/context/TASK_BOARD.md`, and `.codex/context/PROJECT_STATE.md`.

### 3) Scope and regression control

- Review changed file list to confirm only intended files were modified.
- Perform targeted regression checks for adjacent functionality likely to be
  impacted.
- Do not commit if any critical regression is unresolved.

## Commit Standard

- Use Conventional Commits (`type(scope): summary`).
- Keep commits small and single-purpose.
- Do not combine unrelated changes in one commit.
- Do not commit before quality gates pass.
- Include short notes for manual checks and known test coverage gaps when
  applicable.

## Definition of Done Reminder

A task is done only when:

- implementation/document output exists,
- acceptance criteria are validated,
- task status is updated in board,
- project state reflects the new reality.
