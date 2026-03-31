# NEST-159 Life-Management UX Critical Audit (2026-03-31)

## Goal Question

Primary question used for every screen and interaction:

`Czy ten widok pomaga, by użytkownik miał łatwiej zarządzać swoim życiem?`

## Sources of Truth

- Runtime UX evidence (click-by-click screenshots):
  `docs/ux_audit_evidence/2026-03-31/nest-159/artifact-index.md`
- Screenshot files + manifest:
  `docs/ux_audit_evidence/2026-03-31/nest-159/web/*`
- Stitch project baseline:
  `projects/11122321523690086751`
- Stitch web URL (canonical quick access for future iterations):
  `https://stitch.withgoogle.com/projects/11122321523690086751`

## Method

- Browser: Playwright, desktop viewport `1600x1000`.
- Walkthrough: complete web flow across visible user capabilities:
  home, tasks/lists auth + create, habits, routines, goals, targets,
  calendar, journal, insights, automations, billing, onboarding.
- Output: 27 screenshots, including success and failure states.

## Executive Verdict

Current web UI is calmer visually than previous versions, but still
`not sufficient` for practical life management.

- Positive: module split direction (`tasks/lists`, `habits`, `routines`,
  `goals`, `targets`) and lower visual noise.
- Blocking: critical flow instability in `Tasks + Lists`, many modules are
  read-only snapshots, and several action buttons are placeholders or
  operational controls that should be hidden from daily personal planning.

Life-management usability score (0-10): `4.5`

## Per-View Critical Assessment

### Home (`01-home-dashboard.png`)

What is good:
- IA entry is clearer than before.
- Main modules are visible and understandable.

What is wrong:
- Home does not provide a true "today cockpit" (next actions, overdue items,
  time-block conflicts, habit/routine due now).
- User must still jump screen-to-screen instead of being guided by one daily
  sequence.

Why this hurts life management:
- Life planning requires low-friction execution momentum, not module browsing.

How to fix:
- Replace "Core Modules list" with a `Today Focus Stack`:
  top 3 tasks, next time-bound item, one routine checkpoint, one habit check.
- Add one persistent CTA: `Quick Add` (task, list, event, habit log).

### Tasks + Lists (`02-06`)

What is good:
- Login and forms are in one place.
- Visual hierarchy is clean and calm.

What is wrong (critical):
- During task creation flow, UI falls back to signed-out state and form becomes
  disabled (`06-tasks-create-task-error.png`).
- Explicit API error exposed to user: `The per page field must not be greater than 100`.
- User intent ("add task") is blocked by technical validation details.

Why this hurts life management:
- The most important action in the app (capture task) is unstable.
- Trust drops immediately when a basic action fails.

How to fix:
- Enforce client-safe pagination (`per_page <= 100`) in all list/task refreshes.
- Never invalidate session on non-auth errors.
- Add optimistic create + inline recovery:
  `Task not saved -> Retry / Save local draft`.
- Keep `Add task` enabled only when requirement is unmet, but explain why
  directly under control (not as generic error panel).

### Habits / Routines / Goals / Targets (`07-10`)

What is good:
- Module boundaries are now explicit and understandable.

What is wrong:
- These views are static snapshots without primary creation/edit actions.
- No direct relation controls (for example link target -> goal, link routine ->
  calendar slot) exposed in UI.

Why this hurts life management:
- User cannot actively manage behavior loops; only observes placeholders.

How to fix:
- Add minimal CRUD per module:
  create, edit, archive, quick complete/log.
- Add linking controls:
  habit/routine -> calendar, target -> goal, task -> target.

### Calendar (`11`)

What is good:
- Conceptual intent is correct: aggregate timed entities.

What is wrong:
- Timeline is static sample data.
- Operational cards (`Conflict Queue`, `Integration Health`, `Provider Connections`)
  appear in main personal planning surface and stay in loading/error mode.

Why this hurts life management:
- Daily planning screen becomes operational dashboard noise.

