# Task

## Header

- ID: NEST-224
- Title: Resolve mobile Calendar event CRUD parity
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-223
- Priority: P0
- Coverage Ledger Rows:
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Process Self-Audit

- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

`NEST-221` and `NEST-222` found the same blocker: mobile Calendar renders
quick actions but does not expose real event CRUD, while web Calendar already
supports event create/update/delete.

## Goal

Make the mobile Calendar tab support real calendar event create, review, edit,
delete, refresh, and force-sync actions through the existing shared API client.

## Scope

- `apps/mobile/app/(tabs)/calendar.tsx`
- `apps/mobile/components/mvp/ModuleScreen.tsx`
- planning/context docs after verification

## Implementation Plan

1. Extend `ModuleScreen` quick actions so they can call optional handlers.
2. Add a children/extra-content slot to `ModuleScreen` for route-specific live
   panels without forking the shared module shell.
3. Add mobile Calendar event state, loading, refresh, create, edit, delete, and
   force-sync behavior using `nestApiClient`.
4. Keep integration conflicts/connections/health behavior intact.
5. Validate mobile typecheck, unit contract, Expo web export, and diff checks.

## Acceptance Criteria

- [x] mobile Calendar loads real `/calendar-events` data
- [x] mobile Calendar can create an event
- [x] mobile Calendar can edit an event title/time/description
- [x] mobile Calendar can delete an event with confirmation
- [x] `Add event` and `Force sync` quick actions are functional
- [x] integration panels still compile and work through existing props
- [x] docs/context queue reflects `NEST-224`

## Definition of Done

- [x] implementation output exists
- [x] acceptance criteria are verified
- [x] required validations were run and recorded
- [x] architecture follow-up is captured if discovered
- [x] task status is updated in `.codex/context/TASK_BOARD.md`
- [x] `.codex/context/PROJECT_STATE.md` reflects current reality

## Forbidden

- new API client or duplicate network stack
- mock-only or placeholder Calendar event paths
- workaround provider auth changes in this slice
- unrelated refactors outside the scoped files

## Notes

Provider production semantics remain `NEST-225`; this task only closes mobile
event CRUD parity.

## Validation Evidence

- `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`: passed.
- `pnpm test:unit` in `apps/mobile`: passed.
- `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`:
  passed.
- `git diff --check` at repository root: passed with existing CRLF warnings.

## Architecture Evidence

- Architecture source reviewed:
  `docs/planning/nest_223_founder_ready_blocker_review_2026-05-01.md`,
  shared client Calendar event contract, project AGENTS instructions.
- Fits approved architecture: yes
- Mismatch discovered: no new mismatch
- Decision required from user: no for event CRUD; provider auth remains
  `NEST-225`.
- Follow-up architecture doc updates:
  readiness docs now mark mobile Calendar event CRUD parity closed.

## Result Report

- Extended `ModuleScreen` quick actions with optional `onPress` and `disabled`
  support, and added a route-specific children slot.
- Added real mobile Calendar event load, create, inline edit, delete,
  refresh, feedback, validation, and `Force sync` behavior through the existing
  `nestApiClient`.
- Preserved integration conflict, connection, and health panels.
- Remaining blocker:
  provider connection production semantics still belongs to `NEST-225`.

## Autonomous Loop Evidence

1. Analyzed current mobile Calendar parity blocker.
2. Selected exactly one task: `NEST-224`.
3. Planned a small implementation using the existing shared module shell and
   API client.
4. Implemented real event CRUD and functional quick actions.
5. Verified with mobile typecheck, unit contract, Expo web export, and diff
   check.
6. Self-reviewed scope to avoid touching provider auth in this slice.
7. Updated planning docs, task board, and project state.
