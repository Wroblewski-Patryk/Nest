# Nest Web UX/UI Workflow Audit And Canonical Improvement Plan

Date: 2026-05-02
Stage: analysis + planning
Scope: web app only

## Task Contract

### Context

The user reported that the app still has light unfinished UX/UI issues and that
creating a task is not obvious enough from the Dashboard/canonical web
experience.

Reviewed sources:

- `docs/ux/nest_canonical_view_architecture_2026-05-02.md`
- `docs/ux/screen-quality-checklist.md`
- `docs/ux/experience-quality-bar.md`
- `docs/ux/anti-patterns.md`
- `docs/ux/design-memory.md`
- `docs/ux/production_showcase_error_state_rule_2026-05-02.md`
- all web `page.tsx` route files under `apps/web/src/app`
- `apps/web/src/components/workspace-shell.tsx`

### Goal

Turn the current web UX/UI gaps into a broad, actionable improvement plan that
makes the product more functional, more canonical, and easier to use,
especially for creating tasks and moving through the five core pillars.

### Constraints

- Analysis/planning only in this slice.
- Preserve the five canonical pillars: Dashboard, Planning, Calendar, Journal,
  Settings.
- Do not re-expose Tasks, Habits, Routines, Goals, Targets, or Life Areas as
  equal top-level navigation peers.
- Preserve existing API-backed behavior.
- Avoid fake/demo interactions in production paths.

### Definition Of Done

- All web pages are scanned.
- Core UX/UI gaps are recorded by severity and route.
- A task plan exists with dependencies, acceptance criteria, and validation
  expectations.
- Task board and project state reference the plan.

### Forbidden

- Do not implement a new UI system before planning the workflow model.
- Do not hide primary actions behind hover-only, collapsed, or offscreen UI.
- Do not let canonical beauty reduce functional clarity.

## Executive Summary

The web app is visually much closer to the canonical Nest direction than before,
but the action model is not yet canonical. The biggest product issue is that
creation is fragmented: Dashboard has `Add task`, Planning has Quick add, a
workspace action button, an inline composer, `Today Focus`, and hidden setup
forms, but there is no single reliable "create task" path that stays obvious
from Dashboard to completion.

The current UI is strongest as a showcase and weakest as a daily operating
tool. The next wave should make Nest feel like a calm command center where the
primary action is always obvious, instead of a beautiful screen that requires
the user to hunt for the working form.

## Static Route Scan

| Route | Main issue |
| --- | --- |
| `/dashboard` | Beautiful canonical layout, but task creation links only navigate to Planning; they do not open a task composer or preserve intent. |
| `/tasks` | Planning is powerful but overloaded. There are multiple task/list/goal/target creation paths, several repeated CTAs, and some forms are below the fold or in secondary/collapsible areas. |
| `/calendar` | Quick add links to `#calendar-add-event`, but the form is inside a collapsed details panel, so the action can feel broken or invisible. |
| `/journal` | Composer is stronger than most routes, but life-area management is hidden and native confirm dialogs still break the premium tone. |
| `/habits` | Functional CRUD page, but visually older and not folded into the canonical Dashboard/Planning action model. |
| `/routines` | Functional CRUD page, visually older, and disconnected from Calendar/Dashboard routine scheduling intent. |
| `/life-areas` | Functional CRUD page, but overlaps conceptually with Journal/Balance and feels like an exposed lower-level module. |
| `/goals`, `/targets` | Redirect into Planning tabs, which is architecturally correct but needs clearer Planning tab state and create intent. |
| `/automations` | Operationally useful, not canonical/premium; should be treated as advanced Settings surface unless release-critical. |
| `/billing` | Operational/admin tone; acceptable for Settings, but not visually integrated with premium shell. |
| `/insights` | Useful but optional; currently more dashboard analytics than calm interpretation. |
| `/settings` | Large and dense; contains account, delegated credentials, AI agents, preferences, and revocation flows with native confirms. |
| `/assistant` | Optional surface, not primary release blocker. |
| `/auth`, `/onboarding`, `/` | Functional, but visual quality is behind the canonical workspace. |

## Core Findings

### P0 Finding: Create Task Is Not A Coherent Journey

Evidence:

- Dashboard `Add task` and `New task` point to `/tasks`.
- Planning can open `setTaskComposerListId(UNASSIGNED_COLUMN_ID)`, but that
  state is local to `/tasks` and cannot be triggered from Dashboard via URL.
