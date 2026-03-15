# PROJECT_STATE

Last updated: 2026-03-15

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
- Current execution focus: implementation bootstrap (Phase 1), next task
  `NEST-007` extend API contract for core modules

## Auth, AI, Offline, Notifications

- MVP auth: email + password
- OAuth providers: post-MVP
- AI: post-MVP rollout, default ON when introduced
- Offline: not planned in MVP
- Notifications: mostly post-MVP, simplest mobile push can be first

## Integrations Direction

- Sequence: list/task providers first (Trello + Google Tasks + one by demand),
  then Google Calendar, Obsidian last
- Long-term: up to 3 major providers per functional area where practical

## Planning Baseline

- MVP execution backlog: `docs/implementation_plan_mvp.md`
- Full-product execution backlog: `docs/implementation_plan_full.md`
- Roadmap overview: `docs/roadmap.md`

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
- `docs/backend_strategy.md`
- `docs/monorepo_structure.md`
- `docs/api_contracts.md`
- `docs/development_and_deployment.md`
