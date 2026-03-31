---
name: enforce_tenant_guardrails
description: Harden an existing feature for tenant-safe data access and policy enforcement. Use when touching queries, policies, or API handlers that could leak cross-tenant records.
---

# Procedure

## Step 1
Audit all entry points (controller, service, query objects, jobs) that read or mutate target records.

## Step 2
Add explicit tenant/user scope in every query and relationship traversal. Remove implicit trust on client-provided IDs.

## Step 3
Enforce policy checks for sensitive actions (read/update/delete/replay/conflict resolution).

## Step 4
Add negative tests proving unauthorized tenant access fails.

## Step 5
Document the guardrail in `.codex/context/PROJECT_STATE.md` and affected policy docs.

## Validation
- run feature tests including cross-tenant attack attempts
- verify 403/404 behavior is intentional and consistent
- verify background jobs also honor tenant context

## Output
- guarded query/policy changes
- regression tests for isolation boundaries
- short note describing remaining risk and assumptions
