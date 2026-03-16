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

- Keep architecture and product docs in `docs/` aligned with real decisions.
- Keep task state in `.codex/context/TASK_BOARD.md` up to date.
- Keep current project snapshot in `.codex/context/PROJECT_STATE.md` up to date.
- Do not invent completed work.
- Every meaningful change must update at least one of:
  - `docs/`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
- For UX/UI tasks, use MCP-based design context first:
  - Primary source: Figma MCP (design context + screenshot + assets).
  - Optional source: Stitch MCP as ideation input, never as sole source of truth.
  - Implementation and review must validate against a concrete design artifact.

## Agent Routing

### Documentation Agent

Use when defining assumptions, architecture, scope, decisions, and product rules.

Primary files:

- `docs/*.md`
- `.codex/context/PROJECT_STATE.md`

### Planning Agent

Use when turning decisions into executable tasks and sequencing delivery.

Primary files:

- `.codex/context/TASK_BOARD.md`
- `.codex/templates/task-template.md`
- `.codex/context/PROJECT_STATE.md`

### Execution Agent

Use when implementing tasks from the board.

Primary files:

- codebase files (future app directories)
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`

### Review Agent

Use for QA, code review, risk checks, and definition-of-done validation.

Primary files:

- changed implementation files
- `.codex/context/TASK_BOARD.md`

## Workflow Contract

1. Documentation Agent defines or updates architecture/product truth.
2. Planning Agent translates that truth into tasks with acceptance criteria.
3. Execution Agent builds tasks and updates status.
4. Review Agent verifies quality and closes tasks.

## UX/UI MCP Contract

Use this contract whenever a task changes UX/UI:

1. Documentation Agent records UX intent, acceptance criteria, and design source
   (Figma link/node or approved equivalent) in docs.
2. Planning Agent creates executable tasks that include UX validation evidence
   requirements (screenshots, states, responsive behavior, accessibility checks).
3. Execution Agent implements only after pulling MCP design context and
   screenshot reference; then maps output to project conventions.
4. Review Agent blocks completion when visual parity, state behavior, or
   accessibility evidence is missing.

## Definition of Done (Task)

A task is done only when:

- implementation (or document output) exists,
- acceptance criteria are checked,
- task status is updated in board,
- `PROJECT_STATE.md` reflects the new reality.
