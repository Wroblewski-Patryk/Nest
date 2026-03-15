# TASK_BOARD

Last updated: 2026-03-15

## Backlog

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
