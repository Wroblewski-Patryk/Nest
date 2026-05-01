# V1 Founder-Ready Checklist

Last updated: 2026-05-01

## Purpose

This checklist defines the minimum truth gate before Nest can be called
`v1 founder-ready` for real day-to-day use.

It is intentionally narrower than a full commercial launch checklist.

It answers one question:

Can the founder trust Nest every day without needing to mentally compensate for
repo drift, broken flows, or missing parity?

## Use

Use this checklist as the canonical readiness gate during the `v1` repair wave.

- A line is `PASS` only when evidence exists in code, tests, or UX review.
- A line is `OPEN` when the requirement is still unmet or not yet verified.
- A line is `WAIVED` only with explicit user approval and recorded rationale.

## Readiness Gate

## 1. Repository Truth

- `PASS` startup docs match the real workspace layout and local run sequence.
- `PASS` API, web, and mobile entry commands are documented without broken root
  commands.
- `PASS` current execution truth is reflected in `.codex/context/TASK_BOARD.md`
  and `.codex/context/PROJECT_STATE.md`.
- `PASS` no known contract drift remains undocumented for critical paths.

## 2. Backend Reliability

- `PASS` API feature, integration, and unit suites are green, or every
  remaining failure is explicitly triaged with owner and blocking status.
- `PASS` sync endpoints, controller responses, tests, and docs describe one
  contract.
- `PASS` tenant isolation remains covered for critical module and integration
  behavior.
- `PASS` machine-readable API error envelopes stay intact for programmatic
  clients.

## 3. Web Product Closure

- `PASS` authenticated entry behavior is deterministic across `/`, `/auth`,
  `/onboarding`, and protected routes.
- `PASS` onboarding policy matches guard logic and user-visible flow.
- `PASS` dashboard and planning support a practical daily-use loop.
- `PASS` each core web module supports create, edit, review, and delete through
  GUI where applicable.
- `PASS` key user-facing text avoids mojibake, mixed accidental language, and
  raw technical wording.
- `PASS` `en` and `pl` localization visibly affect the core `v1` path.

## 4. Mobile Parity

- `PASS` mobile typecheck passes.
- `PASS` mobile build/export passes.
- `PARTIAL` mobile core modules are API-backed rather than placeholder-only.
- `PARTIAL` routines, life areas, settings essentials, and other declared `v1`
  behaviors are actually reachable on mobile.
- `PARTIAL` parity is defended by outcome evidence, not only screenshots.

## 5. Cross-Surface Integrity

- `PASS` shared client contracts match backend reality for critical `v1` flows.
- `PASS` web and mobile map backend errors into user-safe recovery guidance.
- `PASS` offline/manual sync feels intentional and understandable for the
  founder-critical path.
- `PARTIAL` core localization and formatting behavior are consistent across web and
  mobile.

## 6. Daily-Use Quality

- `OPEN` repeated daily flows feel calm rather than admin-like.
- `OPEN` accessibility basics are verified on web and key mobile interactions.
- `OPEN` the product can be used without relying on hidden setup knowledge from
  the repository author.

## Current Status Snapshot (2026-05-01)

- `PARTIAL` refreshed readiness evidence now lives in
  `docs/planning/v1_readiness_matrix_2026-05-01.md`.
- `PASS` repository startup truth, current task/context truth, shared error
  envelope handling, offline/manual sync retryability, and the web/mobile
  validation baselines covered by recent slices have current evidence.
- `PASS` API validation freshness was refreshed by `NEST-227`.
- `PASS` route-local request cast cleanup is now covered by `NEST-233`.
- `PARTIAL` localization completeness, repeated-flow quality, and final release
  evidence still need confirmation before the gate can close. `NEST-234` and
  `NEST-236` improved lower web routes and Mobile Calendar specifically.
- `PASS WITH SCOPE BOUNDARY` navigation now matches the V1/V2 split after
  `NEST-235`: Insights and Assistant remain reachable as optional surfaces
  without presenting as core V1 modules.
- `PASS WITH SCOPE BOUNDARY` provider connect is outside the V1 founder-ready
  claim after `NEST-225`; Nest-first Calendar event CRUD, provider health,
  remediation, and revoke remain in scope.
- `PARTIAL` parity has current evidence from `NEST-221`, and `NEST-224` closed
  mobile Calendar event CRUD. `NEST-235` aligned navigation scope and
  `NEST-236` localized Mobile Calendar CRUD; provider connect is no longer a
  V1 founder-ready dependency.
- `PARTIAL` accessibility has a static baseline from `NEST-222` and baseline
  closure from `NEST-226`; contrast and manual screen-reader/device smoke
  remain final-gate evidence.
- `FOUNDER-READY CANDIDATE` `NEST-228` reran the gate and found the scoped V1
  implementation ready for final smoke, but not yet safe to declare fully
  `v1 founder-ready` without narrow web/mobile UI, accessibility, and contrast
  evidence.
- `BLOCKED` mobile authenticated API session evidence remains unresolved under
  `NEST-231`; the final V1 claim still needs an explicit product/architecture
  decision before mobile real-API smoke can close.

## Previous Status Snapshot (2026-04-26)

- `PASS` repository startup truth recovery has started and the main doc drift
  was corrected.
- `PASS` API feature and integration baseline is green after sync-contract
  regression repair.
- `PASS` web route-access and onboarding guard truth are aligned in code and
  regression tests.
- `PARTIAL` web copy/localization hardening has started on the entry path, but
  not yet across all core modules.
- `OPEN` mobile parity recovery remains the largest unresolved product gap.
- `OPEN` founder-ready status must not be declared until mobile baseline,
  broader localization closure, and cross-surface integrity checks are
  completed.

## Exit Rule

Nest is `v1 founder-ready` only when:

1. all `PASS`/`OPEN` lines required for repository truth, backend reliability,
   and web product closure are satisfied,
2. mobile parity is no longer materially misleading,
3. remaining gaps are polish-level rather than trust-breaking.
