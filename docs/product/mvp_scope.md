# MVP Scope

This file remains the compact product-scope summary for the practical release.
For current architecture and planning, treat `MVP` here as the active `v1`
practical product scope.

Canonical split:

- `docs/architecture/v1_v2_delivery_split.md`
- `docs/planning/v1_execution_focus_2026-04-26.md`

## Included in MVP

- User account and authentication (email + password).
- Tasks, lists, priorities, due dates.
- Habits and basic routine tracking.
- Goals with measurable targets.
- Journal entries.
- Life areas tagging and basic balance view.
- Calendar module for internal planning and scheduling.

## Platforms in MVP

- Web app (desktop/tablet/mobile browser).
- Mobile app (phone/tablet).

## Integration Scope in MVP

- Task/list integration baseline is included in MVP.
- Google Calendar integration is post-MVP.
- Obsidian integration is post-MVP and intentionally scheduled as the last
  provider in the initial integration wave.

## Not Included in MVP

- Enterprise SSO/RBAC.
- Full offline-first with automatic background sync and complex merge
  strategies.
- Third-party plugin marketplace.
- Conversational AI copilot, AI write actions, and proactive AI briefings.
- Advanced predictive analytics and autonomous AI planning.
- OAuth providers (Google/Apple/etc.) in auth layer.
- Full notifications matrix (email + full push strategy).
- Family/friends shared collaboration spaces as a release requirement.

## Confirmed Product Decisions (March 15, 2026)

- Multi-tenant architecture, single active user at launch.
- Offline/manual-sync policy in MVP: offline changes are queued locally and
  synchronized only by explicit user-triggered force-sync action from
  settings/options.
- AI introduced after MVP and default ON when released.
- Notifications mostly post-MVP; simple mobile push can be the first step.
