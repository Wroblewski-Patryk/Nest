# System Architecture

## High-Level Flow

Web App / Mobile App -> API Gateway (Laravel) -> Domain Services ->
Integration Connectors -> PostgreSQL / Redis

The architecture keeps one canonical domain model in backend services.
All clients and automations operate through the same API contracts.

## Main Layers

### Client Layer

- Web app (desktop/tablet/mobile browser).
- Mobile app (phone/tablet native).
- Shared design system and shared API schema models.

### API and Application Layer (Laravel)

- Authentication and authorization.
- Request validation and policy checks.
- Domain command handlers (task, habit, goal, calendar, journal).
- Read models optimized for UI screens.
- AI-safe tool endpoints (scoped actions only).

### Domain Layer

- Core entities and invariants.
- Business rules independent from providers.
- Event-based internal state transitions for auditability.

### Integration Layer

- Provider adapters: ClickUp, Google Calendar, Microsoft To Do, Obsidian.
- Mapping tables between internal and external identifiers.
- Idempotent sync jobs, retries, dead-letter handling.
- Conflict strategy: latest-write with guardrails + manual resolution for
  high-value fields.

### Data Layer

- PostgreSQL: transactional source of truth.
- Redis: cache, queues, rate limiting, locks, and short-lived sync state.
- Object storage (future): attachments, exports, snapshots.

## SaaS and Multi-Tenancy

- Shared database model for v1: one PostgreSQL cluster/database with
  tenant-scoped records separated by `tenant_id`.
- Tenant isolation at data access layer.
- Per-user/provider credentials and scopes.
- Audit events for security-sensitive actions.

## Reliability Baseline

- Queue-based integration processing.
- Retry with exponential backoff and idempotency keys.
- Health checks for providers and background workers.
- Structured logs and metrics for sync performance and failures.

## Runtime Defaults

- Application default DB connection: PostgreSQL (`DB_CONNECTION=pgsql`).
- Application default queue connection: Redis (`QUEUE_CONNECTION=redis`).
- Application default cache/session backing: Redis.

## Authorization Baseline

- Tenant and user isolation is enforced by both query scoping and explicit
  policy-layer checks for sensitive record actions.
- Current policy-layer coverage includes:
  - `LifeAreaPolicy` for life area read/update/delete operations
  - `IntegrationSyncConflictPolicy` for conflict queue resolution actions
  - `IntegrationSyncFailurePolicy` for failed sync replay actions
