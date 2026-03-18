# AI Layer

## Goal

Provide controlled AI capabilities that help users plan and execute life
operations without compromising data integrity or security.

## Product Decision

- AI is not part of MVP delivery scope.
- AI weekly planning surface starts in Phase 3 (`NEST-051`).

## Capability Areas

- schedule analysis and optimization
- task planning suggestions
- habit/routine consistency insights
- life-area balance analysis

## Tool Interface (Examples)

- create_task
- update_task
- schedule_event
- log_habit
- create_journal_entry
- suggest_week_plan

## Phase 3 Baseline API

- `POST /api/v1/ai/weekly-plan/propose`
  - tenant/user scoped,
  - accepts explicit planning constraints,
  - returns scheduled proposal items with rationale, reason codes, source
    entity references, and confidence guardrail status.
- `POST /api/v1/ai/feedback`
  - captures user decision (`accept`, `reject`, `edit`) for recommendation
    quality tracking.
- Detailed contract: `docs/ai_weekly_planning_api.md`.
- Feedback contract: `docs/ai_feedback_loop.md`.

## Safety and Control

- AI can only execute documented tool actions.
- Tool calls require auth context and scope checks.
- Sensitive actions need explicit user confirmation policy.
- All AI writes are logged with actor, timestamp, and diff summary.

## Delivery Phases

- Phase 1: no end-user AI surface in MVP.
- Phase 2: no end-user AI surface; focus remains on integration expansion.
- Phase 3: first end-user AI surface and in-app assistant for web and mobile.

## MVP Enforcement

- Backend feature flag `AI_SURFACE_ENABLED=false` by default.
- AI routes are protected by feature middleware and return `404` while the flag
  is disabled.

## Observability

- track tool success/error rates
- monitor latency and retries
- monitor hallucination-prone intents via guardrail metrics
