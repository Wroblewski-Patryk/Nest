# AI Explainability Payloads (NEST-052)

Last updated: 2026-03-19

## Purpose

Standardize explainability fields returned by AI recommendation APIs.

## Weekly Plan Explainability Contract

For `POST /api/v1/ai/weekly-plan/propose`:

- `data.explainability.model_version`: deterministic planner version id
- `data.explainability.reason_code_counts`: aggregated reason code histogram
- `data.explainability.generated_at`: ISO-8601 generation timestamp
- `data.explainability.guardrails`:
  - `min_confidence_applied`
  - `low_confidence_policy` (`needs_review`)

Per recommendation item:

- `reason_codes[]`: compact machine-readable reason tags
- `source_entities[]`: provenance entities used to build recommendation
- `confidence_score`: normalized score (`0..1`)
- `guardrail_status`: `accepted` or `needs_review`
  - `entity_type`
  - `entity_id`
  - `signals` (non-PII decision attributes)

## Baseline Reason Code Families (v1)

- `task_priority_*`
- `task_due_*`
- `habit_consistency`
- `habit_cadence_*`
- `goal_active_milestone`
- `goal_target_*`

## Notes

- Payload is deterministic and rule-based for Phase 3 baseline.
- Confidence guardrail in v1:
  - low-confidence items are returned in `review_items` and excluded from
    scheduled plan until explicit user review.
