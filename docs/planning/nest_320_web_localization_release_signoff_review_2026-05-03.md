# NEST-320 Web Localization Completeness Review And Release Sign-Off Plan

Date: 2026-05-03
Owner: Execution Agent
Iteration: 320
Operation mode: TESTER
Stage: verification
Status: DONE

## Goal

Verify whether the web-first V1 path can be signed off after the latest UX,
accessibility, contrast, and smoke-test wave, with specific attention to EN/PL
localization completeness.

## Scope

- Web source: `apps/web/src/app`, `apps/web/src/components`,
  `apps/web/src/lib/ui-language.ts`
- Shared localization: `packages/shared-types/src/localization.js`
- Release truth docs:
  - `docs/planning/v1_readiness_matrix_2026-05-01.md`
  - `docs/planning/v1_founder_ready_checklist_2026-04-26.md`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`

## Process Self-Audit

- [x] All seven autonomous loop steps are represented.
- [x] Exactly one priority task was selected.
- [x] Operation mode matches iteration 320 (`TESTER`).
- [x] Architecture source-of-truth constraint reviewed: localization baseline
  is `en` and `pl`, and mobile delivery is V2 after the 2026-05-02 decision.
- [x] This task stayed in review/sign-off planning scope; broad localization
  implementation is queued separately.

## Audit Method

Static source inspection was run against web `.tsx` and `.ts` files for:

- direct JSX text and panel titles,
- placeholders and aria labels,
- direct `toLocaleDateString`, `toLocaleTimeString`, or `toLocaleString`,
- existing `translate(...)` usage.

The scan intentionally treated product names, provider names, route names, and
API enum values as review items rather than automatic defects.

## Findings

The release gate cannot honestly move to full `v1 founder-ready` yet. The
remaining blocker is narrow but real: the web-first V1 path still contains a
large amount of route-local English UI copy outside the shared EN/PL dictionary.

Largest route-local copy concentrations found:

| Surface | Static direct-copy hits | `translate(...)` usage | Risk |
| --- | ---: | ---: | --- |
| `apps/web/src/app/tasks/page.tsx` | 288 | 0 | Planning is founder-critical and still mostly hardcoded. |
| `apps/web/src/app/calendar/page.tsx` | 102 | 0 | Calendar has hardcoded event/action labels and one locale-default date format. |
| `apps/web/src/app/journal/page.tsx` | 82 | 0 | Journal composer and reflection flow still use route-local English copy. |
| `apps/web/src/app/settings/page.tsx` | 52 | 0 | Settings language UI exists, but much supporting copy is still hardcoded. |
| `apps/web/src/components/workspace-primitives.tsx` | 50 | 0 | Shared dashboard primitives still contain English labels used in canonical UI. |
| `apps/web/src/app/habits/page.tsx` | 28 | 0 | Smaller but still visible hardcoded form/library copy. |
| `apps/web/src/app/routines/page.tsx` | 17 | 0 | Smaller but still visible hardcoded form/library copy. |
| `apps/web/src/app/life-areas/page.tsx` | 17 | 0 | Smaller but still visible hardcoded form/library copy. |

Positive evidence:

- Public auth and onboarding already use shared localization heavily.
- Workspace shell navigation, dashboard shell labels, Automations, Billing, and
  Insights have shared EN/PL coverage from earlier slices.
- `NEST-319` closed deterministic primary/action contrast and keyboard
  movement evidence.
- `NEST-310` through `NEST-317` closed the main web action-intent and
  responsive usability gaps.

## Release Sign-Off Decision

Current release status:

`WEB-FIRST FOUNDER-READY CANDIDATE - NOT FINAL SIGNED OFF`

Reason:

- Backend, web UX action flows, production smoke, keyboard movement, and
  deterministic primary/action contrast have current evidence.
- Localization completeness is still `PARTIAL` for founder-critical web routes.
- Final sign-off should wait until Planning, Calendar, Journal, Settings, and
  shared dashboard primitives visibly switch between `en` and `pl` without
  mixed accidental English on core UI controls.

## Next Implementation Plan

Create one narrow implementation slice:

`NEST-321 Web core localization closure for founder-critical routes`

Scope for `NEST-321`:

- Add shared EN/PL dictionary keys for Planning, Calendar, Journal, Settings,
  and shared dashboard primitives.
- Replace route-local hardcoded control labels, panel titles, placeholders,
  empty states, primary action copy, and core aria labels.
- Use `resolveLocale(uiLanguage)` or `formatLocalizedDateTime(...)` for visible
  date/time formatting on those routes.
- Preserve backend contracts and route-intent behavior from `NEST-311` through
  `NEST-314`.
- Verify with lint, typecheck, build, unit tests, and a static localization scan
  showing materially reduced route-local copy on the core web path.

After `NEST-321`, run a final release sign-off task:

`NEST-322 Web-first V1 release sign-off gate`

Scope for `NEST-322`:

- Rerun final web smoke on desktop and mobile.
- Verify EN/PL visible switching on founder-critical routes.
- Confirm provider connect remains outside the V1 claim.
- Mark readiness matrix and founder checklist as final signed-off only if no
  release-critical blocker remains.

## Validation Evidence

- Static localization scan completed with PowerShell source inspection.
- Reviewed shared localization dictionary and web language persistence helper.
- Updated readiness docs and execution context to keep release truth aligned.

Commands used:

```powershell
Get-ChildItem -Path apps\web\src\app,apps\web\src\components -Recurse -File -Include *.tsx |
  Select-String -Pattern 'placeholder="','aria-label="','title="','<h2>','<h3>','<h4>','<strong>','<small>','<p>','<span>','<option' -SimpleMatch

Get-ChildItem -Path apps\web\src -Recurse -File -Include *.tsx,*.ts |
  Select-String -Pattern 'translate\('
```

## Result Report

- Task summary: web V1 is close, but release sign-off remains blocked by
  founder-critical route localization completeness.
- Files changed: planning/context docs only.
- How tested: static source audit and documentation consistency review.
- What is incomplete: implementation of the remaining shared EN/PL keys and
  route replacements.
- Next steps: execute `NEST-321`, then run `NEST-322` final sign-off.

## Autonomous Loop Evidence

### 1. Analyze Current State

The current product has strong backend and web UX evidence, but release docs
still had inconsistent localization truth.

### 2. Select One Priority Task

Selected `NEST-320` because it is the explicit READY gate after accessibility
and contrast closure.

### 3. Plan Implementation

Keep this iteration as review/sign-off planning, then queue a narrow
implementation slice for localization.

### 4. Execute Implementation

Ran static source scans and updated release truth docs.

### 5. Verify and Test

Verified that remaining hardcoded copy is concentrated in identifiable web
routes and shared primitives.

### 6. Self-Review

No runtime code was changed. The simpler and safer route is to queue one
explicit localization closure slice instead of hiding the blocker in a release
sign-off.

### 7. Update Documentation and Knowledge

Updated task board, project state, readiness matrix, founder checklist, and
this report.
