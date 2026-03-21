# Insights UI Baseline (NEST-050)

Last updated: 2026-03-16

## Scope

Deliver initial insights UI in both clients using Phase 3 APIs:

- life-area balance (`GET /insights/life-area-balance`)
- trend endpoints for tasks/habits/goals (`GET /insights/trends/{module}`)

## Web

- Route: `/insights`
- Navigation: added as sixth module tab in `WorkspaceShell`.
- Screen sections:
  - API status callout
  - life-area balance rows with target vs actual shares
  - weekly trend totals for tasks, habits, goals

## Mobile

- Route: `(tabs)/insights`
- Navigation: added `Insights` tab with trend icon.
- Screen sections:
  - KPI cards (balance/window/trend total)
  - balance + trend snapshot rows
  - API connectivity status card

## Behavior Notes

- Both clients fetch all four insight resources in parallel.
- On API failure, both clients keep the screen usable with local fallback
  snapshot data and explicit status messaging.
- Telemetry naming follows shared contract: `screen.insights.view`.