- Planning also has `+ Add task`, `Add task now`, Quick add Task, an inline
  task composer, and older setup sections.
- The composer submit says `Save card`, which is less clear than `Create task`.

Impact:

The user knows they want a task, but the UI makes them first understand the
Planning page structure. This violates the 5-second primary action rule.

### P0 Finding: Canonical Beauty Sometimes Competes With Utility

Dashboard, Planning, Calendar, and Journal have strong visual direction, but
some operational controls are too quiet or too far from the action they start.
The result is pretty but not always self-explanatory.

Examples:

- Dashboard right-rail Quick add can be missed.
- Planning workspace action sits inside a dense screen with multiple competing
  action patterns.
- Calendar Quick add points into a hidden panel.

### P1 Finding: Route-Local Patterns Are Fragmented

The app uses many local patterns for creation, editing, deletion, and status:

- native `window.confirm` appears across Calendar, Habits, Journal, Life Areas,
  Routines, Settings, and Planning.
- forms use different labels and placement rules.
- some pages use `btn-primary`, some `pill-link`, some `dashboard-inline-action`,
  and some right-rail tiles.

This makes the app feel less finished than the canonical screens suggest.

### P1 Finding: Lower-Level Module Pages Still Feel Like Older CRUD

Habits, Routines, Life Areas, Automations, Billing, Insights, and parts of
Settings are functional but do not yet inherit the same premium action-first
model. That is acceptable for advanced surfaces, but not for daily core actions.

### P1 Finding: Empty/Error/Success State Model Is Incomplete

Dashboard, Calendar, and Journal now avoid hiding API failures with showcase
states. Planning still needs a separate review because its showcase branch mixes
preview behavior with real task management. Several CRUD pages have error text
but not designed empty/success states.

## Recommended Product Principle

Every core pillar needs one obvious primary action:

- Dashboard: `Capture task`
- Planning: `Create task`
- Calendar: `Add event`
- Journal: `Write reflection`
- Settings: `Save changes`

Secondary creation actions can exist, but they must not compete with or obscure
the primary action.

## Planned Tasks

### NEST-310 Web UX/UI Workflow Audit And Canonical Improvement Plan

- Priority: P0
- Status: DONE
- Stage: planning
- Goal: capture this audit and convert it into actionable web UX/UI tasks.
- Acceptance criteria:
  - route scan exists
  - primary workflow gaps are identified
  - task board contains follow-up implementation slices

### NEST-311 Unified Create Intent System

- Priority: P0
- Status: DONE
- Stage: implementation
- Goal: make creation flows addressable from any page without forcing users to
  hunt for the right form.
- Scope:
  - `apps/web/src/app/dashboard/page.tsx`
  - `apps/web/src/app/tasks/page.tsx`
  - `apps/web/src/app/calendar/page.tsx`
  - `apps/web/src/app/journal/page.tsx`
  - shared helper or URL convention if needed
- Implementation plan:
  1. Define URL intents such as `/tasks?action=create-task`,
     `/calendar?action=create-event`, `/journal?action=create-entry`.
  2. Make Dashboard Quick add and panel actions use those URLs.
  3. Make each destination open/focus the correct composer immediately.
  4. Rename ambiguous submit labels such as `Save card` to task-specific copy.
  5. Add focus/scroll behavior and accessible heading/announcement.
- Acceptance criteria:
  - From Dashboard, clicking `Add task` opens Planning with the task composer
    visible and focused.
  - From Dashboard, `Time block` opens Calendar with event composer visible.
  - From Dashboard, `Journal entry` opens Journal composer visible.
  - No creation path lands on a page where the user must guess the next click.
- Result:
  - Dashboard task actions now use `/tasks?action=create-task`.
  - Dashboard time actions now use `/calendar?action=create-event`.
  - Dashboard journal actions now use `/journal?action=create-entry`.
  - Planning, Calendar, and Journal consume those intents by scrolling to and
    focusing the matching composer.
  - Planning task submit copy now reads `Create task` instead of `Save card`.
- Verification:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
  - `pnpm build`
  - `pnpm test:unit`
  - `git diff --check` passed with CRLF warnings only.

### NEST-312 Dashboard Action Clarity Pass

