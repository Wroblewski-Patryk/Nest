# V1 Readiness Matrix

Date: 2026-05-03

Status vocabulary:

- `PASS`: evidence exists in code, tests, docs, or task reports.
- `PARTIAL`: implementation improved, but coverage or proof is incomplete.
- `OPEN`: not yet implemented or not yet verified.
- `BLOCKED`: cannot be called ready without a decision or fix.
- `DEFERRED`: moved out of V1 by explicit scope decision.
- `WAIVED`: not required for the current V1 claim by explicit user decision.

## Scope Decision

On 2026-05-02 the user explicitly paused mobile application work for V1:
current V1 views should be implemented in the web layer, and the mobile
application is V2 scope. This matrix is now a web-first V1 readiness matrix.
Mobile implementation work completed before this decision remains useful V2
foundation, but mobile parity, mobile authenticated API smoke, and mobile
release evidence are no longer V1 blockers.

## Summary

Current recommendation after `NEST-318`:

`WEB-FIRST FOUNDER-READY CANDIDATE - scoped V1 has current backend, web UX,
route-intent, production web smoke, keyboard, and deterministic primary/action
contrast evidence, but localization completeness and final release sign-off are
still required before declaring full v1 founder-ready`

The recent `NEST-210` through `NEST-219` wave materially improved
localization, shared contracts, error handling, offline sync, web daily-use
trust, and settings support IA. The remaining V1 risk is no longer broad
implementation uncertainty; it is web release evidence and a few classified
release risks:

- accessibility baseline has been improved by `NEST-226`; measured contrast
  and manual web accessibility smoke remain final-gate evidence,
- provider connect is now excluded from the V1 founder-ready claim by
  `NEST-225`; Nest-first Calendar event CRUD, provider health, remediation, and
  revoke remain in scope,
- API full-suite and security-control evidence was refreshed by `NEST-227`.
- `NEST-228` reran the gate and found that remaining release risk is evidence,
  not a known P0 implementation blocker.
- `NEST-233` centralized web route API request typing, closing the documented
  route-local cast cleanup item.
- `NEST-234` moved lower web Automations, Billing, and Insights route copy into
  the shared EN/PL localization dictionary.
- `NEST-235` aligned navigation hierarchy with the V1/V2 split: core modules
  stay primary, while Insights and Assistant are optional surfaces.
- `NEST-231` is deferred to V2 after the 2026-05-02 user decision to pause
  mobile app work and implement current V1 views in the web layer.
- `NEST-310` through `NEST-317` closed the main web UX action-flow gaps:
  Dashboard task capture, Planning create-task intent, Calendar event intent,
  Journal entry intent, Nest-native confirmation dialogs, contextual module
  integration, and desktop/mobile production web smoke evidence.
- `NEST-317` checked 22 route/viewport combinations with zero failures and
  fixed the mobile Calendar action-intent visibility regression found during
  QA.
- `NEST-319` checked deterministic primary/action contrast and keyboard focus
  movement; it darkened the shared action accent to `#63794c` after the first
  contrast pass found white-on-green action text below threshold.

## Repository Truth

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Startup docs match real workspace layout and local run sequence | PASS | Earlier v1 recovery reports and current queue alignment in `mvp-next-commits.md` | Reconfirm during `NEST-223` |
| API and web entry commands are documented without broken root commands | PASS | `v1_founder_ready_checklist_2026-04-26.md`; recent commands ran directly in app folders | Reconfirm during final gate |
| Current execution truth reflected in task board and project state | PASS | `.codex/context/TASK_BOARD.md`, `.codex/context/PROJECT_STATE.md` updated through `NEST-318` | Continue updating per task |
| No known contract drift remains undocumented for critical paths | PASS | `NEST-214`, `NEST-215`, `NEST-216` hardened shared contracts; `NEST-233` removed repeated web route-local request casts | Keep monitoring during final gate |

## Backend Reliability

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| API feature, integration, and unit suites are green or triaged | PASS | `NEST-227`: Integration 11/75, Unit 20/60, Feature 215/1259 all passed | Keep as final gate evidence |
| Sync endpoints, controller responses, tests, and docs describe one contract | PASS | `NEST-214`/`NEST-216` aligned shared client and sync retry semantics; deployment hardening refreshed queue/runtime behavior in `NEST-301` through `NEST-309` | Keep in final release validation |
| Tenant isolation remains covered for critical module and integration behavior | PASS | `NEST-227` refreshed integration and feature suites including tenant isolation coverage | Keep as final gate evidence |
| Machine-readable API error envelopes stay intact for programmatic clients | PASS | `NEST-215` hardened shared error helpers and request error metadata | Keep contract checks in final gate |

