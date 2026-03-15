# Backend Strategy

## Core Stack

- Laravel 12 on PHP 8.4.
- PostgreSQL as primary database.
- Redis for cache, queues, and distributed locks.

## API Principles

- API-first design for web, mobile, integrations, and AI clients.
- OpenAPI spec as contract source.
- Consistent pagination, filtering, sorting, and error payloads.

## Current Contract Artifacts

- API contract index: `docs/api_contracts.md`
- Current draft for tasks/lists (NEST-005):
  `docs/openapi_tasks_lists_v1.yaml`

## Authentication and Authorization

- MVP auth: email + password.
- Post-MVP auth expansion: OAuth providers (Google, Apple, others).
- Laravel Sanctum for first-party clients.
- Policy-based authorization at resource/action level.
- Tenant-aware guards and scoping in every query path.

## Tenancy Model

- Multi-tenant data model from day one.
- Launch profile can run with one active user/tenant.
- Future phases extend to invite-based family/friends collaboration spaces.

## Modules (Bounded Contexts)

- Goals and Targets
- Lists and Tasks
- Habits and Routines
- Calendar
- Journal
- Life Areas
- Integrations
- AI Tooling

## Integration Processing

- Queue-first architecture for sync operations.
- Idempotency keys for external writes.
- Retry/backoff and dead-letter queues for failures.
- Mapping table for internal<->external IDs per provider.

## AI Layer Rules

- AI actions go through explicit tool endpoints.
- No unrestricted direct SQL or model mutation.
- Every AI write action is auditable.
- Rate limits and scope checks are mandatory.

## Observability and Operations

- Structured JSON logs.
- Metrics for request latency, queue depth, sync errors.
- Trace IDs propagated from API request to background job.
- Daily backup verification and restore drill schedule.
