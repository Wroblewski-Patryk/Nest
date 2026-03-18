# AI Feedback Loop (NEST-054)

Last updated: 2026-03-19

## Purpose

Capture user outcomes for AI recommendations so we can evaluate suggestion
quality and prepare future ranking/policy tuning.

## Endpoint

- `POST /api/v1/ai/feedback`
- Auth: `auth:sanctum`
- Feature gate: `ai.surface`

## Request Contract

```json
{
  "recommendation_type": "weekly_plan_item",
  "recommendation_id": "item-123",
  "decision": "accept",
  "edited_payload": {},
  "reason_codes": ["fits_schedule"],
  "note": "Optional comment"
}
```

Rules:

- `decision`: `accept|reject|edit`
- `edited_payload` required when `decision=edit`
- `reason_codes[]` optional short machine-readable tags
- feedback is always stored with authenticated tenant/user scope

## Storage

- Table: `ai_recommendation_feedback`
- Main fields:
  - tenant/user scope
  - recommendation type/id
  - user decision
  - edited payload (for `edit`)
  - reason codes and optional note

## Follow-up

- `NEST-055`: policy/safety regression suite can assert feedback paths.
- Future ranking models can use decision distribution and edit patterns.