## Web Product Closure

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Authenticated entry behavior deterministic across public/protected routes | PASS | Prior route guard work plus web validations in recent tasks | Include route smoke in final gate |
| Onboarding policy matches guard logic and user-visible flow | PASS | Prior onboarding/guard repair reports; no new drift found in this wave | Reconfirm during final gate |
| Dashboard and Planning support practical daily-use loop | PASS | `NEST-217` fixed Dashboard live-data trust; `NEST-310` through `NEST-313` closed dashboard/planning creation intent and action clarity gaps | Keep in final smoke |
| Each core web module supports create/edit/review/delete where applicable | PASS | Core routes are API-backed; `NEST-310` through `NEST-317` verified practical create/action entrypoints and contextual module UX for Dashboard, Planning, Calendar, Journal, Habits, Routines, Life Areas, Insights, Automations, Billing, and Settings | Keep final smoke focused on critical paths |
| Key user-facing text avoids mojibake, accidental mixed language, raw technical wording | PARTIAL | `NEST-209` through `NEST-213` improved core paths; `NEST-234` localized lower web route chrome/status copy | Continue web route/view localization closure |
| `en` and `pl` localization visibly affect core v1 path | PARTIAL | Web shell/dashboard and lower web route chrome use shared localization | Continue web core route localization review |

## Mobile Scope

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Mobile app delivery | DEFERRED | 2026-05-02 user decision: mobile app is V2 scope | Resume only when V2 mobile planning starts |
| Mobile parity evidence | WAIVED | 2026-05-02 user decision removed mobile from the V1 release gate | Do not spend V1 work on mobile parity |
| Mobile authenticated API smoke | WAIVED | `NEST-231` is superseded by the web-first V1 decision | Revisit in V2 mobile auth/session planning |

## Cross-Surface Integrity

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Shared client contracts match backend reality for critical v1 flows | PASS | `NEST-214` shared CRUD contract audit and validations | Monitor route-local cast cleanup |
| Web maps backend errors into user-safe recovery guidance | PASS | `NEST-209`, `NEST-215`, `NEST-216` | Verify user-facing recovery in final web smoke |
| Offline/manual sync feels intentional and understandable for founder-critical path | PASS | `NEST-216` retryability handling; `NEST-219` support map exposes sync recovery | Keep in release smoke if sync is part of release claim |
| Core localization and formatting behavior consistent across the web V1 path | PARTIAL | `NEST-211` to `NEST-213` covered shell/dashboard; `NEST-234` added lower web route coverage | Continue founder-critical web route copy closure |

## Daily-Use Quality

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Repeated daily flows feel calm rather than admin-like | PASS | `NEST-310` through `NEST-317` closed Dashboard/Planning/Calendar/Journal action-intent gaps, added contextual module framing, and verified desktop/mobile web smoke | Keep monitoring through founder smoke |
| Accessibility basics verified on web interactions | PASS | `NEST-222` recorded baseline; `NEST-226` added shared web focus-visible styling; `NEST-319` verified keyboard movement and deterministic primary/action contrast across the critical web route set | Keep manual assistive-technology review as future polish, not a V1 blocker |
| Product usable without hidden setup knowledge from repository author | PASS | `NEST-310` through `NEST-317` made primary web actions route-addressable and visible; contextual module panels explain lower-level/advanced surfaces | Reconfirm in final founder smoke |

## Blockers For Founder-Ready Claim

1. `PASS WITH SCOPE BOUNDARY`: provider connection production semantics.
   - Current state:
     `NEST-225` selected Option B and removed provider connect from the
     delivered V1 founder-ready claim. Production provider OAuth remains future
     scope.
   - Required resolution:
     none for V1 founder-ready, as long as the final gate keeps provider
     connect outside the release claim.

2. `WAIVED`: post-repair mobile parity audit.
   - Required resolution:
     none for V1 after the 2026-05-02 user decision; mobile is V2 scope.

3. `PASS`: accessibility and contrast baseline.
   - Required resolution:
     `NEST-319` completed deterministic primary/action contrast and keyboard
     smoke evidence. Manual assistive-technology review can continue as
     future polish.

4. `PASS`: full backend/API validation freshness.
   - Required resolution:
     `NEST-227` completed API Integration, Unit, Feature, and security-control
     validation.

## Next Tasks

1. Complete web localization completeness review and release sign-off plan.
2. Keep provider connect outside V1 unless future production OAuth is
   implemented and verified.
