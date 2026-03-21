# AGENTS.md

## Purpose

This repository uses a multi-chat workflow for building Nest (LifeOS) in
parallel without losing context quality.

Use these agents as separate conversation roles:

- Documentation Agent
- Planning Agent
- Execution Agent
- Review Agent

## Global Rules (All Agents)

- Keep documentation aligned with `docs/README.md` and
  `docs/governance/repository-structure-policy.md`.
- Keep task state in `.codex/context/TASK_BOARD.md` up to date.
- Keep current snapshot in `.codex/context/PROJECT_STATE.md` up to date.
- Do not invent completed work.
- Every meaningful change must update at least one of:
  - `docs/`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
- For UX/UI tasks, use MCP-based design context first:
  - Primary source: Figma MCP (design context + screenshots + assets).
  - Optional source: Stitch MCP as ideation input, never as sole source of truth.
  - Exception process: `docs/ux/ux_stitch_source_of_truth_exception_workflow.md`.
  - Implementation and review must validate against concrete design artifacts.

## Agent Routing

### Documentation Agent

Use when defining assumptions, architecture, scope, decisions, and product rules.

Primary files:

- `docs/product/*.md`
- `docs/architecture/*.md`
- `docs/governance/*.md`
- `docs/README.md`
- `.codex/context/PROJECT_STATE.md`

### Planning Agent

Use when turning decisions into executable tasks and sequencing delivery.

Primary files:

- `docs/planning/*.md`
- `.codex/context/TASK_BOARD.md`
- `.codex/templates/task-template.md`
- `.codex/context/PROJECT_STATE.md`

### Execution Agent

Use when implementing tasks from the board.

Primary files:

- codebase files in `apps/`, `packages/`, `scripts/`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`

### Review Agent

Use for QA, code review, risk checks, and definition-of-done validation.

Primary files:

- changed implementation files
- relevant docs under `docs/`
- `.codex/context/TASK_BOARD.md`

## Workflow Contract

1. Documentation Agent updates product/architecture/governance truth.
2. Planning Agent translates truth into executable tasks.
3. Execution Agent implements scoped tasks.
4. Review Agent validates quality and closure criteria.

## Definition of Done (Task)

A task is done only when:

- implementation (or documentation output) exists,
- acceptance criteria are checked,
- task status is updated in board,
- `.codex/context/PROJECT_STATE.md` reflects reality.
