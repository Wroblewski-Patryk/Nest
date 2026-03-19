# Implementation Plan (Full Product)

Last updated: 2026-03-19

## Purpose

This document extends the MVP implementation plan into a full product delivery
plan aligned with `docs/roadmap.md` phases 1-4.

## Planning Baseline

- Phase 1 (MVP): `NEST-001` to `NEST-030` (defined in
  `docs/implementation_plan_mvp.md`).
- Phase 2 (Integration Expansion): `NEST-031` to `NEST-045`.
- Phase 3 (Intelligence and Insights): `NEST-046` to `NEST-060`.
- Phase 4 (SaaS Hardening): `NEST-061` to `NEST-081`.

## Phase 2 - Integration Expansion (`NEST-031` to `NEST-045`)

Note: End-user AI surface remains disabled in Phase 2 and starts in Phase 3.

### Integration platform maturity

- [ ] NEST-031 Define post-MVP integration contract versioning strategy
  - Depends on: NEST-029
  - Done when: provider contract/version policy and migration rules are
    documented and linked from integration docs.

- [ ] NEST-032 Deliver Trello synchronization
  - Depends on: NEST-031
  - Done when: list/task synchronization with Trello works with idempotency,
    mapping integrity, and audit trail.

- [ ] NEST-033 Deliver Google Tasks synchronization
  - Depends on: NEST-031
  - Done when: list/task synchronization with Google Tasks works with retry/
    backoff and consistent field mappings.

- [ ] NEST-034 Deliver third list/task provider (demand-driven)
  - Depends on: NEST-031
  - Done when: one additional provider is selected by product demand and
    delivered with the same sync quality bar.

- [ ] NEST-035 Deliver Google Calendar synchronization
  - Depends on: NEST-032, NEST-033
  - Done when: calendar sync is delivered after list/task baseline and follows
    conflict/audit requirements.

- [ ] NEST-036 Deliver Obsidian synchronization as final provider in wave 1
  - Depends on: NEST-032, NEST-033, NEST-035
  - Done when: markdown note sync is delivered as the last provider in initial
    integration sequence.

### Conflict resolution and reliability

- [ ] NEST-037 Implement conflict queue API + UI workflows
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036
  - Done when: users can review, accept, or override high-value field conflicts.

- [ ] NEST-038 Add deterministic conflict policy matrix by field/provider
  - Depends on: NEST-037
  - Done when: documented policy is enforced in code and covered by tests.

- [ ] NEST-039 Add sync replay tooling for failed jobs
  - Depends on: NEST-037
  - Done when: failed sync jobs can be replayed safely with idempotency guards.

- [ ] NEST-040 Introduce sync SLOs and alert thresholds
  - Depends on: NEST-037
  - Done when: SLO targets exist for success latency/error budget and alerting
    is configured.

### Product parity and rollout safety

- [ ] NEST-041 Expose provider connection management in web and mobile
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036
  - Done when: users can connect/reconnect/revoke providers from both clients.

- [ ] NEST-042 Add provider permission scope review screens
  - Depends on: NEST-041
  - Done when: granted scopes are visible and least-privilege warnings are shown.

- [ ] NEST-043 Add integration regression suite
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036, NEST-037
  - Done when: end-to-end sync scenarios for each provider run in CI.

- [ ] NEST-044 Deliver notifications first step (mobile push baseline)
  - Depends on: NEST-035
  - Done when: simple push notifications are available for key reminders, with
    explicit scope and delivery monitoring.

- [ ] NEST-045 Phase 2 release sign-off
  - Depends on: NEST-040, NEST-043, NEST-044
  - Done when: operational and product sign-off for integration expansion is
    recorded.

## Phase 3 - Intelligence and Insights (`NEST-046` to `NEST-060`)

### Analytics foundation

- [ ] NEST-046 Define analytics event taxonomy across modules
  - Depends on: NEST-029
  - Done when: canonical event dictionary is documented and adopted in clients.

- [ ] NEST-047 Build analytics ingestion pipeline
  - Depends on: NEST-046
  - Done when: validated event ingestion, storage, and retention policy are in
    place.

- [ ] NEST-048 Create life-area balance score model (v1)
  - Depends on: NEST-047
  - Done when: scoring formula is documented, computed, and visible via API.

- [ ] NEST-049 Implement trends and insights API
  - Depends on: NEST-047, NEST-048
  - Done when: weekly/monthly trend endpoints exist for tasks/habits/goals.

- [ ] NEST-050 Deliver insights UI (web and mobile)
  - Depends on: NEST-049
  - Done when: users can view trends and life-area balance reports in both
    clients.

### Planning assistant evolution

- [ ] NEST-051 Expand AI tools for weekly planning
  - Depends on: NEST-019, NEST-049
  - Done when: AI can propose weekly plans with explicit constraints and
    explainable rationale.

- [ ] NEST-052 Add explainability payloads for AI recommendations
  - Depends on: NEST-051
  - Done when: AI responses include reason codes and source entities.

- [ ] NEST-053 Add confidence scoring and guardrails for AI suggestions
  - Depends on: NEST-052
  - Done when: low-confidence suggestions are gated and flagged for review.

