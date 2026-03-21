# MVP Scope

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
- Google Calendar integration is post-MVP (Phase 2), after list/task baseline.
- Obsidian integration is post-MVP and intentionally scheduled as the last
  provider in the initial integration wave.

## Not Included in MVP

- Enterprise SSO/RBAC.
- Full offline-first with complex merge strategies.
- Third-party plugin marketplace.
- Advanced predictive analytics and autonomous AI planning.
- OAuth providers (Google/Apple/etc.) in auth layer.
- Full notifications matrix (email + full push strategy).
- Family/friends shared collaboration spaces.

## Confirmed Product Decisions (March 15, 2026)

- Multi-tenant architecture, single active user at launch.
- Online-only operation in MVP (no offline support).
- AI introduced after MVP and default ON when released.
- Notifications mostly post-MVP; simple mobile push can be the first step.
