# V1 Execution Backlog

Last updated: 2026-04-26

## Purpose

This backlog turns the `v1` repair direction into one detailed execution queue.

It is intentionally practical:

- small enough to execute slice by slice,
- ordered by dependency,
- aligned with the current architecture and founder-ready gate,
- strict about not widening `v2` scope during `v1` closure.

Primary references:

- `docs/planning/v1_repair_execution_plan_2026-04-26.md`
- `docs/planning/v1_founder_ready_checklist_2026-04-26.md`
- `.codex/context/TASK_BOARD.md`
- `.codex/context/PROJECT_STATE.md`

## Execution Rules

- Keep one primary concern per commit.
- Prefer hardening and closure over new breadth.
- Do not claim parity unless the user outcome is actually equivalent.
- Update repo truth after every meaningful completion.
- Refill `docs/planning/mvp-next-commits.md` from this file.

## Current Snapshot

Already recovered in the active `v1` wave:

- startup docs and API sync regressions,
- onboarding access truth on web,
- mobile validation baseline,
- API-backed mobile core CRUD tabs,
- mobile settings reachability,
- web/mobile feedback copy baseline across major surfaces.

Largest remaining `v1` gaps:

- localization implementation is still partial rather than systematic,
- web and mobile still need one explicitly reconciled shared error wording pass,
- cross-surface contract and sync UX still need one intentional pass,
- founder-ready evidence remains incomplete for parity and quality gates.

## Sequenced Task Queue

### Wave A - Execution Governance And Shared UX Contracts

- [x] `NEST-207` Publish detailed `v1` execution backlog and refill strategy
  - Scope:
    - create one detailed queue for `v1` closure,
    - define dependency order,
    - link the queue from active planning surfaces.
  - Done when:
    - backlog exists in `docs/planning/`,
    - `mvp-next-commits.md` points to the new source,
    - board/project state can reference the same queue.

- [x] `NEST-208` Unify mobile user-safe error and recovery messaging helpers
  - Scope:
    - introduce one shared mobile UX error helper,
    - remove duplicated status-mapping functions,
    - align offline sync status wording with the same contract.
  - Done when:
    - mobile core tabs and support screens use one shared helper,
    - no duplicated `describeApiIssue` / `getErrorMessage` variants remain on
      the touched surfaces.

- [x] `NEST-209` Unify web and mobile error taxonomy wording baseline
  - Scope:
    - compare current web/mobile issue descriptions,
    - reconcile wording for the same status classes,
    - keep machine-readable behavior intact.
  - Done on: 2026-05-01
  - Notes:
    - Moved API error taxonomy parsing into `@nest/shared-types` so web and
      mobile reuse the same field-message, payload-message, and status-based
      fallback contract.
    - Replaced web core-route `...request failed` fallbacks with calmer
      action-oriented copy across Planning, Calendar, Journal, Dashboard,
      Habits, Routines, and Life Areas.
    - Added task report:
      `docs/planning/nest_209_web_mobile_error_taxonomy_wording_baseline_2026-05-01.md`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm exec tsc --noEmit` in `apps/mobile`.

### Wave B - Localization Closure For The Core V1 Path

- [ ] `NEST-210` Audit live localization coverage on the founder-critical path
- [ ] `NEST-211` Move web shell and dashboard copy to shared localization keys
- [ ] `NEST-212` Move mobile founder-critical shell copy to shared localization keys
- [ ] `NEST-213` Close localization behavior for settings-driven language changes

### Wave C - Cross-Surface Contract Integrity

- [ ] `NEST-214` Audit shared-types exports against backend responses for core CRUD flows
- [ ] `NEST-215` Reconcile frontend assumptions with actual API error envelopes
- [ ] `NEST-216` Verify and harden offline/manual sync user flow

### Wave D - Founder Daily-Loop Quality

- [ ] `NEST-217` Re-audit web dashboard and planning for repeated daily use
- [ ] `NEST-218` Re-audit mobile daily-loop ergonomics
- [ ] `NEST-219` Tighten settings and support IA for founder-critical actions only

### Wave E - Readiness Evidence And Final Gate

- [ ] `NEST-220` Produce refreshed `v1` readiness matrix across API, web, mobile, and parity
- [ ] `NEST-221` Run fresh parity audit on repaired web/mobile core flows
- [ ] `NEST-222` Run accessibility baseline pass for repaired founder-critical screens
- [ ] `NEST-223` Publish `v1 founder-ready` blocker review and launch recommendation

## Recommended Execution Order

1. `NEST-207`
2. `NEST-208`
3. `NEST-209`
4. `NEST-210`
5. `NEST-211`
6. `NEST-212`
7. `NEST-213`
8. `NEST-214`
9. `NEST-215`
10. `NEST-216`
11. `NEST-217`
12. `NEST-218`
13. `NEST-219`
14. `NEST-220`
15. `NEST-221`
16. `NEST-222`
17. `NEST-223`

## Refill Guidance For `mvp-next-commits.md`

### NOW

- the next unfinished item from this backlog,
- the next directly dependent item only if the current one is nearly complete.

### NEXT

- the next 2 to 4 tasks blocked only by normal sequencing.

### LATER

- readiness evidence,
- final gate tasks,
- polish that should not compete with hardening.

## Success Definition

This backlog is successful only if it leads to one truthful outcome:

Nest can be called `v1 founder-ready` because the repo is honest, the web and
mobile clients are coherent, and the product behaves like one calm system
rather than a promising prototype.
