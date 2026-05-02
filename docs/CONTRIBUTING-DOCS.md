# Contributing To Nest Documentation

Last updated: 2026-05-03

## Principle

Nest documentation is a system map. Do not add isolated notes when the change
affects architecture, modules, routes, data, pipelines, deployment, tests, UX,
security, or AI behavior.

## Required Updates By Change Type

| Change | Required documentation update |
| --- | --- |
| New feature | Add/update `docs/architecture/traceability-matrix.md` and related module/pipeline docs |
| New route or endpoint | Update API contract docs, endpoint docs, traceability, and related tests |
| New system flow | Update `docs/pipelines/index.md` or create/update the pipeline file |
| New module | Update `docs/modules/index.md`, create module deep-dive doc, link routes/models/tests |
| Database/model/migration change | Update codebase map or model registry, module docs, traceability, and tests |
| Service/job/queue change | Update codebase map, affected pipeline, operations docs if runtime behavior changes |
| Frontend route/component behavior change | Update traceability, UX docs if user-visible, and pipeline/module docs |
| AI/agent behavior change | Update AI module docs, traceability, AI testing evidence, actor/security notes |
| Deployment/runtime change | Update operations docs, release runbook, deployment gate, codebase map |
| Test change | Reference the feature, module, or pipeline the test protects |

## Documentation Status Labels

Use these labels when certainty matters:

- `VERIFIED`: confirmed from code, tests, or current source-of-truth docs.
- `UNVERIFIED`: plausible or documented elsewhere, but not confirmed in this
  pass.
- `GAP`: expected link or evidence is missing.
- `V2`: intentionally out of current web-first V1 release promise.
- `HISTORICAL`: useful record, but not current truth unless re-confirmed.

## Traceability Rules

Every core feature should have a path:

Feature -> frontend entry -> backend route/API -> service/module -> database
model -> pipeline -> tests -> related docs.

If any part is missing, mark it as `GAP` instead of inventing the missing link.

## Pipeline Rules

Every pipeline doc must include:

- trigger
- user/system action
- involved frontend files
- involved backend files
- involved services
- data read/write
- failure points
- tests
- related docs

## Module Rules

Every module doc must include:

- responsibility
- public interface
- dependencies
- used by which pipelines
- related routes/endpoints
- related database models
- related tests
- known gaps

## Maintenance Workflow

1. Inspect existing docs and code before editing.
2. Reuse the closest existing doc and registry.
3. Update traceability and pipeline/module links in the same task.
4. Run relevant validations:
   - docs-only: link/path spot checks and `git diff --check`
   - OpenAPI change: Redocly lint
   - runtime change: relevant API/web/mobile checks from `AGENTS.md`
5. Update `.codex/context/TASK_BOARD.md` and
   `.codex/context/PROJECT_STATE.md` when repository truth changes.

## Forbidden

- Do not rewrite broad documentation blindly.
- Do not present planned V2 behavior as shipped V1 behavior.
- Do not describe architecture that is not approved in `docs/architecture/`.
- Do not leave new code behavior disconnected from modules, pipelines, tests,
  or traceability.
- Do not close a task with undocumented `GAP`s hidden from the next agent.
