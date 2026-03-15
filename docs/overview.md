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

## Platform Strategy

Nest ships in two editions with the same functional scope and similar UI:

- **Web app**: desktop, tablet, mobile browser.
- **Mobile app**: tablet and phone native application.

The web app is the primary operations console; the mobile app optimizes for
capture, review, and daily execution.

## Architectural Direction

- SaaS-ready, multi-tenant from day one.
- API-first with explicit contracts.
- AI-friendly data model and tool interface.
- Online-first with caching and robust synchronization.
- Security and observability by default.

## Non-goals for MVP

- Full offline-first conflict-free editing across all modules.
- Marketplace ecosystem for third-party plugins.
- Enterprise org features (SSO, advanced RBAC, audit export packs).
