# Frontend Strategy

## Product Editions

Nest ships as:

- Web app: desktop/tablet/mobile browser.
- Mobile app: tablet/phone native app.

Both editions keep the same core functionality and a consistent visual language.

## Recommended Stack

- Web: Next.js 16 + React 19.2 + TypeScript.
- Mobile: Expo SDK 55 + React Native + TypeScript.

## Consistency Model

- Shared design tokens: spacing, typography, colors, radius, elevation.
- Shared API contracts: generated types and validation schemas.
- Shared domain vocabulary: same naming and status models across platforms.
- Shared UX rules: same states (loading, empty, error, success) and same
  interaction priorities.
- UX/UI MCP workflow: follow `docs/ux/ux_ui_mcp_collaboration.md` for
  design-source validation and implementation evidence.
- Unified Stitch approval baseline (when used): follow
  `docs/ux/ux_ui_stitch_unified_spec_v1.md` before implementation.
- Nest visual system baseline: enforce
  `docs/ux/nest_os_design_system_mix_ideal_v1.md` for cohesive style direction
  during Stitch generation and implementation handoff.
- Insights UI baseline: see `docs/ux/insights_ui_baseline.md` for Phase 3 web +
  mobile coverage.

## UX Responsibility Split

- Web-first strengths:
  - dense planning screens
  - bulk editing
  - calendar and dashboard operations
- Mobile-first strengths:
  - quick capture
  - check-in flows
  - reminders and daily execution

## Responsive and Adaptive Rules

- Web layout breakpoints for desktop, tablet, and mobile browser.
- Mobile app supports phone and tablet with adaptive navigation.
- No feature parity gaps in MVP-critical modules.
- Planned exception (post-v1): admin management surfaces (users,
  subscriptions, platform administration) are web-only and out of scope for
  current single-user phase.

## Shared Implementation Guidelines

- Keep business logic in backend API/domain layer.
- Keep client logic focused on presentation and local interaction state.
- Use the same telemetry event names across clients.
- Snapshot visual tests for both web and mobile key screens.

