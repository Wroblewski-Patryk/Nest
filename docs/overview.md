# Overview

## What Nest Is

Nest is a Life Operating System (LifeOS):

- one structured source of truth for life management
- one orchestration layer for external tools
- one API surface for UI clients, automations, and AI agents

Nest is a product name, not a framework reference.

## Product Scope

Nest covers:

- tasks and lists
- routines and habits
- goals and targets
- journal and life reflections
- life areas and balance analysis
- calendar planning and time blocking
- planning hierarchy from top to bottom:
  goals -> targets -> lists/tasks -> habits/routines -> calendar -> journal

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
- API-first with explicit contracts.
- AI-friendly data model and tool interface.
- Online-first with caching and robust synchronization.
- Security and observability by default.

## Target Expansion

- Primary audience in early phases: private users (B2C).
- Next expansion: invite-based collaboration for family and friends.
- Shared workflows: co-planning and co-management of selected plans/lists.

## Non-goals for MVP

- Full offline-first conflict-free editing across all modules.
- Marketplace ecosystem for third-party plugins.
- Enterprise org features (SSO, advanced RBAC, audit export packs).
