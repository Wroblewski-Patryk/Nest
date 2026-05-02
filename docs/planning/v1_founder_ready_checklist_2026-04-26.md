# V1 Founder-Ready Checklist

Last updated: 2026-05-03

## Purpose

This checklist defines the minimum truth gate before Nest can be called
`v1 founder-ready` for real day-to-day use.

It is intentionally narrower than a full commercial launch checklist.

It answers one question:

Can the founder trust the web V1 of Nest every day without needing to mentally
compensate for repo drift, broken flows, or missing release-critical behavior?

## Use

Use this checklist as the canonical readiness gate during the `v1` repair wave.

- A line is `PASS` only when evidence exists in code, tests, or UX review.
- A line is `OPEN` when the requirement is still unmet or not yet verified.
- A line is `WAIVED` only with explicit user approval and recorded rationale.

## Scope Decision

On 2026-05-02 the user explicitly paused mobile application work for V1:
current V1 views should be implemented in the web layer, and the mobile
application is V2 scope. Mobile implementation work completed before this
decision remains useful V2 foundation, but mobile parity, mobile authenticated
API smoke, and mobile release evidence are no longer V1 founder-ready blockers.

## Readiness Gate

## 1. Repository Truth

- `PASS` startup docs match the real workspace layout and local run sequence.
- `PASS` API and web entry commands are documented without broken root
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

## 4. Mobile Scope

- `WAIVED` mobile parity is not required for V1 after the 2026-05-02 user
  scope decision.
- `WAIVED` mobile authenticated API smoke is not required for V1 after the
  2026-05-02 user scope decision.
- `DEFERRED` mobile app delivery belongs to V2 and must reuse the same backend
  API, domain model, localization baseline, and tenant boundaries when resumed.

## 5. Cross-Surface Integrity

- `PASS` shared client contracts match backend reality for critical `v1` flows.
- `PASS` web maps backend errors into user-safe recovery guidance.
- `PASS` offline/manual sync feels intentional and understandable for the
  founder-critical path.
- `PARTIAL` core web localization and formatting behavior is consistent across
  the V1 web path.

## 6. Daily-Use Quality

- `OPEN` repeated daily flows feel calm rather than admin-like.
- `OPEN` accessibility basics are verified on web interactions.
- `OPEN` the product can be used without relying on hidden setup knowledge from
  the repository author.

## Current Status Snapshot (2026-05-03)

- `WEB-FIRST FOUNDER-READY CANDIDATE` refreshed readiness evidence now lives
  in `docs/planning/v1_readiness_matrix_2026-05-01.md`.
- `PASS` repository startup truth, current task/context truth, shared error
  envelope handling, offline/manual sync retryability, and the web validation
  baselines covered by recent slices have current evidence.
- `PASS` API validation freshness was refreshed by `NEST-227`.
- `PASS` route-local request cast cleanup is now covered by `NEST-233`.
- `PARTIAL` localization completeness, repeated-flow quality, and final web
  release evidence still need confirmation before the gate can close.
  `NEST-234` improved lower web routes.
- `PASS` repeated-flow quality and practical web core-module operation were
  materially refreshed by `NEST-310` through `NEST-317`: Dashboard capture,
  Planning create-task intent, Calendar create-event intent, Journal
  create-entry intent, Nest-native confirmations, contextual module framing,
  and production web smoke evidence.
- `PASS WITH SCOPE BOUNDARY` navigation now matches the V1/V2 split after
  `NEST-235`: Insights and Assistant remain reachable as optional surfaces
  without presenting as core V1 modules.
- `PASS WITH SCOPE BOUNDARY` provider connect is outside the V1 founder-ready
  claim after `NEST-225`; Nest-first Calendar event CRUD, provider health,
  remediation, and revoke remain in scope.
- `WAIVED` mobile parity and mobile authenticated API smoke are no longer V1
  founder-ready dependencies after the 2026-05-02 user decision. Prior mobile
  work remains V2 foundation.
- `PARTIAL` accessibility has a static baseline from `NEST-222` and baseline
  closure from `NEST-226`; contrast and manual web accessibility smoke remain
  final-gate evidence.
- `FOUNDER-READY CANDIDATE` `NEST-228` reran the gate and found the scoped V1
  implementation ready for final smoke, but not yet safe to declare fully
  `v1 founder-ready` without narrow web UI, accessibility, and contrast
  evidence.
- `DEFERRED` `NEST-231` mobile authenticated API session evidence is moved to
  V2 scope by the 2026-05-02 user decision and no longer blocks V1.
- `NEXT` final V1 gate work should focus on manual web accessibility,
  contrast evidence, remaining localization completeness, and launch sign-off
  rather than broad new product implementation.

## Previous Status Snapshot (2026-04-26)

- `PASS` repository startup truth recovery has started and the main doc drift
  was corrected.
- `PASS` API feature and integration baseline is green after sync-contract
  regression repair.
- `PASS` web route-access and onboarding guard truth are aligned in code and
  regression tests.
- `PARTIAL` web copy/localization hardening has started on the entry path, but
  not yet across all core modules.
- `DEFERRED` mobile parity recovery belongs to V2.
- `OPEN` founder-ready status must not be declared until web baseline, broader
  web localization closure, and release evidence checks are completed.

## Exit Rule

Nest is `v1 founder-ready` only when:

1. all `PASS`/`OPEN` lines required for repository truth, backend reliability,
   and web product closure are satisfied,
2. mobile is clearly scoped out of the V1 release claim and not presented as
   V1-ready,
3. remaining gaps are polish-level rather than trust-breaking.
