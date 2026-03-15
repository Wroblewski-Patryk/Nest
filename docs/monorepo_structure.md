# Monorepo Structure Proposal (NEST-001)

Last updated: 2026-03-15

## Goal

Define a repository layout that supports:

- one backend (Laravel),
- one web app (Next.js),
- one mobile app (Expo),
- shared contracts/types/tooling across clients.

This document is the proposed structure for approval in task `NEST-001`.

## Proposed Directory Layout

```text
nest/
|-- apps/
|   |-- api/                   # Laravel backend (PHP/Composer)
|   |-- web/                   # Next.js app (Node/pnpm)
|   `-- mobile/                # Expo app (Node/pnpm)
|-- packages/
|   |-- api-contracts/         # OpenAPI specs + generated artifacts
|   |-- shared-types/          # Shared TS domain/API types
|   |-- ui/                    # Shared UI tokens/components (web/mobile-safe)
|   |-- config-eslint/         # Reusable lint config for JS/TS apps
|   |-- config-typescript/     # Shared tsconfig presets
|   `-- tooling/               # Internal scripts/helpers for repo tasks
|-- infra/
|   |-- docker/                # Local service definitions (db/redis/etc.)
|   |-- github/                # CI workflow docs/templates if needed
|   `-- scripts/               # Infra/devops utility scripts
|-- docs/                      # Product/architecture/planning documentation
|-- .codex/
|   `-- context/               # Task board + project state
|-- .github/
|   `-- workflows/             # CI workflows
|-- pnpm-workspace.yaml        # JS/TS workspace scope (apps/*, packages/*)
|-- package.json               # Root JS scripts for workspace orchestration
|-- composer.json              # Optional root script entry for backend tasks
`-- readme.md
```

## Boundaries and Ownership

- `apps/api` owns canonical business rules, persistence, auth, and integrations.
- `packages/api-contracts` is the source of truth for client/backend contract
  artifacts and versioned OpenAPI definitions.
- `packages/shared-types` is consumed by `apps/web` and `apps/mobile` only.
- `packages/ui` contains design tokens and reusable UI primitives where platform
  parity is realistic.
- Infrastructure concerns remain outside app code (`infra/`, `.github/`).

## Build and Tooling Model

- Backend dependencies are managed with Composer in `apps/api`.
- Web and mobile dependencies are managed with pnpm workspace at repo root.
- CI runs targeted jobs by path:
  - backend job for `apps/api/**`,
  - web job for `apps/web/**`,
  - mobile job for `apps/mobile/**`,
  - shared package job for `packages/**`.
- Contract validation gates:
  - OpenAPI diff/validation in `packages/api-contracts`,
  - generated client/type sync checks for `web` and `mobile`.

## Why This Structure

- Matches agreed platform strategy (web + mobile + shared contracts).
- Preserves clean separation between Laravel ecosystem and JS workspace.
- Scales into later roadmap phases (integrations, analytics, SaaS hardening)
  without moving core folders.
- Keeps ownership explicit and CI cost bounded through path-based execution.

## Approval Checklist for NEST-001

- [x] Structure proposal exists and is documented.
- [x] Proposal approved by project owner.
- [x] Task board status moved to `DONE`.
- [x] `PROJECT_STATE.md` updated to reflect approval.
