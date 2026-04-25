# Documentation Governance Workflow

## Objective

Keep Nest documentation usable as a reliable source of truth for both humans
and coding agents.

## Canonical Folder Roles

- `docs/architecture/`
  - canonical description of how Nest works
  - runtime flow, tenancy boundaries, actor ownership, invariants, and safety
    contracts
- `docs/modules/`
  - implementation-facing deep-dives
  - code ownership, entrypoints, dependencies, routes, and test surfaces
- `docs/planning/`
  - active queue, sequencing, execution waves, unresolved decisions
- `docs/operations/`
  - deployment, smoke checks, rollback, evidence, and runbooks
- `docs/product/`
  - product intent, scope, limits, and user-facing policy
- `docs/ux/`
  - design-system and UX constraints, plus parity evidence expectations

## Architecture Read Order

When work touches runtime behavior, read in this order:

1. `docs/architecture/README.md`
2. `docs/architecture/architecture-source-of-truth.md`
3. the most relevant architecture files for the task
4. related module deep-dives in `docs/modules/`

## Decision Promotion Rule

- If a behavior or invariant is accepted as the intended system rule, it must
  live in `docs/architecture/`.
- Do not leave accepted architecture only in planning notes, closure notes, or
  module deep-dives.

## Open Decisions Rule

- `docs/planning/open-decisions.md` is for unresolved decisions only.
- Once resolved:
  1. close it there
  2. write the resulting truth into `docs/architecture/`

## Deep-Dive Rule

- `docs/modules/*.md` may explain implementation details.
- They must not become the primary source of runtime truth.
- When module docs rely on architecture rules, link back to architecture files.

## When To Update Which Docs

### Update `docs/architecture/` when:

- runtime behavior changed
- tenancy, actor, or source-of-truth ownership changed
- lifecycle, parity, localization, or safety invariants changed

### Update `docs/modules/` when:

- module boundaries or dependencies changed
- route or feature ownership changed
- important implementation or test entrypoints changed

### Update `docs/planning/` when:

- queue or active wave changed
- a real unresolved decision appears

### Update `docs/operations/` when:

- deployment, smoke, rollback, or runbook behavior changed

## Anti-Drift Guardrails

- Prefer one canonical statement over repeated similar wording.
- Keep plan names, tier names, and runtime terms aligned with architecture.
- Avoid absolute local-machine paths in repository docs.
- Treat docs parity as part of done-state for structure-sensitive work.

## Completion Checklist

Before closing docs-sensitive work:

1. confirm architecture truth is in `docs/architecture/`
2. confirm deep-dives link to architecture instead of redefining it
3. confirm planning files do not retain resolved truth as the main source
4. confirm indexes point to the current canonical reading path