How to fix:
- Keep calendar user-facing by default:
  create/edit event, drag/reschedule, assign entity link.
- Move integration/ops cards to separate settings/diagnostics route.
- Show real "Today / This Week" entity timeline with filters.

### Journal (`12`)

What is good:
- Calm tone and low cognitive load.

What is wrong:
- No input actions for journaling in the main view.
- Reflection flow is not actionable (no quick entry CTA).

Why this hurts life management:
- Reflection loop must be 30-60 second action, not read-only preview.

How to fix:
- Add `Quick Entry` input with mood + tags + save.
- Add prompt templates (`What went well`, `What blocked me`, `What next`).

### Insights (`13-14`)

What is good:
- Data sections are understandable.

What is wrong:
- `Refresh Trends` and `Export Snapshot` clicks produce no user-visible effect.
- API/loading/errors are foregrounded more than actionable recommendations.

Why this hurts life management:
- Insights should guide decisions, not feel like system diagnostics.

How to fix:
- Convert to action-centric cards:
  `Do this today`, `Adjust this target`, `Reschedule this block`.
- Disable or hide inactive actions until implemented.

### Automations (`15-17`)

What is good:
- Basic create and run controls exist.

What is wrong:
- Builder semantics are technical (trigger payload/action type) instead of
  life-language templates.
- Run feedback is weak; inspect/replay loop is not obvious in flow.

Why this hurts life management:
- Personal user needs intent templates, not raw automation primitives.

How to fix:
- Add template library:
  "When task done -> add evening reflection reminder", etc.
- Show action impact preview before save.
- Add post-run human summary card.

### Billing (`18-23`)

What is good:
- Action buttons exist and state changes are visible.

What is wrong:
- Billing lifecycle controls are mixed into core planning IA and look like
  primary product actions.
- Multiple actions produce `HTTP 422` while still exposing internal detail.

Why this hurts life management:
- Billing is peripheral for daily planning and adds anxiety/noise.

How to fix:
- Move billing out of primary navigation into settings/account.
- Replace raw HTTP error copy with plain-language recovery guidance.

### Onboarding (`24-25`)

What is good:
- Minimal and focused.
- Completion feedback is clear.

What is wrong:
- It appears with full main navigation shell, which weakens first-run focus.

Why this hurts life management:
- Onboarding should reduce decision load and prevent context switching.

How to fix:
- Use isolated onboarding shell without full module nav.
- Keep one goal: identity + language + first useful action.

## Critical Issues to Fix First (P0)

1. Task creation instability and pagination validation leak in Tasks+Lists.
2. Read-only placeholder modules missing core create/edit actions.
3. Calendar polluted by ops/integration panels in primary planning surface.
4. Non-functional action buttons (Insights, other placeholders) visible to user.

## Iteration Plan (UX-First, Execution-Ready)

### Iteration 1 - Trust Recovery (P0)

- Stabilize Tasks+Lists create flow and session behavior.
- Replace technical errors with user-language errors + retry actions.
- Remove/hide buttons that are not actually functional.

### Iteration 2 - Daily Core Loop (P0/P1)

- Build true daily command center on Home.
- Add real Calendar CRUD + time-based aggregation from tasks/habits/routines.
- Add quick add everywhere (single interaction model).

### Iteration 3 - Behavioral Modules (P1)

- Add CRUD + quick interactions for habits/routines/goals/targets/journal.
- Add cross-module linking UX and dependency visibility.

### Iteration 4 - Stitch Parity Refinement (P1/P2)

- Align with active Stitch screens by flow, not only by color/style.
- Re-run screenshot parity with task-based acceptance criteria.

## Conclusion

The project now has a cleaner visual baseline, but from a life-management
perspective it is still in transitional state.

The next design/execution focus must shift from `module snapshots` to
`daily action reliability`:

- capture fast,
- decide fast,
- execute fast,
- reflect fast,

without exposing operational complexity to end users.
