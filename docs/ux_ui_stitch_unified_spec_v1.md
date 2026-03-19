# Nest UX/UI Unified Spec (Stitch v1)

## Purpose

Define one coherent UX/UI baseline in Stitch before any implementation changes
in web/mobile code.

## Scope

- Design-only phase (no code changes).
- One approved Stitch project as source of truth for this cycle.
- After approval: implementation tasks split per module.

## Source of Truth (This Cycle)

- Type: approved Stitch snapshot
- Project: `projects/14952238901582428681`
- Baseline status: unified v1 approval set generated and approved on
  `2026-03-19`

## Evidence (Stitch)

- Verified baseline project: `projects/14952238901582428681`.
- Verified additional baseline screens:
  - Morning briefing: `projects/14952238901582428681/screens/1c4d38cf15b44887882973973a7c5c26`
  - Weekly report: `projects/14952238901582428681/screens/f81dbf00a9b5489cb72377a2ad454ec0`
- User approval captured in delivery thread on `2026-03-19` before moving to
  implementation.

## UX Principles

- Calm-first hierarchy: high-signal content first, low-signal details second.
- Action bias: every key screen has a clear primary next action.
- State clarity: loading, empty, error, success, overloaded variants.
- Cross-module consistency: same spacing rhythm, typography scale, and semantic
  colors.
- Accessible contrast and readable information density on desktop and mobile.

## Unified Visual System v1

- Typography:
  - Display: one serif family for headlines (editorial, premium tone)
  - UI text: one sans family for controls and dense data
- Color roles:
  - `primary`: action emphasis
  - `surface`: card/background layering
  - `success`, `warning`, `danger`: semantic status
  - `muted`: secondary text and separators
- Components:
  - Top app bar, left navigation rail (desktop), bottom bar (mobile)
  - KPI card, timeline block, task/notification row
  - Empty-state block, error block, success toast
  - Primary/secondary/ghost button patterns
  - Section header with helper action

## Required Screen Set (Approval Pack)

1. Design system foundation board
2. App shell + navigation (desktop/mobile)
3. Home dashboard
4. Calendar + timeboxing
5. Tasks/lists command view
6. Habits/routines
7. Goals/timeline
8. Journal/life areas
9. AI coach
10. Integrations hub
11. Finance overview
12. Notifications command center
13. Morning briefing
14. Weekly report
15. Settings/privacy/billing

## Acceptance Checklist Before Implementation

- One style language across all screens (no mixed themes).
- Shared navigation and reusable component patterns visible.
- All core modules have at least one desktop and one mobile-ready treatment.
- Critical states included:
  - empty
  - error/failure
  - success
  - overload/triage where relevant
- User confirms approval of the Stitch baseline.

## Handoff Rules (Post-Approval)

- Split implementation into module tasks.
- Reference exact Stitch screen IDs in each task.
- Do not mark implementation task done without parity evidence.
