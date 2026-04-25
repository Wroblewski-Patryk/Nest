# Overview

## What Nest Is

Nest is a Life Operating System (LifeOS):

- one structured source of truth for life management,
- one orchestration layer for external tools,
- one API surface for UI clients and future AI-assisted capabilities.

Nest is a product name, not a framework reference.

## Product Scope

Nest covers:

- tasks and lists,
- routines and habits,
- goals and targets,
- journal and life reflections,
- life areas and balance analysis,
- calendar planning and time blocking,
- planning hierarchy from top to bottom:
  goals -> targets -> lists/tasks -> habits/routines -> calendar -> journal,
- product interaction model:
  tasks/lists, calendar planning, and habits/routines are equal-priority
  modules designed to work as one connected daily loop,
- planning, execution, reflection, and insight analysis are treated as one
  integrated cycle rather than separate product modes.

## Platform Strategy

Nest ships in two editions with the same functional scope and similar UI:

- **Web app**: desktop, tablet, mobile browser.
- **Mobile app**: tablet and phone native application.

The web app is the primary operations console; the mobile app optimizes for
capture, review, and daily execution.

## Architectural Direction

- SaaS-ready, multi-tenant from day one.
- Initial operation model: single active user (founder) on top of
  multi-tenant architecture.
- Authentication-first navigation policy: dashboard and all core module routes
  are private and require authenticated session; unauthenticated users can
  access only pre-auth surfaces.
- API-first with explicit contracts.
- AI-friendly data model and tool interface as future expansion, not as a `v1`
  release dependency.
- Dual-actor foundation policy: Nest domain model and permission layer must
  support both Human User and AI Agent principals without duplicating module
  logic.
- Delegated-access policy: user can issue scoped API credentials for approved
  AI automation flows acting on user-owned data, with explicit revocation and
  audit traceability.
- Online-first with caching and robust synchronization, including offline
  change capture with manual sync trigger from settings/options and oldest-
  first queue processing.
- Security and observability by default.

## Delivery Split

- `v1` is the practical Nest product:
  backend + web + mobile for daily life management.
- `v2` is the AI-assisted and broader platform expansion built on the same
  backend and domain model.
- Canonical architecture split:
  `docs/architecture/v1_v2_delivery_split.md`

## Target Expansion

- Primary audience in early phases: private users (B2C).
- Next expansion: shareable spaces where the user defines whether the shared
  sphere is family, company, or another custom context.
- Shared workflows: co-planning and co-management of selected plans/lists with
  multiple invited participants.
- Product positioning excludes enterprise/corporate workflow focus in favor of
  personal life management in individual and family/friends contexts.

## Current Strategic Priority

- Near-term priority is personal usefulness for the founder user over generic
  growth/monetization optimization.
- Strategic horizon prioritizes long-term life management and preparation for a
  future conversational AI agent that can co-manage workflows with the user.
- `v1` implementation priority remains founder-focused usability first, with
  scalable design choices that allow later AI expansion without major rewrites.
- `v1` release decisions prioritize stability, tests, security, and
  compatibility with existing modules when adding new functionality.
- `v1` usability gate: no module can be treated as ready unless primary create
  and edit actions are available and usable.
- Core day-to-day product value combines three equal outcomes: lower stress and
  chaos, better execution consistency, and strong planning control.
- UX direction follows a balanced approach: simple by default, with enough
  configuration depth for advanced needs without clutter.
- Current commercial rollout is free-first, with planned progression to
  `free/basic/advanced` tiers and later definition of limits/entitlements.

## Non-goals for V1

- Full offline-first conflict-free editing across all modules.
- Marketplace ecosystem for third-party plugins.
- Conversational AI copilot and AI write actions.
- Billing maturity, dunning, and commercial growth loops as release criteria.
- Collaboration-heavy shared spaces as a release criterion.
- Enterprise org features (SSO, advanced RBAC, audit export packs).
