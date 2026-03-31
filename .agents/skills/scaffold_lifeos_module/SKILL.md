---
name: scaffold_lifeos_module
description: Scaffold a new Nest domain module in Laravel (entity, migration, service, controller, request validation, policy, routes, and docs links). Use when adding a new LifeOS bounded feature such as habits, routines, reflections, or goals.
---

# Procedure

## Step 1
Define module scope and acceptance criteria from `docs/product/*` and `docs/planning/*`. Confirm target aggregate and tenant boundaries.

## Step 2
Create backend slice: migration, Eloquent model, FormRequest, service/action class, controller endpoints, and API route registration.

## Step 3
Add authorization policy and enforce tenant/user scoping in all queries and writes. Reject cross-tenant access by default.

## Step 4
Add tests for happy path, validation errors, and unauthorized access. Cover at least one tenant-isolation regression case.

## Step 5
Update project state artifacts: `.codex/context/TASK_BOARD.md` and `.codex/context/PROJECT_STATE.md`, plus relevant docs index links.

## Validation
- run module tests (`php artisan test` scoped to touched tests)
- verify policy blocks cross-tenant reads/writes
- verify route names and response contracts are consistent

## Output
- migration/model/request/service/controller/policy/routes files
- updated tests and context docs
- summary of endpoints added and guardrails enforced
