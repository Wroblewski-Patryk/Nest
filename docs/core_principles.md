# Core Principles

## 1. Nest is the Source of Truth

Nest owns the life data model.

External integrations synchronize with Nest but do not define the structure.

---

## 2. API First

Every operation must be accessible through API.

This allows:

- AI agents
- n8n workflows
- external automation

to interact with Nest.

---

## 3. AI-Friendly Data

The data model should be designed so AI can easily understand:

- tasks
- priorities
- life areas
- habits
- calendar availability

---

## 4. Modular Architecture

Modules should be independent and extendable.

Future extensions should not require rewriting core systems.

---

## 5. SaaS Ready

Although the MVP is single-user, the system must support:

- multiple users
- data isolation
- per-user integrations

---

## 6. Online First

The application operates online-first with caching.

Offline functionality will be added later with synchronization support.

---

## 7. One Domain, Two Clients

Nest ships as web and mobile clients with the same core functionality.

Differences are allowed only for form-factor UX, not for business rules.
