# API Contracts

Last updated: 2026-03-31

## Purpose

This document tracks current API contract artifacts used as a source of truth
for backend and client integration.

## Active Drafts

- Tasks and Lists v1 (NEST-005):
  `docs/engineering/contracts/openapi_tasks_lists_v1.yaml`
- Core Modules v1 (NEST-007):
  `docs/engineering/contracts/openapi_core_modules_v1.yaml`
- Automation Rules v1 draft (NEST-056):
  `docs/engineering/contracts/openapi_automation_rules_v1.yaml`
- Billing Events v1 draft (NEST-065):
  `docs/engineering/contracts/openapi_billing_events_v1.yaml`
- Auth + Integrations + Platform v1 draft (NEST-091):
  `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`

## Notes

- Contract format: OpenAPI 3.1.
- Pagination meta policy:
  - canonical response shape is snake_case: `meta.page`, `meta.per_page`,
    `meta.total`
  - optional `meta.perPage` alias is transitional client-side compatibility only
    and is not part of canonical server response
- Draft coverage:
  - `openapi_tasks_lists_v1.yaml`: tasks and lists
  - `openapi_core_modules_v1.yaml`: habits, routines, goals, targets, journal,
    life areas, and calendar events
  - `openapi_automation_rules_v1.yaml`: automation rules and run records
  - `openapi_billing_events_v1.yaml`: billing subscription snapshot and billing
    event stream
  - `openapi_auth_integrations_platform_v1.yaml`: auth, analytics, AI, insights,
    organizations, collaboration, integrations, notifications, and billing
    webhook route groups
- Delegated AI credential lifecycle (`NEST-164`) is documented in:
  `docs/modules/delegated_ai_api_credentials_v1.md` and represented in
  `openapi_auth_integrations_platform_v1.yaml` auth path group.

