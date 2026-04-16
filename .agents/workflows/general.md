---
description: Workspace rules for Nest (LifeOS)
---

# General Workspace Rules

## Stack Snapshot
- Backend: Laravel 12 API, Sanctum auth, PostgreSQL, Redis
- Web: Next.js 16, React 19, TypeScript, shared types package
- Mobile: Expo SDK 55, React Native, TypeScript
- Runtime constraints: multi-tenant model, human+AI actor support, web/mobile
  parity, localization baseline (`en`, `pl`)

## Architecture Rules
- Keep multi-tenant isolation, actor boundaries, and localization behavior
  explicit in implementation notes.
- Prefer existing monorepo contracts in `apps/`, `packages/`, and `docs/`
  before inventing a new pattern.
- Treat `.codex/context/TASK_BOARD.md` as the execution source of truth.
- If no task is executable, derive the next smallest task from:
  - `docs/planning/next_execution_wave_2026-03-21.md`
  - `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md`
  - `docs/planning/open-decisions.md`

## UI/UX Rules
- Use approved design artifacts before implementing UX-heavy changes.
- Keep desktop, tablet, mobile, and accessibility evidence explicit.
- Maintain parity between web and mobile for core module behavior.

## Delivery Rules
- Keep changes scoped and reversible.
- Follow the loop: plan -> implement -> relevant tests -> architecture review
  -> sync context.
- Use subagents only according to `.agents/workflows/subagent-orchestration.md`.
- Update `.codex/context/PROJECT_STATE.md` and `.codex/context/TASK_BOARD.md`
  whenever repo truth changes.
