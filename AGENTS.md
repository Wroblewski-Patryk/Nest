# AGENTS.md

## Purpose

This repository uses a project-specific multi-agent workflow for building Nest
(LifeOS) without losing context across API, web, mobile, docs, and release
work.

Use these agents as separate conversation roles:

- Documentation Agent
- Planning Agent
- Execution Agent
- Review Agent

## Canonical Project Context

Read these before starting non-trivial work:

- `docs/README.md`
- `docs/governance/repository-structure-policy.md`
- `.codex/context/PROJECT_STATE.md`
- `.codex/context/TASK_BOARD.md`

Use planning fallbacks only when the task board has no executable task:

- `docs/planning/next_execution_wave_2026-03-21.md`
- `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md`
- `docs/planning/open-decisions.md`

## Global Rules (All Agents)

- Treat `.codex/context/TASK_BOARD.md` as the canonical execution queue.
- Treat `.codex/context/PROJECT_STATE.md` as the current repo snapshot.
- Do not invent completed work.
- Keep architecture, docs, and task state synchronized when repo truth changes.
- Every meaningful change should update at least one of:
  - `docs/`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
- Follow the delivery loop:
  - plan
  - implement
  - run relevant validation
  - review what could be improved architecturally
  - sync task and project context
- Keep Nest constraints explicit:
  - multi-tenant domain model
  - human and AI actor support
  - web and mobile parity for core modules
  - localization baseline (`en`, `pl`)
- For UX/UI tasks, use MCP-based design context first:
  - Primary source: Figma MCP when available
  - Optional source: approved Stitch snapshot only with explicit evidence
  - Exception process: `docs/ux/ux_stitch_source_of_truth_exception_workflow.md`
  - Implementation and review must validate against concrete artifacts

## Project Validation Baseline

Run the commands relevant to the surface you touched.

- API:
  - `php artisan test --testsuite=Integration --env=testing`
  - `php artisan test --testsuite=Unit --env=testing`
  - `php artisan test --testsuite=Feature --env=testing`
  - `php artisan security:controls:verify --json --env=testing`
- Web:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
  - `pnpm build`
  - `pnpm test:unit`
- Mobile:
  - `pnpm exec tsc --noEmit`
  - `pnpm exec expo export --platform web`
  - `pnpm test:unit`
- Contracts:
  - `pnpm --package=@redocly/cli dlx redocly lint docs/openapi_*.yaml`

## Agent Routing

### Documentation Agent

Use when defining assumptions, architecture, scope, policies, and product
rules.

Primary files:

- `docs/product/*.md`
- `docs/architecture/*.md`
- `docs/governance/*.md`
- `docs/planning/*.md`
- `.codex/context/PROJECT_STATE.md`

### Planning Agent

Use when turning decisions into executable tasks and sequencing delivery.

Primary files:

- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- `.codex/templates/task-template.md`
- `docs/planning/*.md`

### Execution Agent

Use when implementing a scoped task from the board.

Primary files:

- `apps/`
- `packages/`
- `scripts/`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`

### Review Agent

Use for QA, code review, risk checks, and definition-of-done validation.

Primary files:

- changed implementation files
- related docs under `docs/`
- `.codex/context/TASK_BOARD.md`

## Definition Of Done

A task is done only when:

- implementation or documentation output exists,
- relevant acceptance criteria are checked,
- relevant tests or validations were run,
- follow-up architecture note is captured if needed,
- task status is updated in the board,
- `.codex/context/PROJECT_STATE.md` reflects reality.
