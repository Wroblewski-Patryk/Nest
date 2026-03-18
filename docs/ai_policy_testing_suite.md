# AI Policy Testing Suite (NEST-055)

Last updated: 2026-03-19

## Purpose

Provide repeatable regression coverage for AI weekly planning policy/safety
rules and keep these checks in CI.

## Coverage

- Unit policy checks:
  - `tests/Unit/AiPlanningPolicyServiceTest.php`
- Feature policy regressions:
  - `tests/Feature/AiPolicyRegressionTest.php`
- Weekly planning end-to-end tests (with policy payload assertions):
  - `tests/Feature/AiWeeklyPlanningApiTest.php`

## Guardrail Classes (v1)

- `policy_privacy_boundary`
- `policy_wellbeing_guardrail`

## CI Execution

- The suite runs in existing backend CI pipelines because all unit/feature
  tests are executed in workflow.
- Any policy drift breaks CI via deterministic assertions on allow/block
  outcomes and response payload shape.
