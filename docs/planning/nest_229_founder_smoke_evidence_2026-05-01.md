# Task

## Header

- ID: NEST-229
- Title: Run founder smoke evidence for scoped V1 candidate
- Task Type: verification
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-228
- Priority: P0
- Coverage Ledger Rows:
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Context

`NEST-228` reran the founder-ready gate and found that scoped V1 is an
implementation-ready candidate. The remaining blocker is final smoke evidence,
not a known P0 implementation defect.

## Goal

Verify the scoped V1 candidate through a narrow real-surface smoke pass before
declaring full `v1 founder-ready`.

## Constraints

- use existing app surfaces and real API/client paths
- preserve tenancy, localization, actor boundaries, and web/mobile parity
- do not add workaround-only paths or fake provider OAuth
- keep provider connect outside the V1 claim
- record failures as fix tasks rather than widening scope

## Definition of Done

- [x] web founder smoke is run and recorded
- [x] mobile founder smoke is run and recorded
- [x] accessibility smoke is run and recorded
- [x] contrast measurement is run or explicitly blocked by tooling
- [x] any failure is converted into a narrow follow-up task
- [x] board and project state are updated with evidence

## Forbidden

- declaring full founder-ready without smoke evidence
- using `manual-token-*` provider connect as production behavior
- hiding failures as polish
- introducing a new system during verification

## Planned Smoke Matrix

| Surface | Checks |
| --- | --- |
| Web | authenticated navigation, Calendar create/edit/delete, settings language switch, offline/manual sync recovery, provider health/revoke visibility |
| Mobile | tab navigation, Calendar create/edit/delete, force sync, settings language switch, offline/manual sync recovery, provider health/revoke visibility |
| Accessibility | keyboard focus on web, labels on mobile key actions, no actionable-looking disabled controls without explanation |
| Contrast | repaired founder-critical surfaces meet the current visual quality bar or failures are listed explicitly |

## Expected Output

A verification report with pass/fail evidence and a final recommendation:
`v1 founder-ready`, `candidate with smoke failures`, or `blocked with required
fixes`.

## Smoke Result

`BLOCKED WITH REQUIRED FIXES`

The scoped V1 implementation remains a candidate, but the local founder smoke
cannot pass yet because real browser UI calls to the API are blocked by local
CORS defaults, and mobile-web does not have an authenticated API session path.

## Evidence

- Browser automation note:
  the in-app Browser plugin could not be used because the available Node REPL
  runtime resolved to Node `v22.13.0`, while the plugin requires `>=22.22.0`.
  The smoke used local Playwright as a fallback.
- Local services:
  API served on `http://127.0.0.1:9000`, web dev server on
  `http://localhost:9001`, and mobile web export served from
  `apps/mobile/dist` on `http://127.0.0.1:9002`.
- Automated route smoke:
  `pnpm test:smoke` in `apps/web` passed.
  `pnpm test:smoke` in `apps/mobile` passed; Expo export printed non-blocking
  generated-artifact `ENOENT` noise after success.
- Web browser smoke:
  authenticated Dashboard navigation passed.
  Calendar route rendered and `Calendar tools` exposed the add-event panel.
  Calendar create through the browser UI failed because browser fetches from
  `http://127.0.0.1:9001` to `http://127.0.0.1:9000/api/v1/...` were blocked
  by CORS preflight: no `Access-Control-Allow-Origin` header.
- Mobile browser smoke:
  mobile web export route rendering was started from the generated static
  export, but authenticated API behavior cannot be proven because the mobile
  `nestApiClient` has no token source and local API CORS is currently blocked.
- Accessibility smoke:
  web focus-visible cannot be considered final because the real CRUD flow is
  blocked before the end-to-end UI smoke completes.
- Contrast measurement:
  blocked behind the failed real-surface smoke; measuring contrast before the
  real UI path is usable would overstate readiness.

## Follow-Up Tasks

1. `NEST-230` Fix local founder-smoke CORS defaults for web/mobile dev
   origins.
2. `NEST-231` Decide and implement the mobile authenticated API session path
   before claiming mobile real-API founder smoke.

## Final Recommendation

Do not declare full `v1 founder-ready` yet. The candidate moved past the earlier
P0 implementation blockers, but the real browser smoke exposed runtime
configuration/session blockers that must be fixed and rerun.
