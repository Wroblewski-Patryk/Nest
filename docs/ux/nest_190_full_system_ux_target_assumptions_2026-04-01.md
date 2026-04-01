# NEST-190 Full-System UX Target Assumptions (2026-04-01)

## Goal

Define one practical, implementation-ready UX/UI direction for Nest web (desktop + mobile web), based on full-system clickthrough evidence and Stitch reference screens, before the next frontend execution wave.

## Evidence Used

- Full-system clickthrough capture:
  - `docs/ux_audit_evidence/2026-04-01/capture-manifest.json`
  - `docs/ux_audit_evidence/2026-04-01/capture-manifest.csv`
  - `docs/ux_audit_evidence/2026-04-01/desktop/*.png`
  - `docs/ux_audit_evidence/2026-04-01/mobile/*.png`
- Coverage summary:
  - 66 screenshots total (`desktop: 33`, `mobile: 33`)
  - route mismatch check shows only intentional unification redirects:
    - `/goals -> /tasks?tab=goals`
    - `/targets -> /tasks?tab=targets`
  - repeated redirect stability passes for `/journal` and `/settings?tab=access` remained stable in this run.
- Stitch reference source:
  - project: `projects/11122321523690086751`
  - key screens used as visual and interaction benchmark:
    - `64341b8036e1470b83a4ae630a00aa83` (`Nest Home Dashboard`)
    - `7decc38f1eaf4da3ae262c145d21c231` (`Nest Home Today (Mobile)`)
    - `81fbbc74978a4d7cb180d0bd2ceeef80` (`Nest Tasks & Habits Command`)
    - `47539c8935d044f2b7de82e34b2676da` (`Nest Journal & Reflection`)
    - `b22c7912224e4fa2ae3101789a5287c7` (`Nest Calendar & Timeboxing`)
    - `71d241c92bc944a9b86033bbe5456fb4` (`Nest Insights & Trends (Desktop)`)

## Current UX Diagnosis (What Still Blocks "Great")

## Cross-app issues

- Information hierarchy is still too flat in multiple modules (too many similar cards with equal visual weight).
- Several pages are still form-first, not action-first (user sees setup fields before clear "what should I do now").
- Mobile left rail consumes too much horizontal space and reduces readable content area.
- Some modules still expose technical error details directly in UI (example seen in calendar: `per page field must not be greater than 100`).
- Interaction feedback is not consistently tied to the action location (some feedback appears far from the clicked control).
- Tone is cleaner than before, but still feels closer to "internal panel" than "personal life companion".

## Module-level pain points

- `Dashboard`: better baseline exists, but "next best action" is not dominant enough vs secondary blocks.
- `Planning (/tasks)`: functionality is broad, but cognitive load stays high when metrics, filters, setup, and board are all visible at once.
- `Calendar`: switcher exists, but event/task/habit/routine layering is not yet visually clear at a glance.
- `Journal` and `Life Areas`: useful data exists, but readability and chunking are dense on mobile.
- `Insights`: still reads as dense metrics surface, not a guided "what to change this week" coach.
- `Settings`: good tab split is present, but future-facing IA for profile/app/api/subscription needs stronger consistency with account and security workflows.

## Target Product UX Model

Nest should feel like one calm cycle:

1. Plan (`Planning`, `Calendar`)
2. Do (`Dashboard`, `Habits`, `Routines`)
3. Reflect (`Journal`, `Life Areas`)
4. Adjust (`Insights`, `Settings`)

Every screen should answer one user question within 3 seconds:

- What matters now?
- What is blocked?
- What is the next action?

## IA and Navigation Assumptions

- Keep one primary global navigation set:
  - `Dashboard`
  - `Planning`
  - `Habits`
  - `Routines`
  - `Calendar`
  - `Journal`
  - `Life Areas`
  - `Insights`
  - `Settings`
- Keep one planning module with local subviews:
  - `Board`, `Tasks`, `Lists`, `Targets`, `Goals`
- Do not reintroduce duplicate top + local module rails that repeat the same destinations.
- Mobile-first rule:
  - mobile gets prioritized content flow and compact actions first,
  - desktop extends that flow with space, not a different mental model.

## Visual System Assumptions

- Maintain sanctuary palette and soft contrast from Stitch.
- Increase hierarchy contrast:
  - one dominant primary panel per screen,
  - secondary cards visually quieter,
  - tertiary metadata reduced.
- Keep icon-led navigation (outline style), remove letter-avatar menu markers for module icons.
- Avoid over-stretch:
  - enforce consistent content max width,
  - prevent large empty zones in headers and panel tops,
  - prefer stacked sections over oversized empty containers.

## Interaction Assumptions

- Progressive disclosure by default:
  - forms open only when user chooses `Add`,
  - after save, form closes and new item appears in-place.
- Inline state handling per section:
  - `loading`, `empty`, `error`, `success` should be local to the component where action happened.
- Raw backend validation messages should not be shown directly to end users.
- Preserve optional hierarchy:
  - list can exist without goal/target/life-area parent,
  - task can exist without list and without parent context.

## Module Target Assumptions

## Dashboard

- Make "Now" action primary.
- Keep timeline (`morning/now/evening`) but surface one dominant next action card.
- Keep quick actions compact and contextual, not equal weight with core daily focus.

## Planning (Tasks + Lists + Targets + Goals)

- Default subview: `Board` (kanban-like).
- `Add card` opens lightweight composer (desktop inline/side, mobile sheet).
- Show path clarity in `Goals`: `Goal -> Targets -> Lists -> Tasks` with count and status summary.
- Keep filters collapsible and off by default unless user opens them.
- Keep standalone items first-class (no forced parent assignment).

## Habits and Routines

- Convert from CRUD-first to execution-first:
  - today check-ins, streak impact, quick complete/skip.
- Keep editor available but secondary to today's execution list.

## Calendar

- Keep `day/week/month` toggle always visible.
- Show unified time map of events + tasks + habits/routines when time-bound.
- Introduce conflict presentation with actionable resolve CTA instead of raw error blocks.

## Journal and Life Areas

- Journal entry should prioritize quick reflection capture first.
- Life area tagging must be fast (chips/multi-select), then optional deeper editing.
- Life areas screen should prioritize balance status and drift indicators, then edit tools.

## Insights

- Shift from static charts to guided recommendations:
  - "What changed"
  - "Why it matters"
  - "What to do next"
- Keep one-click conversion from recommendation to action in planning/calendar/habits.

## Settings

- Stable tabs:
  - `Profile`
  - `Application`
  - `Access & API`
  - `Subscription`
- Keep logout accessible from main app shell and profile context.
- API credentials flow must remain user-safe and explicit (create, scope, revoke, audit visibility).

## Quality Gates for "Great UX" Readiness

- No critical user flow blocked in GUI for primary modules.
- No raw technical API errors visible in module surfaces.
- First create flow in each module is discoverable without reading helper text.
- Mobile layout remains readable and non-cramped at `390x844`.
- Desktop avoids stretched empty blocks and maintains clear first visual focus.
- Planning, calendar, and reflection loops are interconnected in UI, not isolated silos.

## Execution Implication

This document is a target contract for upcoming implementation tasks. Next execution wave should prioritize shell hierarchy and interaction clarity first, then module-by-module visual and workflow refinement against the same baseline.
