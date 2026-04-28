# Testing Strategy

Document the real testing approach for Nest here.

## Purpose

Explain how the project is validated beyond "tests passed".

Capture:

- critical risk areas
- automated test layers
- manual verification expectations
- stack-specific quality gates
- scenario validation required for high-risk subsystems

## Recommended Sections

### Critical Areas

- multi-tenant isolation and ownership
- auth and permission boundaries for human and AI actors
- localization and route behavior parity
- web and mobile feature parity
- external integrations and deployment-sensitive runtime paths

### Tooling

- unit and integration test runners
- API contract validation tools
- web and mobile test tools
- lint and typecheck commands
- build verification commands

### Manual Verification Standard

- define when frontend and mobile changes need manual UX verification
- define when backend changes need manual API verification
- require delivery summaries to mention automated and manual checks actually run
- require delivery summaries to include exact command lines used and pass/fail
  outcome per command

### Behavior Or Scenario Validation

Use this section when passing isolated tests is not enough.

Examples:

- multi-step human and AI actor workflows
- async worker orchestration
- web/mobile parity-sensitive journeys
- fail-closed behavior under invalid tenancy or auth context

### Required Checks By Change Type

- runtime changes
- API contract changes
- database or migration changes
- UI or route changes
- deployment or infrastructure changes

### Evidence Standard

- For each completed task, include:
  - exact automated validation commands run
  - manual verification actions run
  - pass/fail result for each item
  - links or references to key artifacts when applicable

## Rule

Keep this file aligned with real commands recorded in
`.codex/context/PROJECT_STATE.md`.

## AI And Integration Validation

AI features require repeatable multi-turn validation using `AI_TESTING_PROTOCOL.md`. Required coverage includes memory consistency, multi-step context stability, adversarial contradiction handling, role break and prompt injection resistance, memory corruption resistance, edge cases, data leakage, and unauthorized access attempts.

Runtime features require integration validation using `INTEGRATION_CHECKLIST.md`. A feature is not complete until real UI/client paths, API contracts, database schema or migrations, validation, loading states, error states, refresh or restart behavior, and regression risk are verified.

Completion evidence must satisfy `DEFINITION_OF_DONE.md` and include exact commands, manual checks, scenario results, and residual risks.
