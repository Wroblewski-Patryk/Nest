# V1 Readiness Matrix

Date: 2026-05-01

Status vocabulary:

- `PASS`: evidence exists in code, tests, docs, or task reports.
- `PARTIAL`: implementation improved, but coverage or proof is incomplete.
- `OPEN`: not yet implemented or not yet verified.
- `BLOCKED`: cannot be called ready without a decision or fix.

## Summary

Current recommendation after `NEST-228`:

`FOUNDER-READY CANDIDATE - scoped V1 is implementation-ready, but final human
smoke evidence is still required before declaring full v1 founder-ready`

The recent `NEST-210` through `NEST-219` wave materially improved
localization, shared contracts, error handling, offline sync, web daily-use
trust, mobile daily-loop entry, and settings support IA. The remaining blocker
is no longer broad implementation uncertainty; it is evidence and a few
classified release risks:

- parity has been re-audited from current code and `NEST-224` has closed the
  mobile Calendar event CRUD blocker,
- accessibility baseline has been improved by `NEST-226`; measured contrast
  and manual screen-reader/device smoke remain final-gate evidence,
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
- `NEST-236` localized Mobile Calendar event CRUD copy and validated mobile
  typecheck/export again.
- `NEST-231` remains a blocker for mobile authenticated API smoke evidence
  until the user chooses real mobile auth, a local smoke bridge, or a narrowed
  web-first V1 claim.

## Repository Truth

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Startup docs match real workspace layout and local run sequence | PASS | Earlier v1 recovery reports and current queue alignment in `mvp-next-commits.md` | Reconfirm during `NEST-223` |
| API, web, and mobile entry commands are documented without broken root commands | PASS | `v1_founder_ready_checklist_2026-04-26.md`; recent web/mobile commands ran directly in app folders | Reconfirm during final gate |
| Current execution truth reflected in task board and project state | PASS | `.codex/context/TASK_BOARD.md`, `.codex/context/PROJECT_STATE.md` updated through `NEST-219` | Continue updating per task |
| No known contract drift remains undocumented for critical paths | PASS | `NEST-214`, `NEST-215`, `NEST-216` hardened shared contracts; `NEST-233` removed repeated web route-local request casts | Keep monitoring during final gate |

## Backend Reliability

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| API feature, integration, and unit suites are green or triaged | PASS | `NEST-227`: Integration 11/75, Unit 20/60, Feature 215/1259 all passed | Keep as final gate evidence |
| Sync endpoints, controller responses, tests, and docs describe one contract | PARTIAL | `NEST-214`/`NEST-216` aligned shared client and sync retry semantics | Confirm endpoint behavior in parity/readiness review |
| Tenant isolation remains covered for critical module and integration behavior | PASS | `NEST-227` refreshed integration and feature suites including tenant isolation coverage | Keep as final gate evidence |
| Machine-readable API error envelopes stay intact for programmatic clients | PASS | `NEST-215` hardened shared error helpers and request error metadata | Keep contract checks in final gate |

## Web Product Closure

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Authenticated entry behavior deterministic across public/protected routes | PASS | Prior route guard work plus web validations in recent tasks | Include route smoke in final gate |
| Onboarding policy matches guard logic and user-visible flow | PASS | Prior onboarding/guard repair reports; no new drift found in this wave | Reconfirm during final gate |
| Dashboard and Planning support practical daily-use loop | PASS | `NEST-217` fixed Dashboard live-data trust and audited Planning | Include in `NEST-221` parity audit |
| Each core web module supports create/edit/review/delete where applicable | PARTIAL | Core routes are API-backed; broad route-local casts and legacy lower panels remain | Confirm outcome-by-outcome in `NEST-221` |
| Key user-facing text avoids mojibake, accidental mixed language, raw technical wording | PARTIAL | `NEST-209` through `NEST-213` improved core paths; `NEST-234` localized lower web route chrome/status copy and `NEST-236` localized Mobile Calendar CRUD | Continue per-screen mobile CRUD localization |
| `en` and `pl` localization visibly affect core v1 path | PARTIAL | Web shell/dashboard, lower web route chrome, mobile shell/settings, and Mobile Calendar CRUD now use shared localization | Continue mobile Tasks/Goals/Habits/Journal CRUD copy closure |