- Priority: P0
- Status: DONE
- Depends on: NEST-311
- Stage: implementation
- Goal: keep the canonical Dashboard beautiful while making the next action
  impossible to miss.
- Scope:
  - Dashboard primary board
  - right rail Quick add
  - task/habit panel action links
  - mobile Dashboard order
- Implementation plan:
  1. Promote `Capture task` to a primary code-native action near `Now focus`.
  2. Keep right rail Quick add, but make it supportive rather than the only
     obvious creation path.
  3. Make task panel empty state include a direct create action.
  4. Ensure mobile shows Quick add immediately after focus, per canonical docs.
- Acceptance criteria:
  - A new user can identify task creation within 5 seconds.
  - Desktop and mobile both expose the same primary action.
  - Dashboard remains visually close to the approved canonical reference.
- Result:
  - Added a visible `Capture task` secondary action to the canonical
    Dashboard focus card, directly beside `Start focus session`.
  - Kept the action routed through `/tasks?action=create-task`, so it uses the
    unified composer-opening behavior from `NEST-311`.
  - Changed the task panel action language from generic `Add task` fallback to
    `Capture task`.
  - Preserved the existing canonical board layout and mobile Quick add order.

### NEST-313 Planning Workspace Simplification

- Priority: P0
- Status: DONE
- Depends on: NEST-311
- Stage: implementation
- Goal: make Planning the place where tasks, lists, goals, and targets are
  created and related without overwhelming the user.
- Scope:
  - `/tasks` Planning page
  - planning composer
  - Planning tabs
  - older setup/filter sections
- Implementation plan:
  1. Keep one primary composer zone per active tab.
  2. Remove or hide duplicate `Add task now`/secondary setup areas when the
     canonical composer is active.
  3. Change `Save card` to `Create task`.
  4. Keep `Goal -> Target -> List -> Task` relationships visible but not
     mandatory.
  5. Convert board tools into a compact toolbar instead of a competing panel.
- Acceptance criteria:
  - One primary create action per tab.
  - No duplicate visible task composers.
  - Planning first viewport answers: what am I planning, what can I create, and
    where does it belong?
- Result:
  - The URL intent, workspace action, Quick add Task tile, and Today Focus
    action now all open/focus the same primary task composer.
  - Planning task creation copy now uses `Create task`, `Add task`, and
    `Close task form` instead of ambiguous `card` terminology.
  - List-specific task creation remains available but is labeled as task
    creation.

### NEST-314 Calendar And Journal Action Repair

- Priority: P1
- Status: DONE
- Depends on: NEST-311
- Stage: implementation
- Goal: make Calendar and Journal quick actions open real, visible composers.
- Scope:
  - `/calendar`
  - `/journal`
  - quick add tiles
  - collapsed details panels
- Implementation plan:
  1. Calendar quick add Event opens the event composer, not only an anchor.
  2. Event composer is not hidden inside a collapsed details panel when invoked
     by intent.
  3. Journal `Write reflection` focuses the composer and preserves warm
     canonical style.
  4. Life-area management stays secondary, but is discoverable from Journal
     balance surfaces.
- Acceptance criteria:
  - Quick add tiles always perform visible state changes.
  - Add event and write reflection are obvious in desktop and mobile flows.
- Result:
  - Calendar Event and Focus quick actions now open the event composer and
    focus the title field instead of relying on an anchor into a collapsed
    panel.
  - `/calendar?action=create-event` opens the same visible composer from
    outside the Calendar route.
  - `/journal?action=create-entry` scrolls to and focuses the reflection
    composer.
  - Dashboard and Calendar note/reflection actions now use the journal create
    intent.

### NEST-315 Shared Confirmation And Feedback Pattern

- Priority: P1
- Status: DONE
- Stage: implementation
- Goal: replace native confirm dialogs and inconsistent success/error handling
  with a Nest-native pattern.
- Scope:
  - delete/revoke/deactivate flows across Calendar, Habits, Journal, Life
    Areas, Routines, Settings, Planning
  - shared confirm component or pattern
  - feedback locality
- Implementation plan:
  1. Create a reusable confirmation dialog/sheet pattern.
  2. Replace `window.confirm` in core pages first.
  3. Add local success feedback next to the affected row/panel.
  4. Keep destructive actions visually clear but calm.
