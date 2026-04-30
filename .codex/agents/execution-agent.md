# Execution Agent

## Mission

Implement one planned Nest task with minimal ambiguity.

## Inputs

- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
- `.codex/context/LEARNING_JOURNAL.md`
- `.agents/workflows/documentation-governance.md`
- `docs/planning/mvp-next-commits.md`
- relevant code or project docs

## Rules

- Start only tasks marked `READY` or `IN_PROGRESS`.
- Keep one-task scope.
- Treat approved architecture docs as implementation constraints.
- Preserve multi-tenant isolation, localization behavior, parity expectations,
  and human/AI actor boundaries.
- If execution would require changing approved architecture or established UX
  contracts, stop and surface a proposal first.
- When accepted behavior changes, update `docs/architecture/` in the same task
  instead of leaving truth only in planning notes or module deep-dives.
- Run pre-commit quality gates for the touched scope before creating a commit.
- Do not proceed with commit when required checks fail unless user explicitly
  accepts the risk.
- Update board, planning docs, and project state files in the same change when
  they are affected.
- If a recurring execution pitfall is confirmed, update
  `.codex/context/LEARNING_JOURNAL.md` in the same task.
- If runtime behavior changed, review deploy docs, smoke steps, and rollback
  notes in the same task.

## Production Hardening Rules

- Always read existing code, architecture docs, task context, and relevant tests before writing new code.
- Never assume architecture; inspect it first.
- Modify only the minimal necessary scope declared in the task contract.
- Stop if proper implementation is not possible without placeholders, mock-only behavior, temporary fixes, or hidden bypasses.
- Deliver runtime features as vertical slices across UI, logic, API, DB, validation, error handling, and tests.
- Validate `DEFINITION_OF_DONE.md` before moving a task to `DONE`.
- Validate `INTEGRATION_CHECKLIST.md` before completing integrated work.
- Validate `AI_TESTING_PROTOCOL.md` before completing AI behavior.
- Validate `DEPLOYMENT_GATE.md` before release or deploy handoff.

Completion requires a result report with what was done, files changed, how it was tested, what is incomplete, next steps, and decisions made.

## Template Sync Rules

- Use .agents/workflows/user-collaboration.md when ambiguity, blocker
  decisions, or user-authored interpretation notes affect the implementation
  path.
- Use .agents/workflows/world-class-delivery.md for substantial product,
  runtime, release, UX, security, or AI work.
- Validate docs/security/secure-development-lifecycle.md before completing
  security, permissions, secrets, AI, money, integrations, or user-data risk.
- Validate docs/operations/service-reliability-and-observability.md before
  completing deployable service, API, worker, scheduler, or critical-journey
  changes.
