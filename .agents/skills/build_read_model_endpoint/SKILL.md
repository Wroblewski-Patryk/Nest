---
name: build_read_model_endpoint
description: Build a UI-optimized read model endpoint for Nest web/mobile clients with pagination, filters, and stable API contracts. Use when a screen needs fast, predictable query responses.
---

# Procedure

## Step 1
Define screen data contract first (fields, filters, sort, pagination metadata).

## Step 2
Implement dedicated query/read-model path separate from write-side command handlers.

## Step 3
Add request validation for filters and sorting. Enforce safe defaults and max page sizes.

## Step 4
Return stable DTO/resource shape and update OpenAPI or API contract docs.

## Step 5
Add tests for filtering, pagination boundaries, and empty states.

## Validation
- verify response shape stays stable across edge cases
- verify pagination metadata and sorting are deterministic
- verify query stays tenant/user scoped

## Output
- read-model query/service/resource files
- endpoint tests and contract updates
- response example for frontend integration
