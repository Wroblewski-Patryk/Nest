# AGENTS.md - Nest (LifeOS)

## Purpose

This repository follows a project-specific multi-agent workflow so execution
can move quickly without losing architecture truth, parity discipline, UX
quality, or task context across API, web, mobile, and docs.

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
- `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md`
  (fallback context)

### Governance

- `docs/governance/working-agreements.md`
- `docs/governance/language-policy.md`
- `docs/governance/repository-structure-policy.md`
- `docs/governance/subagent-delegation-policy.md`
- `docs/governance/code-quality-guardrails.md` (optional)
- `docs/governance/template-usage.md`
- `docs/governance/new-project-bootstrap.md`
- `docs/governance/function-coverage-ledger-standard.md`
- `docs/governance/function-coverage-ledger-template.csv`

### Architecture and UX Truth

- `docs/architecture/README.md`
- `docs/architecture/architecture-source-of-truth.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/tech-stack.md`
- `docs/ux/ux-ui-mcp-collaboration.md`
- `docs/ux/visual-direction-brief.md`
- `docs/ux/experience-quality-bar.md`
- `docs/ux/design-memory.md`
- `docs/ux/screen-quality-checklist.md`
- `docs/ux/anti-patterns.md`
- `docs/ux/brand-personality-tokens.md`
- `docs/ux/canonical-visual-implementation-workflow.md`
- `docs/ux/background-and-decorative-asset-strategy.md`

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

### 4. Task Contract Is Mandatory

Every task must be written using `.codex/templates/task-template.md` and must
include:

- `Context`
- `Goal`
- `Constraints`
- `Definition of Done`
- `Forbidden`

### 5. Scope And Delivery Discipline

- Keep changes tiny, testable, and reversible.
- Run relevant validations before commit.
- Do not mark work done without evidence.
- Keep planning docs, task board, project state, and architecture docs in sync
  when repo truth changes.
- When active work is unclear, a release or handoff needs confidence, or the
  queue goes stale, use the function coverage ledger standard to turn Nest
  module confidence gaps into explicit evidence, blocker, fix, or scope-decision
  tasks before inventing new feature work.
- If a coverage ledger exists, derive follow-up tasks in this order: release
  blockers, implementation-review rows, `P0` evidence rows, `P0/P1` unverified
  rows, then lower-priority scope decisions.
- Do not turn every `PARTIAL` or evidence-missing ledger row into feature work.
  Plan verification first, then create a narrow fix only when proof or code
  inspection finds a real defect.

### 6. Stage-Based Delivery Workflow

Every task must declare its current delivery stage and the output expected from
that stage.

Supported stages:
- `intake`
- `analysis`
- `planning`
- `implementation`
- `verification`
- `release`
- `post-release`

Rules:
- Do not skip stages implicitly.
- Do not implement during `analysis` or `planning` unless explicitly requested.
- Do not declare a task complete without `verification` evidence.
- If missing information materially affects quality or risk, stop at the
  current stage and surface the gap.

### 7. Nest-Specific Runtime Constraints

- preserve multi-tenant isolation and data ownership boundaries
- preserve human and AI actor contract boundaries
- preserve web and mobile parity for core module behavior
- preserve localization baseline (`en`, `pl`) and locale-aware routing behavior

### 8. UX/UI Contract

- Primary source: Figma MCP when available.
- Stitch may be used for ideation only, except approved exception workflow:
  - `docs/ux/ux_stitch_source_of_truth_exception_workflow.md`
- For UX-heavy work, require states, responsive checks, accessibility checks,
  and parity evidence.
- Reuse existing shared patterns before shipping route-local styling.
- If no approved pattern fits, create a reusable pattern and record it in
  `docs/ux/design-memory.md`.
- Use `docs/ux/visual-direction-brief.md` before broad UI refresh work.
- Use `docs/ux/screen-quality-checklist.md` before calling a screen polished.
- Use `docs/ux/canonical-visual-implementation-workflow.md` for canonical
  screenshot or mockup parity tasks.
- Use `docs/ux/background-and-decorative-asset-strategy.md` when dashboard art
  direction depends on illustration-rich or painterly backgrounds.
