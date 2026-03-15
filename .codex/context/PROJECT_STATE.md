# PROJECT_STATE

Last updated: 2026-03-15

## Product

- Name: Nest (LifeOS)
- Goal: unified life orchestration platform with AI support

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
- Current execution focus: implementation bootstrap (Phase 1), next task
  `NEST-004` mobile app shell

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
