# AI Layer

## Goal

Provide controlled AI capabilities that help users plan and execute life
operations without compromising data integrity or security.

## Product Decision

- AI is not part of MVP delivery scope.
- Once enabled in product phases after MVP, AI is default ON.

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

## Safety and Control

- AI can only execute documented tool actions.
- Tool calls require auth context and scope checks.
- Sensitive actions need explicit user confirmation policy.
- All AI writes are logged with actor, timestamp, and diff summary.

## Delivery Phases

- Phase 1: no end-user AI surface in MVP.
- Phase 2: first AI surface and tool-assisted operations.
- Phase 3: in-app AI assistant for web and mobile clients.

## Observability

- track tool success/error rates
- monitor latency and retries
- monitor hallucination-prone intents via guardrail metrics