- Avoid normalizing mistakes listed in `docs/ux/anti-patterns.md`.
- Translate brand intent into practical UI decisions through
  `docs/ux/brand-personality-tokens.md`.
- Treat canonical visuals as implementation specs, not inspiration, when the
  fidelity target is pixel-close or structurally faithful.

### 9. Commit And Validation Contract

- Keep commits tiny, single-purpose, and reversible.
- Before creating a commit, run local quality gates relevant to the touched
  scope.
- Do not create a commit when required quality gates fail, unless the user
  explicitly approves a temporary exception.

## Autonomous Engineering Loop

Follow `docs/governance/autonomous-engineering-loop.md` for every autonomous iteration:

1. analyze current state
2. select exactly one priority task
3. plan implementation
4. execute implementation
5. verify and test
6. self-review
7. update documentation and knowledge

Before starting an iteration, perform the process self-audit from that document. Do not continue until all seven steps, one-task scope, and the correct operation mode are represented in the task contract.

Operation mode rotates by iteration number:

- `BUILDER`: default mode
- `ARCHITECT`: every third iteration, unless the iteration is also a tester iteration
- `TESTER`: every fifth iteration
## Agent Catalog

- Planner: `.agents/prompts/planner.md` or `.claude/agents/planner.agent.md`
- Product Docs: `.agents/prompts/product-docs.md` or
  `.claude/agents/product-docs.agent.md`
- Backend Builder: `.agents/prompts/backend-builder.md` or
  `.claude/agents/backend-builder.agent.md`
- Frontend Builder: `.agents/prompts/frontend-builder.md` or
  `.claude/agents/frontend-builder.agent.md`
- QA/Test: `.agents/prompts/qa-test.md` or `.claude/agents/qa-test.agent.md`
- Security: `.agents/prompts/security-auditor.md` or
  `.claude/agents/security-auditor.agent.md`
- DB/Migrations: `.agents/prompts/db-migrations.md` or
  `.claude/agents/db-migrations.agent.md`
- Ops/Release: `.agents/prompts/ops-release.md` or
  `.claude/agents/ops-release.agent.md`
- Code Review: `.agents/prompts/code-reviewer.md`
- Codex Documentation Agent: `.codex/agents/documentation-agent.md`
- Codex Planning Agent: `.codex/agents/planning-agent.md`
- Codex Execution Agent: `.codex/agents/execution-agent.md`
- Codex Review Agent: `.codex/agents/review-agent.md`

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

## Production Hardening Gate

Canonical hardening files:

- `DEFINITION_OF_DONE.md`
- `INTEGRATION_CHECKLIST.md`
- `NO_TEMPORARY_SOLUTIONS.md`
- `DEPLOYMENT_GATE.md`
- `AI_TESTING_PROTOCOL.md`
- `.codex/agents/ai-red-team-agent.md`

Every task must include Goal, Scope, Implementation Plan, Acceptance Criteria, Definition of Done, and Result Report. A task is `DONE` only after `DEFINITION_OF_DONE.md` is satisfied with evidence.

Runtime features must be vertical slices across UI, logic, API, DB, validation, error handling, and tests. Partial implementations, placeholders, mock-only behavior, fake data, temporary fixes, and hidden bypasses are forbidden.

AI systems must be tested against prompt injection, data leakage, and unauthorized access before deployment. AI features require reproducible multi-turn scenarios from `AI_TESTING_PROTOCOL.md` and red-team review when risk is meaningful.

## Template Sync: World-Class Delivery Addendum

Use these additional standards for substantial product, runtime, release, UX,
security, or AI work:

- `.agents/workflows/user-collaboration.md`
- `.agents/workflows/world-class-delivery.md`
- `docs/governance/world-class-product-engineering-standard.md`
- `docs/operations/service-reliability-and-observability.md`
- `docs/security/secure-development-lifecycle.md`
- `docs/ux/evidence-driven-ux-review.md`

For substantial changes, define why the work matters, the smallest safe slice,
the success signal, the main failure mode, and the rollback or recovery path.
For deployable services or important journeys, define SLIs/SLOs, health checks,
alert routes, and error-budget posture when appropriate. For auth, AI, money,
secrets, permissions, integrations, or user-data work, use the secure
development lifecycle and include threat-model or abuse-case evidence.
