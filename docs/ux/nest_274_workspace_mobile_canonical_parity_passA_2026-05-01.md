# NEST-274 - Workspace Mobile Canonical Parity Pass A

## Context

Desktop canonical work for Dashboard, Planning, Calendar, and Journal was already
landed, but the web mobile experience still carried desktop-first ordering and
extra management surfaces that diluted the canonical first viewport.

## Goal

Bring the shared mobile workspace shell and the first canonical mobile pass for
Dashboard, Planning, Calendar, and Journal materially closer to the approved
mobile references without breaking the live web routes.

## Scope

- shared mobile workspace navigation treatment
- mobile ordering and visibility polish for canonical Dashboard
- mobile ordering and visibility polish for canonical Planning
- mobile ordering and visibility polish for canonical Calendar
- mobile ordering and visibility polish for canonical Journal

## Changes

- Moved the mobile workspace nav directly under the topbar and expanded it into
  a labeled five-item strip for faster scanning.
- Added dashboard support-card class hooks so mobile ordering can place
  `Journal`, `Quick add`, and `Life areas` after the primary work stack.
- Flattened narrow-screen canonical layout groups where needed and added mobile
  ordering rules for Dashboard, Planning, Calendar, and Journal.
- Hid mobile-first clutter that should not dominate canonical narrow viewports,
  including Planning legacy utility surfaces, Calendar add-event management in
  the first viewport, and Journal status/life-area management surfaces.
- Preserved the existing live CRUD and refresh flows on the underlying routes.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`

## Result

Dashboard, Planning, and Journal now read much closer to their canonical mobile
hierarchy at first glance. Calendar mobile also improved, but still needs a
follow-up parity pass to fully lock the narrow-screen order of `Today's time
map`, event intelligence, and the lower ladder stack.
