# AI Copilot Safety Evaluation Harness V2 (NEST-144)

Last updated: 2026-03-31

## Purpose

Provide a deterministic release-quality safety gate for V2 copilot behavior
before promotion.

## Coverage

- Policy guardrail regression checks:
  - privacy boundary blocking
  - wellbeing guardrail blocking
  - safe-context allow baseline
- Hallucination grounding checks:
  - source references are present for grounded scenarios
  - source references map to entities present in context graph snapshot
  - source references remain tenant-isolated
- Action safety checks:
  - write actions remain proposal-only before approval
  - unsupported action types are blocked
  - cross-tenant target entities are blocked

## Command

- `php artisan ai:copilot-safety-eval --json`
  - emits versioned scorecard payload:
    - `schema_version=ai-copilot-safety-eval.v1`
    - per-category pass/fail summary
    - overall score and threshold result
- threshold controls:
  - default minimum score from env:
    - `AI_COPILOT_SAFETY_MIN_SCORE_PERCENT` (default `95`)
  - optional override:
    - `--min-score=<percent>`
- strict mode:
  - `--strict` requires 100% category scores

## Release Gate Integration

- Release train workflow now includes:
  - `php artisan ai:copilot-safety-eval --json --strict --env=testing`
- Release gate fails when score is below minimum threshold or strict checks fail.

## Regression Tests

- `tests/Feature/AiCopilotSafetyEvaluationCommandTest.php`
  - validates scorecard category coverage output
  - validates gate-block behavior below threshold

