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

- [x] `NEST-210` Audit live localization coverage on the founder-critical path
  - Done on: 2026-05-01
  - Notes:
    - Published a file-level audit of shared localization coverage and language
      source drift for founder-critical web and mobile surfaces in
      `docs/planning/nest_210_founder_critical_localization_audit_2026-05-01.md`.
    - Confirmed the next implementation dependency order as `NEST-211`,
      `NEST-212`, then `NEST-213`.
- [x] `NEST-211` Move web shell and dashboard copy to shared localization keys
  - Done on: 2026-05-01
  - Notes:
    - Added shared shell and dashboard localization keys in
      `packages/shared-types/src/localization.js`.
    - Wired the authenticated web shell to the stored UI language through
      `apps/web/src/lib/ui-language.ts` and localized dashboard entry copy in
      `apps/web/src/app/dashboard/page.tsx`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
      `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
      `node --experimental-strip-types .\scripts\route-guard-regression.mjs`
      and `node .\scripts\unit-contract.mjs` in `apps/web`.
    - Build note:
      `node .\node_modules\next\dist\bin\next build --webpack` is currently
      blocked in this environment by `spawn EPERM`.
- [x] `NEST-212` Move mobile founder-critical shell copy to shared localization keys
  - Done on: 2026-05-01
  - Notes:
    - Added mobile shell, Calendar, and Settings localization keys in
      `packages/shared-types/src/localization.js`.
    - Added `apps/mobile/lib/ui-language.ts` and wired mobile tab labels,
      shared `ModuleScreen` chrome, Calendar shell copy, and Settings hub copy
      to the shared translation contract.
    - Added task report:
      `docs/planning/nest_212_mobile_shell_localization_2026-05-01.md`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit`,
      `node .\scripts\unit-contract.mjs`,
      `.\node_modules\.bin\expo.CMD export --platform web`
      in `apps/mobile`.
- [x] `NEST-213` Close localization behavior for settings-driven language changes
  - Done on: 2026-05-01
  - Notes:
    - Replaced the web mount-time language snapshot with a reactive shared
      store in `apps/web/src/lib/ui-language.ts`.
    - Updated web settings save flow to persist the resolved language so the
      authenticated shell reacts immediately after `/auth/settings`.
    - Reworked `apps/mobile/lib/ui-language.ts` into a reactive shared store
      and wired the advanced settings modal language toggle to that store.
    - Added task report:
      `docs/planning/nest_213_settings_driven_language_propagation_2026-05-01.md`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
      `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
      `node .\scripts\unit-contract.mjs` in `apps/mobile`,
      `.\node_modules\.bin\expo.CMD export --platform web`
      in `apps/mobile`.

### Wave C - Cross-Surface Contract Integrity

- [x] `NEST-214` Audit shared-types exports against backend responses for core CRUD flows
  - Done on: 2026-05-01
  - Notes:
    - Audited the founder-critical CRUD controllers against
      `@nest/shared-types` and confirmed the shared client only covered a
      partial read surface while several item declarations drifted from real
      Laravel responses.
    - Hardened `packages/shared-types/src/client.js`,
      `packages/shared-types/src/index.d.ts`, and
      `packages/shared-types/src/client.d.ts` with CRUD methods plus richer
      payload/item types for `lists`, `tasks`, `habits`, `routines`, `goals`,
      `targets`, `life-areas`, `journal-entries`, and `calendar-events`.
    - Added task report:
      `docs/planning/nest_214_shared_types_contract_audit_2026-05-01.md`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
      `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
      `node .\scripts\unit-contract.mjs` in `apps/web`,
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
      `node .\scripts\unit-contract.mjs` in `apps/mobile`,
      `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`.
- [x] `NEST-215` Reconcile frontend assumptions with actual API error envelopes
  - Done on: 2026-05-01
  - Notes:
    - Hardened `@nest/shared-types` error helpers so they read
      `error.code`, `error.retryable`, `error.http_status`, top-level field
      errors, and backend message payloads from the current Laravel error
      envelope.
    - Updated the shared request client so thrown request errors preserve
      machine-readable metadata for downstream web/mobile consumers.
    - Added task report:
      `docs/planning/nest_215_frontend_api_error_envelope_reconciliation_2026-05-01.md`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
      `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
      `node .\scripts\unit-contract.mjs` in `apps/web`,
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
      `node .\scripts\unit-contract.mjs` in `apps/mobile`,
      `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`.
- [x] `NEST-216` Verify and harden offline/manual sync user flow
  - Done on: 2026-05-01
  - Notes:
    - Exposed `getApiErrorCode(...)` and `getApiErrorRetryable(...)` through
      the existing web/mobile UX contract wrappers.
    - Updated web and mobile offline/manual sync flows to persist retryability
      metadata from the backend error envelope.
    - Auto-sync now skips `retryable: false` failures instead of looping on
      failed items with no `next_retry_at`; manual `Retry Sync` remains
      available as the user-controlled override.
    - Added task report:
      `docs/planning/nest_216_offline_manual_sync_hardening_2026-05-01.md`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
      `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
      `node .\scripts\unit-contract.mjs` in `apps/web`,
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
      `node .\scripts\unit-contract.mjs` in `apps/mobile`,
      `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`.

