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
- Use `docs/ux/visual-direction-brief.md` when setting or changing visual
  direction.
- Use `docs/ux/experience-quality-bar.md` for substantial UI review.
- Record reusable UI decisions and proven patterns in `docs/ux/design-memory.md`.
- Use `docs/ux/screen-quality-checklist.md` before calling a screen polished.
- Avoid recurring traps in `docs/ux/anti-patterns.md`.
- Figma is primary when available.
- When a canonical screenshot or mockup exists, require a visual gap audit,
  asset strategy, and screenshot comparison pass.
- Do not replace decorative image assets with gradient approximations when the
  approved design depends on textured or illustrated backgrounds.
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
- For release readiness, handoffs, incidents, stale queues, or broad confidence
  reviews, use `docs/governance/function-coverage-ledger-standard.md` to map
  Nest module functions, evidence gaps, blockers, and the next smallest
  verification or fix task.
- If a function coverage ledger exists, update the smallest truthful row after
  verification, fixes, deferrals, or release-gate reruns.
- Declare the current delivery stage in each task and keep output aligned to
  that stage only.
- Do not skip from analysis or planning straight to implementation unless
  explicitly requested.
- Follow the loop:
  `analyze -> select one task -> plan -> implement -> verify -> self-review -> sync knowledge -> repeat`.
- Apply validation commands from `.codex/context/PROJECT_STATE.md` before every
  commit.
- Use subagents only according to `.agents/workflows/subagent-orchestration.md`.
- Update context files whenever repo truth changes.

## Production Hardening Delivery Rules

- Use `.codex/templates/task-template.md` for every task and include Goal, Scope, Implementation Plan, Acceptance Criteria, Definition of Done, and Result Report.
- Check `DEFINITION_OF_DONE.md` before any task moves to `DONE`.
- Check `INTEGRATION_CHECKLIST.md` before integrated runtime work is accepted.
- Check `NO_TEMPORARY_SOLUTIONS.md` whenever a blocker appears.
- Check `AI_TESTING_PROTOCOL.md` for AI features.
- Check `DEPLOYMENT_GATE.md` before release or deploy handoff.
- Implement features as vertical slices across UI, logic, API, DB, validation, error handling, and tests.
- Do not mark partial runtime work as done.
- Stop and report when the proper solution is blocked.

## Template Sync: World-Class Delivery

- Use `.agents/workflows/user-collaboration.md` when user intent, blockers,
  active visual notes, or handoff expectations need to stay explicit.
- Use `.agents/workflows/world-class-delivery.md` for substantial product,
  runtime, release, UX, security, or AI work.
- Use `docs/governance/autonomous-engineering-loop.md` for autonomous iteration structure, process self-audit, one-task selection, and `BUILDER` / `ARCHITECT` / `TESTER` mode rotation.
- For broad UX review, use `docs/ux/evidence-driven-ux-review.md` and turn
  screenshot or clickthrough evidence into prioritized implementation slices.
- For deployable services or critical journeys, define the relevant SLI/SLO,
  health check, alert route, and rollback or disable path when appropriate.
- Check `docs/security/secure-development-lifecycle.md` for security,
  permissions, secrets, AI, money, integrations, or user-data risk.
- Report changed files, validations actually run, remaining risks, and the next
  tiny task after implementation.
