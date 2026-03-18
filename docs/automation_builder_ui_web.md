# Automation Builder UI (Web, NEST-058)

Last updated: 2026-03-19

## Scope

Deliver baseline web UI for creating and operating automation rules.

## Route

- `/automations`

## Capabilities (v1)

- Create basic automation rule from web screen.
- Toggle rule state (`active` / `paused`).
- Manual execution trigger per rule.
- Recent execution run visibility.

## API Integration

- `GET /automations/rules`
- `POST /automations/rules`
- `PATCH /automations/rules/{ruleId}`
- `POST /automations/rules/{ruleId}/execute`
- `GET /automations/runs`

## Notes

- UI intentionally starts with a constrained builder template for safe launch.
- Advanced node-based builder, richer condition/action editing, and debugging
  depth are deferred to subsequent tasks (`NEST-059+`).