### Wave D - Founder Daily-Loop Quality

- [x] `NEST-217` Re-audit web dashboard and planning for repeated daily use
  - Done on: 2026-05-01
  - Notes:
    - Re-audited Dashboard and Planning against repeated-use quality,
      canonical direction, and the screen quality checklist.
    - Fixed a Dashboard trust issue where live hero copy derived the displayed
      habit count from `progressPercent - todayDoneTasksCount`, mixing a
      percent with an item count.
    - Dashboard live hero now reports completed tasks plus active habits, which
      matches the data currently loaded by the route.
    - Planning audit confirmed the current canonical workspace is acceptable
      for this slice; larger improvements around route-local API casts and
      lower legacy management surfaces remain future incremental work.
    - Added task report:
      `docs/planning/nest_217_web_dashboard_planning_daily_use_audit_2026-05-01.md`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`,
      `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`,
      `node .\scripts\unit-contract.mjs` in `apps/web`,
      `pnpm build` in `apps/web`.
- [x] `NEST-218` Re-audit mobile daily-loop ergonomics
  - Done on: 2026-05-01
  - Notes:
    - Re-audited the mobile daily loop and closed the smallest repeated-use
      blocker on the main Tasks tab.
    - Added a real-data `Daily focus` band above mobile Tasks create/filter
      controls so the first action answers what to do next instead of opening
      directly on CRUD administration.
    - Existing mobile Tasks list/task create, edit, complete, delete, search,
      and filter flows remain available below the daily-use band.
    - Added task report:
      `docs/planning/nest_218_mobile_daily_loop_ergonomics_2026-05-01.md`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`,
      `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`.
- [x] `NEST-219` Tighten settings and support IA for founder-critical actions only
  - Done on: 2026-05-01
  - Notes:
    - Added a job-based support map at the top of mobile advanced settings so
      language, sync recovery, notifications, and Copilot are discoverable
      before the long utility flow.
    - Strengthened visual section framing in the modal without changing
      existing handlers or API paths.
    - Classified mobile Calendar `manual-token-*` provider connection behavior
      as a local integration harness, not production-ready provider OAuth.
    - Added task report:
      `docs/planning/nest_219_settings_support_ia_2026-05-01.md`.
    - Validation:
      `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`,
      `.\node_modules\.bin\expo.CMD export --platform web` in `apps/mobile`.

### Wave E - Readiness Evidence And Final Gate

- [x] `NEST-220` Produce refreshed `v1` readiness matrix across API, web, mobile, and parity
  - Done on: 2026-05-01
  - Notes:
    - Published the refreshed readiness matrix in
      `docs/planning/v1_readiness_matrix_2026-05-01.md`.
    - Current gate status is `PARTIAL - not founder-ready yet`.
    - Explicitly represented the mobile Calendar `manual-token-*` provider
      connection behavior as a local integration harness rather than
      production-ready OAuth/provider auth.
    - Next evidence tasks remain `NEST-221` parity audit, `NEST-222`
      accessibility baseline, and `NEST-223` final blocker review.
- [x] `NEST-221` Run fresh parity audit on repaired web/mobile core flows
  - Done on: 2026-05-01
  - Notes:
    - Published the repaired parity audit in
      `docs/planning/nest_221_web_mobile_parity_audit_2026-05-01.md`.
    - Confirmed Tasks/Lists, Habits/Routines, Goals/Targets,
      Journal/Life Areas, language switching, sync recovery, and settings
      reachability are outcome-equivalent enough for the current V1 evidence
      gate.
    - Recorded mobile Calendar event management as `PARTIAL`: mobile can
      inspect conflicts/connections/health and remediate integration health,
      but does not expose real event CRUD; `ModuleScreen` quick actions are
      presentational without handlers.
    - Kept provider connection production semantics as `BLOCKED` because
      mobile Calendar `manual-token-*` remains a local integration harness.
- [x] `NEST-222` Run accessibility baseline pass for repaired founder-critical screens
  - Done on: 2026-05-01
  - Notes:
    - Published the accessibility baseline in
      `docs/planning/nest_222_accessibility_baseline_2026-05-01.md`.
    - Web has strong native label/button coverage in core flows, but remains
      `PARTIAL` because no shared `:focus-visible` baseline was found.
    - Mobile remains `PARTIAL` because custom `Pressable` controls and
      placeholder-heavy `TextInput` fields do not carry explicit
      `accessibilityRole`/`accessibilityLabel` coverage in scoped files.
    - Contrast remains `OPEN` because no automated or sampled measurement was
      run.
    - Mobile Calendar quick actions remain a product/accessibility blocker
      because they look actionable but have no handlers.
- [x] `NEST-223` Publish `v1 founder-ready` blocker review and launch recommendation
  - Done on: 2026-05-01
  - Notes:
    - Published final blocker review:
      `docs/planning/nest_223_founder_ready_blocker_review_2026-05-01.md`.
    - Recommendation:
      `BLOCKED - do not call Nest v1 founder-ready yet`.
    - Hard blockers:
      mobile Calendar event CRUD parity,
      provider connection production semantics,
      accessibility baseline closure,
      API/security validation freshness.
    - Follow-up queue:
      `NEST-224` through `NEST-228`.

