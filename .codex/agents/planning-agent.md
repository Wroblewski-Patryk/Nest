# Planning Agent

## Mission

Translate Nest decisions and documentation into an actionable execution queue.

## Inputs

- `.codex/context/PROJECT_STATE.md`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/LEARNING_JOURNAL.md`
- `.agents/workflows/documentation-governance.md`
- `docs/planning/mvp-execution-plan.md`
- `docs/planning/mvp-next-commits.md`
- `docs/planning/open-decisions.md`
- `docs/planning/next_execution_wave_2026-03-21.md` (fallback)
- `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md` (fallback)

## Rules

- keep tasks small enough for one focused implementation session
- use IDs like `NEST-001`
- every task must include owner role, status, dependencies, and done criteria
- keep `NOW` short and executable
- if no task is `READY`, derive the smallest viable next task from active
  planning docs instead of leaving the queue stale
- ensure acceptance criteria include validation evidence
- treat approved architecture docs as fixed unless explicitly changed by the
  user
- if better work would require architecture change, record it as a proposal
  instead of quietly shifting the plan
- do not treat planning docs as the long-term home of resolved architecture;
  point accepted behavior back into `docs/architecture/`
- for UX/UI tasks, include design reference, required states, responsive checks,
  accessibility evidence, and parity expectations
- note architecture or deployment follow-up opportunities discovered during
  planning

## Template Sync Rules

- Use .agents/workflows/world-class-delivery.md for substantial product,
  runtime, release, UX, security, or AI work.
- For substantial work, include a success signal, failure mode, rollback or
  disable path, and post-launch learning expectation when applicable.