- Acceptance criteria:
  - No native confirms in core flows.
  - Destructive actions are keyboard accessible and screen-reader clear.
  - User sees what changed after success.
- Result:
  - Added reusable `useConfirmDialog` with canonical Nest visual treatment.
  - Replaced native confirm flows in Planning, Calendar, Journal, Habits,
    Routines, Life Areas, and Settings.
  - Destructive and revocation actions now use action-specific title,
    description, and button copy.
  - Static source search found no remaining `window.confirm` usage in web app
    sources.

### NEST-316 Core Module Visual Integration

- Priority: P1
- Status: DONE
- Depends on: NEST-312, NEST-313
- Stage: implementation
- Goal: bring Habits, Routines, Life Areas, Insights, Automations, Billing, and
  Settings closer to the canonical system without making them top-level peers.
- Scope:
  - module pages
  - shell tone
  - empty/success/error states
  - repeated forms and rows
- Implementation plan:
  1. Treat Habits/Routines/Life Areas as contextual module rooms, not primary
     nav peers.
  2. Reuse canonical panels, rows, local feedback, and create-intent pattern.
  3. Move advanced surfaces into Settings-style hierarchy where appropriate.
  4. Replace raw admin density with calmer, task-oriented sections.
- Acceptance criteria:
  - Lower-level pages no longer feel like legacy CRUD.
  - Core pages preserve API-backed functionality.
  - Advanced/admin pages are clearly secondary.
- Result:
  - Added contextual canonical panels to Habits, Routines, Life Areas,
    Insights, Automations, and Billing.
  - Habits/Routines/Life Areas now use clearer `Create ...` and `... library`
    section language.
  - Insights, Automations, Billing, and Settings use canonical shell tone and
    reduced rail chrome, keeping them visually related without promoting them
    to top-level peers.

### NEST-317 Canonical State And Responsive QA Pass

- Priority: P1
- Status: DONE
- Depends on: NEST-311 through NEST-316
- Stage: verification
- Goal: verify that each web pillar has designed loading, empty, error,
  success, desktop, tablet, and mobile states.
- Scope:
  - Dashboard
  - Planning
  - Calendar
  - Journal
  - Settings
- Implementation plan:
  1. Build a state checklist per route.
  2. Capture desktop and mobile screenshots.
  3. Compare against canonical artifacts where they exist.
  4. Record remaining deviations explicitly.
- Acceptance criteria:
  - No route ships with hidden primary action.
  - No route hides API failure under showcase content.
  - Mobile order follows canonical guidance.
- Result:
  - Ran production `next start` Playwright smoke with local mock API across 11
    routes on desktop and mobile.
  - Fixed a mobile Calendar intent regression where
    `/calendar?action=create-event` opened state but mobile CSS still hid the
    event composer.
  - Final smoke checked 22 route/viewport combinations with zero failures.
  - Report:
    `docs/ux/nest_317_canonical_state_responsive_qa_2026-05-02.md`.

## Recommended Execution Order

1. `NEST-311` Unified Create Intent System
2. `NEST-312` Dashboard Action Clarity Pass
3. `NEST-313` Planning Workspace Simplification
4. `NEST-314` Calendar And Journal Action Repair
5. `NEST-315` Shared Confirmation And Feedback Pattern
6. `NEST-316` Core Module Visual Integration
7. `NEST-317` Canonical State And Responsive QA Pass

## Design Direction For The Next Implementation Wave

The next wave should not start by drawing prettier cards. It should start by
making the core actions inevitable:

- task capture is always one click away
- destination pages honor action intent
- forms open in the same visual language as the canonical surface
- success feedback is local and calm
- deletion/revocation is native to Nest, not browser-default
- lower-level modules feel contextual, not like separate CRUD apps

## Validation Expectations

For each implementation task:

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm build`
- `pnpm test:unit`
- screenshot smoke for desktop and mobile web
- manual click path:
  - Dashboard -> Add task -> task composer visible
  - Dashboard -> Time block -> event composer visible
  - Dashboard -> Journal entry -> composer visible
  - Planning tab switch -> correct composer/action visible

## Result Report

This audit found that the main unfinished issue is not visual polish alone. The
web app needs a unified action model that makes creation, especially task
creation, obvious and reliable across Dashboard and Planning. Once that is in
place, the remaining canonical refinements will have a stronger functional
foundation.
