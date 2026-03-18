# AI Weekly Planning API (Phase 3, v1)

Last updated: 2026-03-16

## Purpose

Expose the first end-user AI planning surface that proposes a weekly plan from
real tenant/user data with explicit constraints and explainable rationale.

## Endpoint

- `POST /api/v1/ai/weekly-plan/propose`
- Auth: `auth:sanctum`
- Feature gate: `ai.surface` middleware (`AI_SURFACE_ENABLED`)

## Request

```json
{
  "constraints": {
    "available_hours": 10,
    "max_items": 10,
    "include_weekend": false,
    "min_confidence": 0.55,
    "prioritize": ["tasks", "habits", "goals"]
  }
}
```

Validation:

- `available_hours`: `1..80`
- `max_items`: `1..25`
- `include_weekend`: boolean
- `min_confidence`: `0.1..0.95`
- `prioritize[]`: `tasks|habits|goals`

## Response

- `data.constraints`: resolved constraints used by the planner
- `data.summary`: planned item count + used/remaining minutes
- `data.summary.needs_review_items`: low-confidence items held from schedule
- `data.explainability`:
  - `model_version`
  - `reason_code_counts`
  - `generated_at`
  - `guardrails` (`min_confidence_applied`, `low_confidence_policy`)
- `data.items[]`:
  - `type` (`task|habit|goal`)
  - `source_id`
  - `title`
  - `estimated_minutes`
  - `scheduled_for`
  - `rationale`
  - `confidence_score`
  - `guardrail_status` (`accepted`)
  - `reason_codes[]`
  - `source_entities[]` (`entity_type`, `entity_id`, `signals`)
- `data.review_items[]`:
  - same shape as `items[]`,
  - `guardrail_status=needs_review`,
  - excluded from scheduled output until manual review.

## Planning Logic (v1)

- Candidate sources:
  - open tasks (`todo`, `in_progress`) sorted by priority and due date
  - active habits
  - active goals sorted by target date
- Candidate score priority:
  - tasks > goals > habits (within task priority ordering)
- Scheduler allocates items across upcoming planning days under:
  - time budget (`available_hours`)
  - item budget (`max_items`)
  - weekend include/exclude constraint

## Notes

- This is a deterministic baseline for Phase 3 entry and explainability.
- Future tasks (`NEST-052+`) will add reason codes, confidence scoring, and
  feedback loops.
