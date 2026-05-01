# Task

## Header

- ID: NEST-213
- Title: Close localization behavior for settings-driven language changes
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-212
- Priority: P1
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Context

`NEST-211` and `NEST-212` moved founder-critical shell copy onto shared
localization keys, but both clients still had one behavior gap: changing the
language in settings did not reliably propagate through the already-mounted UI.
Web shells kept a mount-time language snapshot, while mobile modal selection
updated only local button state instead of the shared UI language source.

## Goal

Make settings-driven language changes propagate immediately through the active
web and mobile shell surfaces while staying on the existing shared
localization contract.

## Scope

- web language source:
  `apps/web/src/lib/ui-language.ts`
- web settings save path:
  `apps/web/src/app/settings/page.tsx`
- mobile language source:
  `apps/mobile/lib/ui-language.ts`
- mobile settings entry:
  `apps/mobile/app/modal.tsx`
- planning/context sync:
  `docs/planning/mvp-next-commits.md`
  `docs/planning/v1_execution_backlog_2026-04-26.md`
  `.codex/context/TASK_BOARD.md` (attempted; blocked by sandbox write policy)
  `.codex/context/PROJECT_STATE.md` (attempted; blocked by sandbox write
  policy)

## Success Signal

- User or operator problem:
  changing the app language in settings did not update the already-open UI
  consistently.
- Expected product or reliability outcome:
  both clients now use one reactive per-platform language source instead of a
  mount-time snapshot.
- How success will be observed:
  shell-level translated copy updates after saving web settings or changing the
  mobile language toggle without requiring a remount.
- Post-launch learning needed: yes, through the next shared-contract audit.

## Deliverable For This Stage

Implemented propagation fix, updated planning/context docs, and validation
evidence.

## Definition of Done

- [x] web `useUiLanguage()` reacts to stored-language updates
- [x] web settings save writes the resolved language into the shared UI source
- [x] mobile `useUiLanguage()` exposes one reactive shared language store
- [x] mobile advanced settings language toggle writes into that shared store
- [x] writable planning docs reflect task completion and the next queue item

## Implementation Summary

- Replaced the web mount-time `useState(...)` language snapshot with a
  `useSyncExternalStore(...)` subscription over local storage plus a custom
  `nest:ui-language-change` event.
- Updated web settings save flow to persist the resolved language via
  `setStoredUiLanguage(...)` immediately after a successful `/auth/settings`
  response.
- Reworked mobile `apps/mobile/lib/ui-language.ts` into one shared reactive
  store with:
  - persisted language fallback
  - one-time hydration from `getLocalizationOptions()`
  - imperative setter for settings-driven updates
- Switched the mobile advanced settings modal from local-only selection state
  to the shared mobile language store, so the toggle now drives actual UI
  state.

## Validation Evidence

- Tests:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`
  `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`
  `node .\scripts\unit-contract.mjs` in `apps/mobile`
  `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`
- Manual checks:
  code review of web settings save path, web shell subscription, mobile shared
  language store, and mobile advanced-settings toggle
- Build:
  web production build not rerun in this slice
- High-risk checks:
  no new translation system or architecture boundary was introduced

## Result Report

- Task summary:
  closed the remaining shell-level localization propagation gap so settings now
  update active web and mobile UI language state instead of waiting for a
  remount.
- Files changed:
  `apps/web/src/lib/ui-language.ts`,
  `apps/web/src/app/settings/page.tsx`,
  `apps/mobile/lib/ui-language.ts`,
  `apps/mobile/app/modal.tsx`,
  `docs/planning/mvp-next-commits.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`
- How tested:
  web typecheck/lint plus mobile typecheck/unit-contract/export
- What is incomplete:
  route-level non-shell copy still needs the planned shared-contract audit and
  follow-up reconciliation tasks, and `.codex/context/TASK_BOARD.md` plus
  `.codex/context/PROJECT_STATE.md` still need the same status note once write
  access is available
- Next steps:
  execute `NEST-214`
- Decisions made:
  used per-platform reactive language stores on top of existing persistence and
  shared translation helpers instead of introducing a new global app state
  system
