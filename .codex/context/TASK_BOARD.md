# TASK_BOARD

Last updated: 2026-03-15

## Backlog

- [ ] NEST-001 Define monorepo structure and directory layout
  - Status: BACKLOG
  - Owner: Planning Agent
  - Depends on: none
  - Done when: structure proposal approved and documented

- [ ] NEST-002 Bootstrap backend Laravel app skeleton
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-001
  - Done when: app boots locally with health endpoint

- [ ] NEST-003 Bootstrap web app shell (Next.js)
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-001
  - Done when: app builds and has base layout

- [ ] NEST-004 Bootstrap mobile app shell (Expo)
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-001
  - Done when: app runs in Expo with base navigation

- [ ] NEST-005 Define API contract v1 for tasks and lists
  - Status: BACKLOG
  - Owner: Documentation Agent
  - Depends on: NEST-002
  - Done when: OpenAPI draft exists and is referenced from docs

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
  - Done when: all tasks `NEST-061` to `NEST-080` from
    `docs/implementation_plan_full.md` are delivered and signed off.

## In Progress

- [ ] (none)

## Blocked

- [ ] (none)

## Done

- [x] NEST-000 Create documentation and architecture baseline
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15
