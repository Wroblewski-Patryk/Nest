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

## Shared Implementation Guidelines

- Keep business logic in backend API/domain layer.
- Keep client logic focused on presentation and local interaction state.
- Use the same telemetry event names across clients.
- Snapshot visual tests for both web and mobile key screens.