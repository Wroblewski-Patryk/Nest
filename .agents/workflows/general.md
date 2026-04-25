---
description: Workspace rules for Nest (LifeOS)
---

# General Workspace Rules

## Stack Snapshot
- Backend: Laravel 12 API, Sanctum auth, PostgreSQL, Redis
- Web: Next.js 16, React 19, TypeScript, shared types package
- Mobile: Expo SDK 55, React Native, TypeScript
- Runtime constraints:
  - multi-tenant model
  - human and AI actor support
  - web/mobile parity for core modules
  - localization baseline (`en`, `pl`)

## Architecture Rules
- Keep project-specific conventions explicit.
- Document where state lives and why.
- Treat `docs/architecture/` as the approved implementation contract.
- Keep multi-tenant isolation, actor boundaries, and localization behavior
  explicit in implementation notes.
- Prefer existing monorepo contracts in `apps/`, `packages/`, and `docs/`
  before introducing new patterns.
- If a better design requires changing approved architecture, propose it before
  changing code direction or docs.

## Repository And Docs Rules
- Keep root minimal and intentional.
- Put project documentation under `docs/`.
- Update planning, architecture, operations, or UX docs when behavior or
  structure changes.
- Treat docs parity as a done-state requirement for module, route, and IA
  changes.
- Use `.agents/workflows/documentation-governance.md` to decide where new
  repository truth should live.
- Keep links repository-relative and avoid sibling-repository references.

## UI/UX Rules
- Use approved design artifacts before implementing UX-heavy changes.
- Keep desktop, tablet, mobile, and accessibility evidence explicit.
- Maintain parity between web and mobile for core module behavior.
- Reuse existing shared UI patterns before adding one-off variants.
- Figma is primary when available.
- Stitch is draft-only unless approved exception workflow is documented.

## Deployment Rules
- Keep env ownership, health checks, persistent data, and worker ownership
  explicit.
- When runtime behavior changes, review deploy docs, smoke checks, and rollback
  notes in the same task.
- Record real deployment artifacts and paths in
  `.codex/context/PROJECT_STATE.md`.

## Delivery Rules
- Keep changes scoped and reversible.
- Require acceptance evidence before completion.
- Keep planning docs and task board synchronized.
- Follow the loop:
  `plan -> implement -> test -> architecture review -> sync context -> repeat`.
- Apply validation commands from `.codex/context/PROJECT_STATE.md` before every
  commit.
- Use subagents only according to `.agents/workflows/subagent-orchestration.md`.
- Update context files whenever repo truth changes.
