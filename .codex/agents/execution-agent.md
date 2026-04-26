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
