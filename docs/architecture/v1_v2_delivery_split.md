# V1 and V2 Delivery Split

Last updated: 2026-05-02

## Purpose

This document is the canonical architecture-level split between:

- `v1`: practical day-to-day Nest product for the founder user, delivered
  through the web app as the primary operating surface,
- `v2`: mobile application and AI-assisted expansion built on top of the same
  core architecture.

Use this file when deciding whether a capability belongs to the current
delivery scope or to later target expansion.

## Core Rule

- `v1` optimizes for practical usefulness, stability, and release readiness
  across backend and web.
- `v2` expands the same product with the mobile app, AI copilot capabilities,
  and broader platform sophistication.
- `v2` must extend `v1`; it must not replace the core domain model or create a
  separate source of truth.

## Architecture Baseline Shared By V1 And V2

- One canonical backend API and domain model.
- One PostgreSQL source of truth.
- One shared authorization and policy layer.
- One shared multi-tenant model with strict `tenant_id` isolation.
- Web consumes the API contracts for V1; mobile must consume the same API
  contracts and domain vocabulary when it is resumed in V2.
- Integrations and AI actions are adapters over the same core product data.

## V1 Delivery Scope

`v1` is the practical LifeOS product. It includes:

- backend API as the single source of truth,
- web app as the primary operating surface,
- authenticated private workspace and onboarding flow,
- tasks/lists,
- goals/targets,
- habits/routines,
- journal/life areas,
- calendar,
- localization baseline (`en`, `pl`),
- manual offline queue and manual sync baseline,
- deployment, observability, backup, and release readiness required to run the
  product reliably.

Mobile implementation, mobile authenticated session handling, mobile smoke
evidence, and mobile parity closure are not part of the V1 release gate after
the 2026-05-02 user decision. Existing mobile code can remain as V2 foundation,
but new V1 delivery work should focus on web views, API reliability, and
release evidence.

## Ownership Model

- `v1` uses a private-account model with one active human user and no shared
  workspace requirement.
- `v2` may introduce shareable spaces owned by the initiating user and shared
  with multiple other people.
- Core entities should remain compatible with a future transition from
  private-only ownership to shareable ownership.

## V1 Architectural Priorities

- Founder-first usefulness over breadth.
- Stable CRUD and practical day-to-day workflows before advanced systems.
- Web-first founder readiness for core modules.
- Clear contracts, tests, security validation, and operational reliability.
- Domain choices must remain compatible with future AI collaboration.

## Explicitly Out Of V1

The following are not required to declare `v1` successful:

- conversational AI copilot,
- AI-generated briefings,
- AI write actions and approval flows,
- integration marketplace,
- near-real-time event ingestion,
- family/friends collaboration spaces as a release requirement,
- advanced billing and dunning flows,
- growth-loop analytics as a release requirement,
- automatic background sync and offline-first merge sophistication.
- mobile application delivery and mobile parity evidence.

These capabilities may exist in documentation or implementation experiments,
but they do not define the `v1` delivery gate.

## V2 Delivery Scope

`v2` is the AI-assisted and platform-expanded version of Nest. It can include:

- conversational AI assistance across planning, execution, and reflection,
- mobile application delivery using the same backend API, domain model,
  localization baseline, and tenant boundaries,
- explainable recommendations with source references,
- approval-gated AI write actions,
- proactive AI briefings,
- stronger automation and integration workflows,
- broader collaboration and notification systems,
- shareable family/company/custom spaces where the user defines what sphere is
  being shared and with whom,
- deeper operational hardening for wider commercial rollout.

## AI Architecture Decision

AI belongs to the Nest backend as a controlled capability layer, not as a
separate product backend.

This means:

- AI uses the same core API, policy, and audit model as the rest of Nest.
- AI endpoints live behind explicit route groups and feature gates.
- AI reads structured product context from Nest-owned domain entities.
- AI writes go only through explicit tool/action endpoints with policy checks,
  actor metadata, and audit logs.
- AI must never become an alternate source of truth for plans, tasks, or other
  core entities.

## AI Operation Modes

- In-app AI mode:
  - provides suggestions, reports, and module-level assistance based on data
    already stored in Nest,
  - typical surfaces include daily or weekly summaries, planning suggestions,
    and module-specific recommendations.
- External agent mode:
  - allows delegated external AI agents to interact with Nest through API/tool
    endpoints,
  - uses the same policy, scope, audit, and actor-boundary rules as in-app AI
    actions.

Both modes must share one backend policy and audit model.

## Integration Source-Of-Truth Decision

- Nest remains the canonical source of truth for the internal
  life-management model.
- Integrations may synchronize data bidirectionally when that improves the
  user's practical workflow.
- Connecting a provider may offer an explicit import choice so Nest can ingest
  existing provider data and build a more complete picture.
- External user edits in connected tools should normally be treated as valid
  intent and synchronized back into Nest, subject to conflict policy.
- Provider-specific policies may differ for content-heavy systems such as files
  or notes, where Nest may store structured references, metadata, or summaries
  rather than full canonical content.

## Delivery Matrix

| Area | V1 | V2 |
| --- | --- | --- |
| Backend API | required | extended |
| Web app | required | extended |
| Mobile app | deferred | required |
| Core modules | required | refined |
| Integrations baseline | optional but useful where it supports daily operation | expanded |
| AI surface | foundation only, no release dependency | required |
| Collaboration | deferred | optional expansion |
| Billing/commercial systems | deferred | optional expansion |
| Advanced offline-first | deferred | optional expansion |

## Planning Rule

When planning work:

1. decide whether the task is required for `v1` web usability, backend/API
   reliability, or release readiness,
2. if not, default to `v2` unless there is an explicit approved reason to pull
   it earlier,
3. do not let `v2` systems delay closure of `v1` core product quality.

## Related Documents

- `docs/product/overview.md`
- `docs/product/mvp_scope.md`
- `docs/product/roadmap.md`
- `docs/architecture/system-architecture.md`
- `docs/modules/ai_layer.md`
- `docs/planning/v1_execution_focus_2026-04-26.md`
