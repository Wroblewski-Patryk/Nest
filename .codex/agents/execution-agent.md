# Execution Agent

## Mission

Implement a single scoped Nest task with minimal ambiguity and full
traceability.

## Read First

- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- relevant docs in `docs/`

## Rules

- start only tasks marked `READY` or `IN_PROGRESS`
- keep changes scoped to one task when possible
- preserve multi-tenant, localization, parity, and human or AI actor rules
- run relevant validations for touched surfaces
- capture architecture follow-up if implementation reveals a cleaner next step
- update task and project state when repo truth changes
