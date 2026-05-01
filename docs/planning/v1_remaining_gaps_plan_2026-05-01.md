# V1 Remaining Gaps Plan

Date: 2026-05-01

## Purpose

This plan turns the remaining `v1 founder-ready` gaps into small, ordered,
evidence-backed execution slices. It does not introduce new product scope.

Primary queue:

- `NEST-218` mobile daily-loop ergonomics (completed 2026-05-01)
- `NEST-219` settings and support IA (completed 2026-05-01)
- `NEST-220` refreshed readiness matrix (completed 2026-05-01)
- `NEST-221` repaired web/mobile parity audit (completed 2026-05-01)
- `NEST-222` accessibility baseline (completed 2026-05-01)
- `NEST-223` founder-ready blocker review (completed 2026-05-01)

## Current Gap Summary

### P0 - Trust And Reachability

1. Mobile daily-loop screens are API-backed, but several still read like dense
   CRUD surfaces rather than calm daily-use loops.
   - Evidence:
     `apps/mobile/app/(tabs)/index.tsx`,
     `apps/mobile/app/(tabs)/goals.tsx`,
     `apps/mobile/app/(tabs)/habits.tsx`,
     `apps/mobile/app/(tabs)/journal.tsx`
   - Risk:
     founder can technically create/edit data, but repeated mobile use still
     feels more administrative than intentional.

2. Mobile Settings exposes essential support behavior through `Settings + more`
   and `/modal`, but the IA is too broad for founder-critical recovery.
   - Evidence:
     `apps/mobile/app/(tabs)/settings.tsx`,
     `apps/mobile/app/modal.tsx`
   - Risk:
     language, sync, notification, Copilot, and support controls compete in one
     long modal, making urgent recovery harder to find.

3. Calendar mobile connection flow still writes manual token strings for
   provider connection setup.
   - Evidence:
     `apps/mobile/app/(tabs)/calendar.tsx`
   - Risk:
     this may be acceptable as a local integration harness, but it must be
     explicitly classified before founder-ready; otherwise it looks like a
     production OAuth substitute.

### P1 - Evidence And Parity

4. Founder-ready checklist is stale after `NEST-210` through `NEST-217`.
   - Evidence:
     `docs/planning/v1_founder_ready_checklist_2026-04-26.md` still marks
     several now-improved cross-surface items as `OPEN`.
   - Risk:
     release confidence is lower than the repo's actual implementation state.

5. Web/mobile parity needs a fresh outcome audit after the latest localization,
   contract, sync, and daily-use fixes.
   - Evidence:
     `NEST-211` through `NEST-217` changed shared language, error, sync, and
     dashboard behavior.
   - Risk:
     parity could be claimed from old screenshots or old assumptions instead of
     current outcomes.

6. Accessibility baseline is not yet recorded for repaired founder-critical
   web and mobile surfaces.
   - Evidence:
     recent task reports note accessibility checks as not run or code-review
     only.
   - Risk:
     screens may be visually polished but still fail keyboard, focus, label,
     contrast, or touch-target basics.

### P2 - Cleanup And Documentation Quality

7. Route-local request casts remain in several web/mobile routes despite the
   shared client being hardened.
   - Evidence:
     `nestApiClient.request as unknown` in multiple web routes and mobile
     planning routes.
   - Risk:
     this is not immediately founder-blocking, but it keeps contract drift
     easier to reintroduce.

8. Some fallback/showcase language remains useful for empty-state quality but
   must be classified carefully in the final readiness review.
   - Evidence:
     dashboard/planning/calendar/journal showcase fallback paths.
   - Risk:
     fallback content is acceptable when it protects visual quality, but not if
     it hides unavailable live behavior.

## Execution Plan

### NEST-218 - Re-audit mobile daily-loop ergonomics

Status: done 2026-05-01.

Stage: verification.

Goal:
Make mobile daily-loop quality evidence explicit and close the smallest
founder-critical ergonomics issue found on the main tab loop.

Scope:

- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/habits.tsx`
- `apps/mobile/app/(tabs)/goals.tsx`
- `apps/mobile/app/(tabs)/journal.tsx`
- `apps/mobile/app/(tabs)/calendar.tsx`
- `apps/mobile/components/mvp/ModuleScreen.tsx`
- mobile canonical notes in `docs/ux/design-memory.md`

Acceptance criteria:

- Mobile Tasks, Habits, Goals, Journal, Calendar are reviewed for:
  loading, empty, error, success, primary action clarity, recovery clarity,
  touch ergonomics, and parity with the web mental model.
- Exactly one narrow fix is implemented only if it is a clear repeated-use
  blocker.
- If no safe implementation fix is found, publish a no-code audit with ranked
  follow-up tasks.
- Validation:
  `pnpm exec tsc --noEmit`,
  `pnpm test:unit`,
  `pnpm exec expo export --platform web`.

Recommended first fix candidate:
Reduce mobile main Tasks screen admin density by promoting one "today / next
task" daily-use band above list creation and filters, while keeping existing
CRUD available below.

Result:
Implemented in `apps/mobile/app/(tabs)/index.tsx` as a real-data `Daily focus`
band above mobile Tasks CRUD controls. Validation passed:
mobile typecheck, unit contract, and Expo web export.

### NEST-219 - Tighten settings and support IA for founder-critical actions only

Status: done 2026-05-01.

Stage: verification.

Goal:
Make mobile/web settings recovery paths easier to find without widening support
scope.

Scope:

- `apps/mobile/app/(tabs)/settings.tsx`
- `apps/mobile/app/modal.tsx`
- `apps/web/src/app/settings/page.tsx`
- `apps/web/src/components/offline-sync-card.tsx`
- shared localization only if visible labels change

Acceptance criteria:

- Founder-critical settings actions are grouped by job:
  language, account/session, sync recovery, notifications, Copilot/support.
- Mobile `/modal` no longer feels like one undifferentiated utility drawer.
- Billing/additional surfaces are visibly secondary unless the founder-ready
  checklist requires them.
- Validation:
  web typecheck/lint/build as touched,
  mobile typecheck/export/unit-contract as touched.

Decision point:
Classify `manual-token-*` provider connection behavior as either approved local
test harness, blocked production issue, or replacement candidate.

Result:
Mobile advanced settings now opens with a job-based support map and stronger
section framing. `manual-token-*` provider connection behavior is classified as
a local integration harness only and must not be counted as production-ready
OAuth in `NEST-220`/`NEST-223`.

### NEST-220 - Produce refreshed V1 readiness matrix

Stage: verification.

Status: done 2026-05-01.

Goal:
Replace stale `OPEN`/`PASS` assumptions with a current evidence matrix.

Scope:

- `docs/planning/v1_founder_ready_checklist_2026-04-26.md`
- all reports `NEST-207` through `NEST-219`
- validation commands from API, web, mobile, contracts

Acceptance criteria:

- Each founder-ready line is marked `PASS`, `OPEN`, `PARTIAL`, or `BLOCKED`.
- Every non-`PASS` line has one owner task and one evidence requirement.
- No implementation changes are mixed into this slice.
- Validation:
  docs-only logical validation plus targeted command list for missing evidence.

Result:
Published `docs/planning/v1_readiness_matrix_2026-05-01.md`. Current readiness
status is `PARTIAL - not founder-ready yet`. Provider connection production
semantics, parity outcome evidence, accessibility baseline evidence, and final
API/security validation freshness remain explicit blockers or open evidence
items for `NEST-221` through `NEST-223`.

### NEST-221 - Run repaired web/mobile parity audit

Stage: verification.

Status: done 2026-05-01.

Goal:
Confirm parity by outcome, not screenshots.

Scope:

- Web:
  Dashboard, Planning, Calendar, Journal, Settings
- Mobile:
  Tasks, Habits, Goals, Journal, Calendar, Settings, Advanced modal
- Shared:
  localization, error recovery, sync recovery, core CRUD reachability

Acceptance criteria:

- For each core outcome, record:
  web status, mobile status, evidence, gap, next task if needed.
- Outcomes:
  plan day, create task/list, manage habits/routines, manage goals/targets,
  add journal/life area, inspect calendar/sync, change language, recover from
  sync/API errors.
- Validation:
  no-code audit unless a blocker prevents evidence collection.

Result:
Published `docs/planning/nest_221_web_mobile_parity_audit_2026-05-01.md`.
Tasks/Lists, Habits/Routines, Goals/Targets, Journal/Life Areas, language
switching, sync recovery, and settings reachability are materially
outcome-equivalent. Mobile Calendar remains partial because event CRUD is not
available and `ModuleScreen` quick actions are presentational. Provider
connection production semantics remain blocked by the `manual-token-*`
integration harness.

### NEST-222 - Run accessibility baseline

Stage: verification.

Status: done 2026-05-01.

Goal:
Capture basic accessibility evidence for repaired founder-critical surfaces.

Scope:

- Web keyboard/focus/labels/contrast:
  Dashboard, Planning, Calendar, Journal, Settings
- Mobile touch target/readability/state announcement review:
  main tabs plus Settings/modal

Acceptance criteria:

- Keyboard-only web smoke is recorded for primary actions and navigation.
- Form labels and button names are reviewed for critical forms.
- Mobile touch target and text overflow risks are recorded.
- Any blocking issue gets a narrow follow-up task.
- Validation:
  web build/lint as needed, mobile export as needed, manual checklist evidence.

Result:
Published `docs/planning/nest_222_accessibility_baseline_2026-05-01.md`. Web
label/button coverage is close but lacks an explicit shared focus-visible
standard. Mobile remains partial because custom Pressables and placeholder-heavy
TextInputs do not yet carry explicit accessibility roles/labels. Contrast
measurement is still open. Mobile Calendar quick actions remain a blocker
because they look actionable but have no handlers.

### NEST-223 - Founder-ready blocker review and launch recommendation

Stage: release.

Status: done 2026-05-01.

Goal:
Decide whether Nest is founder-ready, blocked, or ready with explicit waivers.

Scope:

- `docs/planning/v1_founder_ready_checklist_2026-04-26.md`
- `DEFINITION_OF_DONE.md`
- `DEPLOYMENT_GATE.md`
- `INTEGRATION_CHECKLIST.md`
- outputs from `NEST-220` through `NEST-222`

Acceptance criteria:

- Final blocker list is ranked P0/P1/P2.
- Each blocker has:
  owner, evidence, required fix or waiver, validation command.
- Launch recommendation is one of:
  `READY`, `READY_WITH_WAIVERS`, `BLOCKED`.
- No unresolved architecture mismatch is hidden.

Result:
Published
`docs/planning/nest_223_founder_ready_blocker_review_2026-05-01.md`.
Recommendation is `BLOCKED - do not call Nest v1 founder-ready yet`. Required
follow-ups are `NEST-224` mobile Calendar event CRUD parity, `NEST-225`
provider production semantics, `NEST-226` accessibility baseline closure,
`NEST-227` API/security validation freshness, and `NEST-228` final gate rerun.

## Recommended Order

1. `NEST-218`: mobile daily-loop ergonomics.
2. `NEST-219`: settings/support IA and manual provider-token classification.
3. `NEST-220`: readiness matrix.
4. `NEST-221`: parity audit.
5. `NEST-222`: accessibility baseline.
6. `NEST-223`: final blocker review.

Do not swap `NEST-220` before `NEST-218/219`; the matrix would otherwise
record known, near-term mobile gaps as release blockers before the planned
repair passes run.

## Stop Conditions

- If a mobile surface still depends on demo-only or mock-only data for a
  declared founder-critical behavior, stop and create a blocker task.
- If provider connection behavior requires real OAuth rather than the current
  local token harness, stop and ask for an explicit product/architecture
  decision.
- If accessibility or parity evidence cannot be collected reproducibly, mark
  the relevant readiness row `BLOCKED`, not `PASS`.
