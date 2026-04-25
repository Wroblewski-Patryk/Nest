# AGENTS.md - Nest (LifeOS)

## Purpose

This repository follows a project-specific multi-agent workflow so execution
can move quickly without losing architecture truth, parity discipline, or task
context across API, web, mobile, and docs.

## Canonical Files

### Core Context

- `.codex/context/PROJECT_STATE.md`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/LEARNING_JOURNAL.md`
- `.agents/workflows/general.md`
- `.agents/workflows/documentation-governance.md`
- `.agents/workflows/subagent-orchestration.md`

### Planning

- `docs/planning/mvp-execution-plan.md`
- `docs/planning/mvp-next-commits.md`
- `docs/planning/open-decisions.md`
- `docs/planning/next_execution_wave_2026-03-21.md` (fallback context)
- `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md` (fallback context)

### Governance

- `docs/governance/working-agreements.md`
- `docs/governance/language-policy.md`
- `docs/governance/repository-structure-policy.md`
- `docs/governance/subagent-delegation-policy.md`
- `docs/governance/code-quality-guardrails.md` (optional)
- `docs/governance/template-usage.md`
- `docs/governance/new-project-bootstrap.md`

### Architecture and UX Truth

- `docs/architecture/README.md`
- `docs/architecture/architecture-source-of-truth.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/tech-stack.md`
- `docs/ux/ux-ui-mcp-collaboration.md`

## Core Rules

### 1. Architecture Is Source Of Truth

- `docs/architecture/` is the architecture authority.
- Implementation must stay aligned with approved architecture docs.
- If implementation does not fit architecture, stop and escalate before coding
  around it.

### 2. Critical Prohibitions

- Do not create new systems without explicit approval.
- Do not introduce workaround-only paths.
- Do not duplicate logic already covered by existing mechanisms.
- Always reuse approved patterns first.

### 3. Decision Mode For Mismatches

When architecture and implementation clash:

1. describe the problem
2. propose 2 to 3 valid options
3. wait for explicit user decision

### 4. Scope And Delivery Discipline

- Keep changes tiny, testable, and reversible.
- Run relevant validations before commit.
- Do not mark work done without evidence.
- Keep planning docs, task board, project state, and architecture docs in sync
  when repo truth changes.

### 5. Nest-Specific Runtime Constraints

- preserve multi-tenant isolation and data ownership boundaries
- preserve human and AI actor contract boundaries
- preserve web and mobile parity for core module behavior
- preserve localization baseline (`en`, `pl`) and locale-aware routing behavior

### 6. UX/UI Contract

- Primary source: Figma MCP when available.
- Stitch may be used for ideation only, except approved exception workflow:
  - `docs/ux/ux_stitch_source_of_truth_exception_workflow.md`
- For UX-heavy work, require states, responsive checks, accessibility checks,
  and parity evidence.

## Project Validation Baseline

Run commands relevant to touched surfaces.

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

## Definition Of Done

A task is done only when:

- implementation or documentation output exists
- acceptance criteria are verified
- required validations were run and recorded
- architecture follow-up is captured if discovered
- task status is updated in `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md` reflects current reality
