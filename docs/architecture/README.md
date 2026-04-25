# Architecture Documentation for Nest

This folder is the canonical source of truth for how Nest works.

Use these files when the question is:
- how the system is structured,
- which boundary owns state or behavior,
- which invariants are fail-closed,
- how API, web, and mobile parity should work.

Do not use this folder for:
- execution wave sequencing,
- closure notes,
- temporary implementation logs.

Those belong in:
- `docs/planning/`
- `docs/modules/`
- `docs/operations/`

## Reading Order
1. `architecture-source-of-truth.md`
2. `system-architecture.md`
3. `tech-stack.md`
4. `core_principles.md`
5. task-relevant architecture deep-dives

## Architecture Rules
- One file should have one clear responsibility.
- Resolved architecture decisions belong here, not in planning notes.
- Module docs may explain implementation details, but do not override this
  folder.
