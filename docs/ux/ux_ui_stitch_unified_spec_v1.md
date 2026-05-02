# Nest UX/UI Unified Spec (Stitch v1)

## Purpose

Define one coherent UX/UI baseline in Stitch before any implementation changes
in web/mobile code.

## Scope

- Design-only phase (no code changes).
- One approved Stitch project as source of truth for this cycle.
- After approval: implementation tasks split per module.
- Visual and UX language must follow:
  `docs/ux/nest_design_system_mix_ideal_v1.md`.

## Source of Truth (This Cycle)

- Type: approved Stitch snapshot
- Project: `projects/11122321523690086751`
- Baseline status: unified v2 approval package in active iteration, generated on
  `2026-03-21`
- Style system baseline add-on approved on `2026-03-21`:
  `docs/ux/nest_design_system_mix_ideal_v1.md`

## Evidence (Stitch)

- Verified baseline project: `projects/11122321523690086751`.
- Verified unified screen set and IDs are tracked in:
  `docs/ux/stitch_screen_registry_2026-03-21.md`.
- Mobile unified update batch applied on `2026-03-21` for:
  - Home today: `projects/11122321523690086751/screens/7decc38f1eaf4da3ae262c145d21c231`
  - Journal/reflection:
    `projects/11122321523690086751/screens/47539c8935d044f2b7de82e34b2676da`
  - Tasks/habits:
    `projects/11122321523690086751/screens/81fbbc74978a4d7cb180d0bd2ceeef80`
- User intent for Stitch-first design iteration in current thread confirmed on
  `2026-03-21`; implementation remains blocked until explicit implementation
  approval after final screen review.

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
- Mandatory style constraints:
  - ultra-thin outline icon language (`1px` target),
  - earthy calm palette with sage accent and no pure black/white baseline,
  - subtle watercolor aura treatment with module-specific low-contrast variants,
  - compact left-aligned header and floating bottom navigation panel patterns.

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
- Full compliance with `docs/ux/nest_design_system_mix_ideal_v1.md`.
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

## Implementation Wave Status (2026-03-31)

- Baseline shell/token refresh for web and mobile has started.
- Current execution evidence and remaining parity work:
  `docs/ux/uxui_refresh_implementation_wave_2026-03-31.md`.
