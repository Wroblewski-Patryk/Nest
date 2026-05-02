# Documentation Drift Report

Last updated: 2026-05-03

## Purpose

This report records verified documentation drift and repair status. It should
be updated after every documentation architecture repair loop.

## Current Repair Loop

- Stage: implementation and verification for documentation system scaffolding.
- Scope: central index, documentation inventory, codebase map, traceability
  matrix, pipeline registry, module registry, maintenance rules.
- Runtime code changed: no.

## Drift Findings

| Finding | Evidence | Impact | Status |
| --- | --- | --- | --- |
| Missing central technical entrypoint | `docs/README.md` existed, but `docs/index.md` did not | New agents had a catalog, not a system-map path | Repaired with `docs/index.md` |
| Missing documentation inventory | `docs/analysis/` did not exist | Existing docs were hard to classify by purpose/code area | Repaired with `docs/analysis/documentation-inventory.md` |
| Missing codebase map | `docs/architecture/codebase-map.md` did not exist | Engineers had to infer modules/routes/data from scattered docs | Repaired with `docs/architecture/codebase-map.md` |
| Missing traceability matrix | No `docs/architecture/traceability-matrix.md` | Feature -> UI -> API -> service -> model -> tests path was not explicit | Repaired with initial matrix |
| Missing pipeline registry | `docs/pipelines/index.md` did not exist | Cross-module flows were hidden inside planning/module notes | Repaired with initial registry |
| Missing module registry | `docs/modules/README.md` was template-only and `docs/modules/index.md` did not exist | Module docs existed but no dependency index existed | Repaired with registry and README pointer |
| Shallow legacy module overview | `docs/architecture/modules.md` lists early core modules only | Can mislead readers about current API/platform breadth | Marked as shallow; registry is now preferred |
| High-volume planning docs | `docs/planning/` has many historical execution reports | Current truth can be hard to distinguish from history | `docs/index.md` points to current state and registries |
| V2/module docs may overstate runtime status | Many module docs describe advanced V2 capabilities | Could blur implemented vs planned | Registry marks gaps/UNVERIFIED where needed |

## Code Without Full Documentation Links

These areas exist in code and tests, but still need deeper per-flow docs:

- Route-to-controller-to-OpenAPI comparison for all `/api/v1` endpoints.
- Model-to-migration-to-module table for all Eloquent models.
- Web support cards to exact API calls and feature tests.
- Mobile screens to release-scope status and API coverage.
- Provider-specific integration adapters to sync behavior docs.

## Docs That Need Verification Against Code

- V2-heavy module files under `docs/modules/*_v2.md`.
- Older planning reports before the web-first release decision on 2026-05-02.
- `docs/architecture/modules.md` as a complete module list.
- OpenAPI specs against `apps/api/routes/api.php` and controller behavior.

## Pipeline/Module Link Gaps

- Individual pipeline files are not created yet. `docs/pipelines/index.md`
  names the required files.
- Some modules have deep-dive files but no current code-linked dependency
  table inside the individual file.
- Some test files protect broad areas but are not explicitly referenced from
  the source feature they protect.

## Endpoint Documentation Gaps

Initial endpoint groups are documented in the codebase map and traceability
matrix. Remaining work:

- Generate an endpoint inventory with method, path, controller, OpenAPI spec,
  feature test, policy/middleware, and docs link.
- Mark each endpoint as `DOC-LINKED`, `CONTRACT-ONLY`, `TEST-ONLY`, or `GAP`.

## Database Documentation Gaps

Initial model inventory is documented in the codebase map. Remaining work:

- Generate model-to-table-to-migration mapping.
- Link each model to module registry row and feature tests.
- Confirm soft-delete, tenant scoping, and uniqueness rules per model.

## Test Mapping Gaps

API feature/integration/unit tests are inventoried at a high level, but not all
tests are tied to a feature row. Remaining work:

- Add test references to every feature and pipeline document.
- Add a convention that new tests cite the feature/pipeline they protect.

## Next Repair Loop Recommendation

Select one narrow slice:

1. API endpoint inventory from `apps/api/routes/api.php`, or
2. model-to-migration registry, or
3. one high-value pipeline file such as `planning-task-capture.md`.

The best next slice is the API endpoint inventory because it will expose the
largest number of hidden route/contract/test mismatches quickly.
