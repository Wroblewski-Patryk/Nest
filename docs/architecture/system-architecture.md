# System Architecture

## High-Level Flow

Web App / Mobile App -> API Gateway (Laravel) -> Domain Services ->
Integration Connectors -> PostgreSQL / Redis

The architecture keeps one canonical domain model in backend services.
All clients and automations operate through the same API contracts.

## Current Delivery Split

- `v1` delivers the practical product across backend, web, and mobile.
- `v2` extends the same backend with AI-assisted and broader platform
  capabilities.
- Canonical scope split:
  `docs/architecture/v1_v2_delivery_split.md`

## Main Layers

### Client Layer

- Web app (desktop/tablet/mobile browser).
- Mobile app (phone/tablet native).
- Shared design system and shared API schema models.

### API and Application Layer (Laravel)

- Authentication and authorization.
- Request validation and policy checks.
- Domain command handlers for core modules.
- Read models optimized for UI screens.
- AI-safe tool endpoints when the AI surface is enabled.

### Domain Layer

- Core entities and invariants.
- Business rules independent from providers.
- Event-based internal state transitions for auditability.

### Integration Layer

- Provider adapters connect external systems to Nest-owned domain entities.
- Mapping tables between internal and external identifiers.
- Idempotent sync jobs, retries, dead-letter handling.
- Conflict strategy: latest-write with guardrails + manual resolution for
  high-value fields.
- Sync policy is bidirectional where useful, while Nest remains the canonical
  source of truth for the internal life-management model.
- Provider connection flows may offer import-on-connect so existing external
  data can be pulled into Nest during setup.

### Data Layer

- PostgreSQL: transactional source of truth.
- Redis: cache, queues, rate limiting, locks, and short-lived sync state.
- Object storage (future): attachments, exports, snapshots.

## SaaS and Multi-Tenancy

- Shared database model for `v1`: one PostgreSQL cluster/database with
  tenant-scoped records separated by `tenant_id`.
- Current ownership model in `v1`: one private user account without shared
  workspace behavior.
- Planned expansion in `v2`: shareable spaces for family, company, or
  user-defined collaboration spheres, with multiple participants attached to
  the same shared scope.
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

## AI Architecture Position

- AI is not a separate source of truth or separate product backend.
- AI belongs to the same Laravel backend as a guarded capability layer.
- AI reads structured context from Nest-owned domain entities.
- AI writes must go through explicit scoped endpoints, policy checks, actor
  metadata, and audit logging.
- AI is expected to operate in two forms:
  - in-app assistive surfaces for suggestions and reports,
  - external delegated-agent access through tool/API endpoints.
