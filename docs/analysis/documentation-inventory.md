# Documentation Inventory

Last updated: 2026-05-03

## Purpose

This inventory records the current documentation tree and how it relates to the
codebase. It is intentionally evidence-oriented: when a document cannot be
verified against code in this pass, it is marked as `UNVERIFIED`.

## Discovery Summary

Discovery scanned repository Markdown/YAML documentation under `docs/`,
`.codex/`, `.agents/`, `.claude/`, and `.github/`.

Key existing catalogs:

- `docs/README.md` - broad documentation index.
- `.codex/context/PROJECT_STATE.md` - current execution and architecture
  state.
- `.codex/context/TASK_BOARD.md` - canonical task queue.
- `AGENTS.md` - repository agent and governance rules.

## Documentation Tree

| Area | Existing docs | Purpose | Related code areas | Status |
| --- | --- | --- | --- | --- |
| Product | `docs/product/*.md` | Product framing, scope, roadmap, localization, limits, glossary | all apps | Active, mostly human-facing |
| Architecture | `docs/architecture/*.md` | Source-of-truth architecture, tech stack, frontend/backend/database strategies | `apps/api`, `apps/web`, `apps/mobile`, `packages/shared-types` | Active; needed codebase map added |
| Engineering | `docs/engineering/*.md`, `docs/engineering/contracts/*.yaml` | API contracts, monorepo, local development, testing, database schema | API routes/controllers, clients, CI | Active; OpenAPI specs are contract anchors |
| Modules | `docs/modules/*.md` | Deep dives for AI, integrations, automation, billing, notifications, tenancy, localization, V2 features | API domain folders, web/mobile surfaces | Active but uneven; registry added |
| Pipelines | `docs/pipelines/` | Cross-module system flows | UI -> API -> service -> model -> tests | New registry added |
| Operations | `docs/operations/*.md` | Deployment, runbooks, release gates, observability, smoke paths | Docker/Coolify, CI, queues, scheduler | Active |
| Security | `docs/security/*.md` | Tenant isolation, RBAC, OAuth/SSO, controls, secure development lifecycle | policies, middleware, security services, tests | Active |
| UX | `docs/ux/*.md`, evidence folders | Visual direction, parity evidence, canonical UI workflow | `apps/web/src/app`, shared components | Active and very detailed |
| Planning | `docs/planning/*.md` | Execution plans, audits, task reports, readiness matrices | all touched surfaces | Active but high-volume; needs registry links |
| Governance | `docs/governance/*.md`, `.agents/workflows/*.md` | Task process, quality gates, subagent rules, docs governance | agent workflow, repo maintenance | Active |
| Agent prompts | `.agents/prompts/*.md`, `.claude/agents/*.md`, `.codex/agents/*.md` | Role-specific agent behavior | collaboration workflow | Active |
| CI/release | `.github/workflows/*.yml`, `.github/pull_request_template.md` | Validation and release automation | API/web/mobile/contracts | Active |
| Root hardening | `DEFINITION_OF_DONE.md`, `INTEGRATION_CHECKLIST.md`, `DEPLOYMENT_GATE.md`, `AI_TESTING_PROTOCOL.md`, `NO_TEMPORARY_SOLUTIONS.md` | Production hardening gates | all runtime changes | Active |

## High-Value Existing Docs

- Architecture: `docs/architecture/system-architecture.md`,
  `docs/architecture/tech-stack.md`,
  `docs/architecture/backend_strategy.md`,
  `docs/architecture/frontend_strategy.md`,
  `docs/architecture/database_decision.md`,
  `docs/architecture/domain_model.md`.
- Contracts: `docs/engineering/contracts/openapi_core_modules_v1.yaml`,
  `docs/engineering/contracts/openapi_tasks_lists_v1.yaml`,
  `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
  `docs/engineering/contracts/openapi_automation_rules_v1.yaml`,
  `docs/engineering/contracts/openapi_billing_events_v1.yaml`.
- Current release truth: `docs/planning/v1_readiness_matrix_2026-05-01.md`,
  `docs/planning/nest_318_v1_readiness_matrix_refresh_2026-05-03.md`,
  `docs/planning/nest_320_web_localization_release_signoff_review_2026-05-03.md`.
- UX source of truth: `docs/ux/nest_canonical_view_architecture_2026-05-02.md`,
  `docs/ux/visual-direction-brief.md`,
  `docs/ux/screen-quality-checklist.md`,
  `docs/ux/design-memory.md`.
- Runtime/release: `docs/operations/nest_web_first_release_runbook_2026-05-02.md`,
  `docs/operations/production_topology_environment_contract_v1.md`,
  `docs/operations/service-reliability-and-observability.md`.

## Suspected Outdated Or Incomplete Files

| File | Reason | Action |
| --- | --- | --- |
| `docs/architecture/modules.md` | Describes only early core modules and does not include current API/platform/AI surface breadth | Keep as historical/simple overview; use `docs/modules/index.md` for technical registry |
| `docs/modules/README.md` | Template-only, not a registry | Updated to point to `docs/modules/index.md` |
| `docs/README.md` | Broad index exists but lacks system-map entrypoint and has repeated `Governance Addendum` headings | Keep as broad catalog; use `docs/index.md` for technical entrypoint |
| Some `docs/modules/*_v2.md` files | Many describe planned V2 capabilities that exist partially or behind guards | Mark rows as `UNVERIFIED` or V2 in module registry until code-linked |
| Planning reports before 2026-05-01 | Useful history but may not reflect current web-first release decision | Treat as historical evidence unless referenced by current project state |

## Missing Documentation Areas Found

- Central engineering entrypoint: added `docs/index.md`.
- Codebase map: added `docs/architecture/codebase-map.md`.
- Traceability matrix: added `docs/architecture/traceability-matrix.md`.
- Pipeline registry: added `docs/pipelines/index.md`.
- Module registry: added `docs/modules/index.md`.
- Documentation drift report: added `docs/analysis/documentation-drift.md`.
- Documentation contribution rules: added `docs/CONTRIBUTING-DOCS.md`.

## Next Inventory Improvements

- Generate a route-to-controller-to-test table from `apps/api/routes/api.php`.
- Generate model-to-migration coverage from `apps/api/app/Models` and
  `apps/api/database/migrations`.
- Add per-pipeline documents for each registry row once gaps are triaged.
