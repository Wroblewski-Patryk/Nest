# Post-MVP Hardening Plan (From Audit NEST-084)

Last updated: 2026-03-16
Source audit: `docs/architecture_programming_scalability_ai_audit_2026-03-16.md`

## Purpose

Translate audit findings into executable implementation tasks with acceptance
criteria, dependency mapping, and priority order.

## Priority Model

- `P0`: correctness/security/reliability blockers
- `P1`: scalability/operational hardening
- `P2`: governance/maintainability hardening

## Task Backlog

### P0

#### H-001 Sync idempotency correctness redesign

- Scope:
  - include payload version/hash semantics in idempotency strategy for
    list/task and journal sync flows,
  - prevent stale 24h lock from blocking legitimate updates.
- Depends on: none
- Acceptance criteria:
  - changed entity sync is never skipped due to stale lock,
  - duplicate prevention still blocks exact replay safely,
  - regression tests cover changed-vs-unchanged payload behavior.

### P1

#### H-002 Queue-first integration execution

- Scope:
  - convert sync endpoints to enqueue-and-return model,
  - move heavy provider execution to workers.
- Depends on: H-001
- Acceptance criteria:
  - sync API endpoints return quickly with queued job references,
  - provider execution occurs only in queue workers,
  - retry/failure behavior remains observable.

#### H-003 Chunked tenant sync processing

- Scope:
  - replace full-table sync fetches with chunked pagination/cursor strategy.
- Depends on: H-002
- Acceptance criteria:
  - no full-table reads in sync services for core entities,
  - memory profile remains bounded for large tenants,
  - integration tests validate chunk boundary correctness.

#### H-004 Runtime infra baseline alignment (PostgreSQL/Redis)

- Scope:
  - align runtime defaults and local dev templates with documented stack.
- Depends on: none
- Acceptance criteria:
  - default env examples use PostgreSQL + Redis,
  - lock/queue/cache behavior validated in this baseline,
  - docs and runtime defaults are consistent.

### P2

#### H-005 OpenAPI governance completion

- Scope:
  - extend OpenAPI coverage to auth/integration routes,
  - enforce lint/validation for all canonical specs in CI.
- Depends on: H-002
- Acceptance criteria:
  - all public API groups are represented in OpenAPI,
  - CI validates all maintained specs,
  - route-to-contract drift checks are documented and active.

#### H-006 Shared runtime API client convergence

- Scope:
  - migrate web/mobile to single shared runtime API client implementation.
- Depends on: H-005
- Acceptance criteria:
  - duplicated app-local client implementations removed,
  - behavior parity (headers/error handling/query/body) tested in both apps,
  - shared runtime client is the only source of request logic.

#### H-007 API meta contract normalization

- Scope:
  - resolve `perPage` vs `per_page` mismatch with migration-safe strategy.
- Depends on: H-005
- Acceptance criteria:
  - one canonical metadata shape is documented and implemented,
  - contract + app usage + tests are aligned,
  - compatibility path is documented (if transitional aliases are needed).

#### H-008 Soft-delete uniqueness policy fix

- Scope:
  - define and implement deterministic recreate-after-delete behavior for
    soft-deleted unique entities.
- Depends on: none
- Acceptance criteria:
  - recreate flow for archived/deleted names follows documented policy,
  - migration/index strategy supports expected behavior,
  - feature tests cover recreate and conflict edges.

#### H-009 Authorization policy-layer consolidation

- Scope:
  - progressively introduce policy-based authorization where currently only
    controller query scoping exists.
- Depends on: H-002
- Acceptance criteria:
  - policy layer exists for key route groups,
  - tests prove policy enforcement and tenant isolation,
  - docs reflect policy architecture.

#### H-010 AI-readiness API contract hardening

- Scope:
  - define machine-readable envelopes, stable error taxonomy, and idempotent
    action semantics for agent-safe operations.
- Depends on: H-005, H-007
- Acceptance criteria:
  - documented and versioned response/error envelope contract,
  - actionable error codes with deterministic retry guidance,
  - contract tests for agent/tool compatibility.

## Sequenced Execution Order

1. H-001 (P0)
2. H-002, H-004 (P1, can run in parallel after H-001 for H-002)
3. H-003 (P1)
4. H-005 (P2 governance foundation)
5. H-006 + H-007 (P2 contract/client convergence)
6. H-008 + H-009 (P2 architecture hardening)
7. H-010 (P2 AI-readiness capstone)

## Delivery Guardrails

- Each hardening task requires:
  - explicit tests for the changed behavior,
  - docs synchronization (`docs/` + context files),
  - rollout notes and rollback approach for high-risk changes.