- [ ] NEST-054 Introduce user feedback loop for AI outputs
  - Depends on: NEST-051
  - Done when: users can rate accept/reject/edit suggestions and feedback is
    stored for quality tracking.

- [ ] NEST-055 Add assistant policy testing suite
  - Depends on: NEST-053, NEST-054
  - Done when: policy, safety, and prompt regression tests run in CI.

### Cross-module automation

- [ ] NEST-056 Define automation rule model (trigger/condition/action)
  - Depends on: NEST-049
  - Done when: automation domain model and API contracts are documented.

- [ ] NEST-057 Implement automation engine (v1)
  - Depends on: NEST-056
  - Done when: rules can execute against allowed module actions with audit logs.

- [ ] NEST-058 Deliver automation builder UI (web)
  - Depends on: NEST-057
  - Done when: users can create/activate/pause basic automations from web app.

- [ ] NEST-059 Deliver automation execution history and debugging view
  - Depends on: NEST-057
  - Done when: users can inspect runs, errors, and retries.

- [ ] NEST-060 Phase 3 release sign-off
  - Depends on: NEST-050, NEST-055, NEST-058, NEST-059
  - Done when: intelligence and automation scope passes release criteria.

## Phase 4 - SaaS Hardening (`NEST-061` to `NEST-081`)

### Multi-tenant operations hardening

- [x] NEST-061 Implement strict tenant isolation verification suite
  - Depends on: NEST-029
  - Done when: test matrix covers API, queue, and integration isolation paths.

- [x] NEST-062 Add tenant-scoped data retention and deletion workflows
  - Depends on: NEST-061
  - Done when: retention policies and deletion jobs are implemented and audited.

- [x] NEST-063 Implement tenant-level usage limits and quotas
  - Depends on: NEST-061
  - Done when: per-tenant limits are enforced with clear user-facing errors.

- [x] NEST-064 Implement invite-based family/friends collaboration spaces
  - Depends on: NEST-061
  - Done when: shared plans/lists, co-management flows, and private-vs-shared
    permission boundaries are implemented and tested.

### Billing and subscriptions

- [x] NEST-065 Define plans, entitlements, and billing events model
  - Depends on: NEST-029
  - Done when: pricing/entitlement schema and lifecycle states are documented.

- [x] NEST-066 Implement subscription lifecycle backend
  - Depends on: NEST-065
  - Done when: trial/active/past-due/canceled lifecycle is fully supported.

- [x] NEST-067 Implement billing provider integration and webhook handling
  - Depends on: NEST-066
  - Done when: invoicing/payment events are synchronized reliably and audited.

- [x] NEST-068 Deliver billing and plan management UI
  - Depends on: NEST-066, NEST-067
  - Done when: users can manage plan, billing details, and invoices.

- [x] NEST-069 Implement entitlement enforcement across API/tools
  - Depends on: NEST-066
  - Done when: gated features respect plan limits in all clients and APIs.

### Organization and advanced security controls

- [x] NEST-070 Add organization/workspace domain model
  - Depends on: NEST-061
  - Done when: org/workspace membership model is implemented with migrations.

- [x] NEST-071 Implement org roles and permission matrix (RBAC)
  - Depends on: NEST-070
  - Done when: role assignments and policy checks are enforced by API.

- [x] NEST-072 Implement OAuth providers for B2C auth expansion
  - Depends on: NEST-071
  - Done when: Google/Apple (or approved set) login works with tenant-safe
    account linking and security controls.

- [x] NEST-073 Implement SSO (OIDC/SAML) for organization plans
  - Depends on: NEST-071
  - Done when: supported enterprise auth flows are production-ready.

- [x] NEST-074 Add audit export package for organization compliance
  - Depends on: NEST-071
  - Done when: export includes security-sensitive events in documented formats.

- [x] NEST-075 Add advanced secrets and key rotation operations
  - Depends on: NEST-061
  - Done when: automated key rotation and credential revoke paths are tested.

- [x] NEST-076 Introduce security control verification suite
  - Depends on: NEST-071, NEST-072, NEST-073, NEST-075
  - Done when: recurring security control checks run in CI and staging.

### Scale, reliability, and launch readiness

- [x] NEST-077 Implement performance and load test harness
  - Depends on: NEST-063, NEST-069
  - Done when: representative load scenarios and thresholds are defined.

- [x] NEST-078 Execute resilience tests (backup/restore/failover drills)
  - Depends on: NEST-062, NEST-077
  - Done when: drill outcomes and corrective actions are documented.

- [x] NEST-079 Introduce release train and change management workflow
  - Depends on: NEST-077
  - Done when: regular release cadence and quality gates are institutionalized.

- [ ] NEST-080 Final readiness review for full-product launch
  - Depends on: NEST-068, NEST-074, NEST-076, NEST-078, NEST-079
  - Done when: launch checklist is approved by product, engineering, and
    operations.

- [ ] NEST-081 Full-product launch milestone
  - Depends on: NEST-080
  - Done when: full product scope is released and monitored in production.

## Global Rules

- Every implementation task must satisfy quality gates from
  `docs/implementation_plan_mvp.md`.
- No task may be marked done without Definition of Done from `AGENTS.md`.
- Any meaningful change must update at least one of:
  `docs/`, `.codex/context/TASK_BOARD.md`, `.codex/context/PROJECT_STATE.md`.