### Wave F - Founder-Ready Blocker Closure

- [x] `NEST-224` Resolve mobile Calendar event CRUD parity
  - Done on: 2026-05-01
  - Notes:
    - Mobile Calendar now loads real `/calendar-events` data and supports
      create, inline edit, delete, refresh, validation, feedback, and
      force-sync behavior through the existing shared client.
    - `ModuleScreen` quick actions now support optional handlers, and Calendar
      uses a route-specific content slot for event panels.
    - Added report:
      `docs/planning/nest_224_mobile_calendar_event_crud_parity_2026-05-01.md`.
    - Validation:
      mobile typecheck, unit contract, Expo web export, and `git diff --check`.
- [x] `NEST-225` Resolve provider connection production semantics
  - Done on: 2026-05-01
  - Notes:
    - Selected Option B: provider connect is outside the V1 founder-ready
      claim.
    - Removed the misleading production-like connect affordance from mobile
      Calendar and the web provider connections card.
    - Preserved provider health, remediation, and revoke surfaces.
    - Added report:
      `docs/planning/nest_225_provider_connection_production_semantics_2026-05-01.md`.
    - Validation:
      mobile typecheck, unit contract, Expo web export, web typecheck, web
      lint with `.next` ignored, web build, static inspection for removed
      `manual-token-*` connect paths, and `git diff --check`.
- [x] `NEST-226` Implement accessibility baseline closure
  - Done on: 2026-05-01
  - Notes:
    - Added shared web `:focus-visible` styling for links, buttons, form
      fields, summaries, and ARIA button/tab roles.
    - Added explicit mobile roles/labels to shared ModuleScreen actions,
      mobile Calendar CRUD controls, Settings shortcuts, and advanced modal
      language/sync/notification/Copilot controls.
    - Added report:
      `docs/planning/nest_226_accessibility_baseline_closure_2026-05-01.md`.
    - Validation:
      mobile typecheck, unit contract, Expo web export, web typecheck, web
      lint with `.next` ignored, web build, and `git diff --check`.
- [x] `NEST-227` Refresh API/security validation evidence
  - Done on: 2026-05-01
  - Notes:
    - API Integration suite passed 11 tests / 75 assertions.
    - API Unit suite passed 20 tests / 60 assertions.
    - API Feature suite passed 215 tests / 1259 assertions.
    - Security controls initially warned on `secret_rotation_recency`; after
      running `secrets:rotate` in testing, security controls passed with
      `severity: ok`, 6 checks, 0 failed.
    - Added report:
      `docs/planning/nest_227_api_security_validation_refresh_2026-05-01.md`.
- [x] `NEST-228` Re-run founder-ready gate after P0 blockers close
  - Done on: 2026-05-01
  - Notes:
    - Published:
      `docs/planning/nest_228_founder_ready_gate_rerun_2026-05-01.md`.
    - Recommendation:
      `FOUNDER-READY CANDIDATE - scoped V1 is implementation-ready, but final
      human smoke evidence is still required before declaring full v1
      founder-ready`.
    - Remaining evidence:
      narrow web/mobile founder smoke, accessibility smoke, and contrast
      measurement.
- [x] `NEST-229` Run founder smoke evidence for scoped V1 candidate
  - Done on: 2026-05-01
  - Notes:
    - Automated route smoke passed for web and mobile.
    - Browser smoke result:
      `BLOCKED WITH REQUIRED FIXES`.
    - Report:
      `docs/planning/nest_229_founder_smoke_evidence_2026-05-01.md`.
    - Findings:
      local browser UI calls are blocked by missing local CORS defaults, and
      mobile lacks an authenticated API session path.
- [x] `NEST-230` Fix local founder-smoke CORS defaults for web/mobile dev origins
  - Done on: 2026-05-01
  - Notes:
    - Allow documented local dev origins for local/testing environments without
      widening production CORS.
    - Added report:
      `docs/planning/nest_230_local_founder_smoke_cors_defaults_2026-05-01.md`.
    - Validation:
      targeted CORS and Calendar API tests passed; manual local preflight
      returned `204` with `Access-Control-Allow-Origin`.
- [x] `NEST-232` Fix web Calendar event query page size contract
  - Done on: 2026-05-01
  - Notes:
    - Changed web Calendar event/task initial loads to `per_page: 100`.
    - Added report:
      `docs/planning/nest_232_web_calendar_page_size_contract_2026-05-01.md`.
    - Validation:
      web typecheck, web build, static inspection, browser Calendar CRUD smoke,
      and `git diff --check`.
- [ ] `NEST-231` Decide and implement mobile authenticated API session path
  - Status: BLOCKED
  - Notes:
    - Needed before mobile can prove real authenticated API behavior in founder
      smoke.
    - Decision brief:
      `docs/planning/nest_231_mobile_authenticated_api_session_path_2026-05-01.md`.

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
