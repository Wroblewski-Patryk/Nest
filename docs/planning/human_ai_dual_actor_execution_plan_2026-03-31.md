# Human + AI Dual-Actor Execution Plan

Date: 2026-03-31

## Purpose

Resolve immediate usability blockers (auth gate and broken create actions)
while establishing a future-proof access model for Human User + AI Agent usage
through GUI and API.

## Input Signals

- User feedback from active web testing (dashboard visible without login,
  disabled/broken create actions).
- `NEST-159` click-path audit and evidence pack
  (`docs/ux/nest_159_life_management_ux_critical_audit_2026-03-31.md`).
- Product direction in `docs/product/overview.md` and `docs/modules/ai_layer.md`.

## Confirmed Decisions

- Core app routes are authentication-gated; unauthenticated sessions can access
  only pre-auth surfaces.
- Modules are considered usable only when primary create/edit workflows are
  functional and discoverable.
- Nest must support two principals in one domain model:
  - Human User principal.
  - AI Agent principal.
- Delegated agent operation on user data requires user-issued scoped API
  credentials with revocation and auditability.

## Execution Wave (NEST-160 to NEST-166)

### NEST-160 - Enforce auth gate and onboarding gate across web shell

- Scope:
  - protect dashboard and module routes against unauthenticated access,
  - redirect unauthenticated users to login/pre-auth flow,
  - ensure onboarding-incomplete users are routed to onboarding.
- Acceptance:
  - anonymous browser session cannot enter dashboard/module screens,
  - route guard behavior covered by web regression tests.

### NEST-161 - Restore primary create flows for tasks+lists and remove blocked CTAs

- Scope:
  - fix known client/API contract mismatches that block task/list CRUD,
  - ensure add task/add list actions are enabled when user is authenticated,
  - provide clear inline error feedback and retry path.
- Acceptance:
  - logged-in user can create/update/complete/delete task and list from web UI,
  - no "ready/success" placeholder UI remains for unsupported actions.

### NEST-162 - Implement module-level CRUD baseline parity for life-management core

- Scope:
  - add/repair first-create path per core module:
    habits, routines, goals, targets, calendar events.
  - align IA labels and CTA language with "organize life" intent.
- Acceptance:
  - each core module has at least one working create flow in web app,
  - click-path screenshots updated for all module create flows.

### NEST-163 - Introduce dual-actor identity model in backend domain/policy layer

- Scope:
  - define actor type model (`human_user`, `ai_agent`, `delegated_agent`),
  - extend policy evaluation and audit payloads with actor context.
- Acceptance:
  - backend policy checks and audits expose actor type on write paths,
  - regression tests validate actor-context propagation.

### NEST-164 - Add scoped API credential model for user-delegated AI access

- Scope:
  - user-generated API credentials (name, scopes, expiry, revoke),
  - least-privilege scope enforcement in API middleware/policies.
- Acceptance:
  - credential lifecycle endpoints documented and tested,
  - revoked/expired credentials cannot access protected routes.

### NEST-165 - Add AI Agent account lifecycle and capability boundaries

- Scope:
  - create/manage agent accounts in tenant context,
  - define capability boundaries for agent-own resources vs delegated resources.
- Acceptance:
  - agent principal can authenticate and operate within assigned boundaries,
  - unauthorized cross-boundary writes are denied and audited.

### NEST-166 - Expose GUI and API management surface for agent access control

- Scope:
  - web settings screen for API credential creation/revocation,
  - visibility into agent bindings, last usage, and audit events.
- Acceptance:
  - user can independently manage and revoke AI access from GUI,
  - OpenAPI docs and user-facing docs reflect final access-control flows.

## Sequence and Dependencies

1. `NEST-160` -> `NEST-161` -> `NEST-162` (immediate founder usability path).
2. `NEST-163` -> `NEST-164` -> `NEST-165` -> `NEST-166` (AI-ready access path).
3. UX audit refresh after `NEST-162` and after `NEST-166`.

## Validation and Evidence

- Backend: feature tests for auth gates, scope checks, actor policy boundaries.
- Web: route guard tests + create-flow smoke tests.
- UX evidence: updated click-path screenshots per module and settings surfaces.
- Documentation sync: update TASK_BOARD and PROJECT_STATE at every task closure.