## Mobile Parity

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Mobile typecheck passes | PASS | Refreshed by `NEST-235` and `NEST-236`: `pnpm exec tsc --noEmit` passed in `apps/mobile` | Keep in final gate |
| Mobile build/export passes | PASS | Refreshed by `NEST-235` and `NEST-236`: `pnpm exec expo export --platform web` passed in `apps/mobile` | Keep in final gate |
| Mobile core modules are API-backed rather than placeholder-only | PARTIAL | Tasks/Habits/Goals/Journal are API-backed; Billing/Insights still use fallback snapshots when live fails | Confirm founder-critical module outcomes in `NEST-221` |
| Routines, life areas, settings essentials, and declared v1 behaviors reachable on mobile | PARTIAL | Settings shortcuts expose routines/life areas; modal exposes language/sync/notifications/Copilot | Verify reachability and friction in `NEST-221` |
| Parity is defended by outcome evidence, not only screenshots | PARTIAL | `NEST-221` recorded outcome parity for core CRUD/settings/sync; `NEST-224` added mobile Calendar event CRUD; `NEST-235` aligned navigation scope; `NEST-236` localized Mobile Calendar CRUD | `NEST-231` mobile authenticated API session evidence remains blocked |

## Cross-Surface Integrity

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Shared client contracts match backend reality for critical v1 flows | PASS | `NEST-214` shared CRUD contract audit and validations | Monitor route-local cast cleanup |
| Web and mobile map backend errors into user-safe recovery guidance | PASS | `NEST-209`, `NEST-215`, `NEST-216` | Verify user-facing recovery in `NEST-221` |
| Offline/manual sync feels intentional and understandable for founder-critical path | PASS | `NEST-216` retryability handling; `NEST-219` support map exposes sync recovery | Include manual sync path in parity audit |
| Core localization and formatting behavior consistent across web and mobile | PARTIAL | `NEST-211` to `NEST-213` covered shell/dashboard/mobile shell/settings; `NEST-234` and `NEST-236` added lower web route and Mobile Calendar CRUD coverage | Continue founder-critical mobile CRUD copy closure |

## Daily-Use Quality

| Line | Status | Evidence | Next Action |
| --- | --- | --- | --- |
| Repeated daily flows feel calm rather than admin-like | PARTIAL | Web Dashboard/Planning audited in `NEST-217`; mobile Tasks improved in `NEST-218` | Audit remaining mobile loops in `NEST-221` |
| Accessibility basics verified on web and key mobile interactions | PARTIAL | `NEST-222` recorded baseline; `NEST-226` added shared web focus-visible styling and explicit mobile roles/labels for repaired founder-critical controls | Refresh contrast and manual screen-reader/device smoke in `NEST-228` |
| Product usable without hidden setup knowledge from repository author | PARTIAL | Settings support map and docs improved; `NEST-225` removed provider connect from the V1 founder-ready claim | Confirm remaining setup assumptions in `NEST-228` |

## Blockers For Founder-Ready Claim

1. `PASS WITH SCOPE BOUNDARY`: provider connection production semantics.
   - Current state:
     `NEST-225` selected Option B and removed provider connect from the
     delivered V1 founder-ready claim. Production provider OAuth remains future
     scope.
   - Required resolution:
     none for V1 founder-ready, as long as the final gate keeps provider
     connect outside the release claim.

2. `PARTIAL`: post-repair web/mobile parity audit.
   - Required resolution:
     `NEST-221` and `NEST-224` are complete; `NEST-225` scoped provider
     connect out of V1 founder-ready.

3. `PARTIAL`: accessibility baseline.
   - Required resolution:
     `NEST-222` and `NEST-226` are complete; final gate should refresh
     contrast and manual screen-reader/device smoke evidence.

4. `PASS`: full backend/API validation freshness.
   - Required resolution:
     `NEST-227` completed API Integration, Unit, Feature, and security-control
     validation.

## Next Tasks

1. Run founder smoke: web/mobile UI, accessibility, and contrast evidence.
2. Keep provider connect outside V1 unless future production OAuth is
   implemented and verified.
