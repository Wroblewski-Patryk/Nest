# Stitch Source-of-Truth Exception Workflow

Last updated: 2026-03-19

## Purpose

Define a controlled exception path where an approved Stitch snapshot can be
used as temporary UX source of truth instead of Figma for a specific delivery
cycle.

## Default Rule

- Default source of truth remains Figma MCP.
- Stitch is ideation input only unless this exception workflow is explicitly
  completed.

## Exception Preconditions (Mandatory)

An exception record is valid only when all fields below are present:

- `exception_id`: stable identifier (example: `UX-EXC-2026-03-19-01`)
- `reason`: why Figma cannot be primary for this cycle
- `scope`: explicit screens/flows covered by exception
- `stitch_project_id`: approved Stitch project ID
- `stitch_snapshot_ref`: immutable snapshot reference (screen IDs + capture date)
- `approval_evidence`: user approval proof (thread/date + confirmation summary)
- `expiry`: explicit end condition for exception (date or milestone)

## Required Exception Record

Store the approved record in task planning artifacts:

- `.codex/context/TASK_BOARD.md` task notes
- task specification using `.codex/templates/task-template.md` fields

If any required field is missing, the exception is invalid.

## Workflow

1. Documentation Agent drafts exception record with full mandatory fields.
2. User approval is captured and linked as evidence.
3. Planning Agent attaches the approved record to each dependent UX task.
4. Planning Agent may set task to `READY` only when record is complete.
5. Execution Agent must block implementation if record is missing/expired.
6. Review Agent validates parity strictly against approved Stitch snapshot.

## Blocking Rule

Implementation tasks that rely on Stitch snapshot exception MUST stay
`BACKLOG` or `BLOCKED` until approved exception record is complete.

## Completion Rule

Exception closes when expiry condition is met or Figma source is restored for
that scope. Closing action must be reflected in:

- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`
