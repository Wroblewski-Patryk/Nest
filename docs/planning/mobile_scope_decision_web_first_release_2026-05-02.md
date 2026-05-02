# Mobile Scope Decision For Web-First Release

Date: 2026-05-02
Decision: web-first release; native mobile remains V2 scope.

## Context

`NEST-300` found that the web app is closest to the current canonical Nest shell,
while mobile still uses the older practical tab model:

- Tasks
- Habits
- Goals
- Journal
- Calendar
- hidden Insights
- Settings

The current canonical product IA is:

- Dashboard
- Planning
- Calendar
- Journal
- Settings

## Decision

The next deployment improvement wave remains web-first. Native mobile is not
part of the release parity claim until a dedicated mobile IA and session-storage
slice is scheduled.

## Rationale

- Web is the canonical surface currently being polished for release.
- Backend and shared API contracts already preserve mobile compatibility.
- Mobile IA alignment is product-visible and should be implemented deliberately
  rather than as a rushed tab-label rename.
- Native token-storage review should happen before public native release.

## Follow-Up Task

When mobile enters release scope, execute a dedicated task that:

1. Adds or promotes a mobile Dashboard landing surface.
2. Aligns persistent tabs to Dashboard, Planning, Calendar, Journal, Settings.
3. Reviews native token persistence and session lifecycle.
4. Runs mobile typecheck, unit contract, Expo web export, and device/simulator
   smoke checks.

## Release Wording

Do not describe the next release as web+mobile parity. Use web-first wording
until the mobile follow-up task is complete.
