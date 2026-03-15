# Nest Documentation

Nest is a LifeOS application: a single system that structures life data
(tasks, goals, habits, routines, notes, calendar) and synchronizes with
external tools.

The product name is **Nest** (not NestJS). The planned backend stack is
**Laravel + PostgreSQL**.

This folder contains product and technical documentation for MVP and the
first production-ready architecture.

## Document Map

- [overview.md](./docs/overview.md): product scope, target platforms, MVP boundaries.
- [core_principles.md](./docs/core_principles.md): architecture principles and rules.
- [system_architecture.md](./docs/system_architecture.md): end-to-end architecture.
- [tech_stack.md](./docs/tech_stack.md): selected technologies, version policy, update cadence.
- [database_decision.md](./docs/database_decision.md): PostgreSQL decision and alternatives.
- [frontend_strategy.md](./docs/frontend_strategy.md): web + mobile strategy with shared UX.
- [backend_strategy.md](./docs/backend_strategy.md): API, auth, jobs, integrations, AI tooling.
- [development_and_deployment.md](./docs/development_and_deployment.md): environments, CI/CD, release workflow.
- [integrations.md](./docs/integrations.md): providers and sync model.
- [domain_model.md](./docs/domain_model.md): core entities.
- [modules.md](./docs/modules.md): module boundaries.
- [ai_layer.md](./docs/ai_layer.md): AI capabilities and tool contracts.
- [mvp_scope.md](./docs/mvp_scope.md): first release scope.
- [roadmap.md](./docs/roadmap.md): phase plan.
- [product_vision.md](./docs/product_vision.md): long-term vision.

## Current Direction (March 15, 2026)

- Backend: Laravel 12 on PHP 8.4, API-first.
- Database: PostgreSQL 17 as default target (18 where provider support is mature).
- Cache/queues: Redis.
- Frontend:
  - Web app for desktop/tablet/mobile.
  - Mobile app for phone/tablet.
  - Shared design language and shared API contracts.

## Status

Architecture definition in progress, implementation not started in this repository.

## License

This project is proprietary software. See [LICENSE](./LICENSE).
