# AI Layer

## Goal

Provide controlled AI capabilities that help users plan and execute life
operations without compromising data integrity or security.

## Product Decision

- AI is not part of MVP delivery scope.
- AI weekly planning surface starts in Phase 3 (`NEST-051`).
- V1 product/data workflows are intentionally designed as groundwork for a
  future conversational AI agent that can coordinate life management actions
  together with the user.
- AI architecture direction uses dual actor support:
  - Human User principal (interactive owner),
  - AI Agent principal (automation/collaboration operator),
  - delegated "act on behalf of user" mode via scoped user-issued API
    credentials.

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

- `GET /api/v1/ai/context-graph`
  - deterministic, versioned retrieval payload (`ai-context.v1`) built from
    tasks/calendar/habits/goals/journal,
  - tenant/user scoped with explicit redaction policy for sensitive long-form
    fields,
  - supports fixed `as_of` snapshots for replay-stable context fingerprints.
- `POST /api/v1/ai/weekly-plan/propose`
  - tenant/user scoped,
  - accepts explicit planning constraints,
  - returns scheduled proposal items with rationale, reason codes, source
    entity references, and confidence guardrail status.
- `POST /api/v1/ai/copilot/conversation`
  - natural-language conversational surface for planning/execution/reflection,
  - response includes explainability metadata and source references,
  - returns graceful fallback mode when provider is unavailable.
- `POST /api/v1/ai/actions/proposals`
  - creates approval-gated write proposals for AI task mutations.
- `POST /api/v1/ai/actions/proposals/{proposalId}/approve`
  - executes write action only after explicit user approval.
- `POST /api/v1/ai/actions/proposals/{proposalId}/reject`
  - rejects proposal without executing mutation.
- `GET/PATCH /api/v1/ai/briefings/preferences`
  - user controls for daily/weekly cadence and briefing content scope.
- `POST /api/v1/ai/briefings/generate`
  - generates daily/weekly proactive briefing summary.
- `GET /api/v1/ai/briefings` and `GET /api/v1/ai/briefings/{briefingId}`
  - retrieval endpoints for generated briefing summaries.
- `POST /api/v1/ai/feedback`
  - captures user decision (`accept`, `reject`, `edit`) for recommendation
    quality tracking.
- Detailed contract: `docs/modules/ai_weekly_planning_api.md`.
- Context graph contract: `docs/modules/ai_context_graph_v2.md`.
- Copilot surface contract: `docs/modules/conversational_copilot_surface_v2.md`.
- Approval-gated action contract:
  `docs/modules/ai_approval_gated_write_actions_v2.md`.
- Proactive briefing contract: `docs/modules/ai_proactive_briefings_v2.md`.
- Copilot safety evaluation harness contract:
  `docs/modules/ai_copilot_safety_evaluation_harness_v2.md`.
- Feedback contract: `docs/modules/ai_feedback_loop.md`.
- Machine-readable API error envelope for tool/agent clients:
  `docs/modules/ai_tool_api_error_contract_v1.md`.

## Safety and Control

- AI can only execute documented tool actions.
- Tool calls require auth context and scope checks.
- Agent-originated writes must include clear actor metadata (`human_user`,
  `ai_agent`, `delegated_agent`) and stable trace identifiers.
- Delegated credentials must be scope-limited, revocable, and time-bounded;
  default policy is least privilege.
- Delegated mode cannot silently escalate to broad tenant permissions beyond
  issued scopes.
- Sensitive actions need explicit user confirmation policy.
- All AI writes are logged with actor, timestamp, and diff summary.

## Identity and Access Model (Target)

- Mode A: AI agent own account
  - AI agent has its own principal and permissions.
  - Agent can manage its own goals/tasks/habits/workflows in the same domain
    model as human users, subject to tenant policy.
- Mode B: delegated access from human user
  - Human user creates API credentials dedicated to AI automation.
  - Credential scopes map to domain actions (for example `tasks:write`,
    `calendar:write`, `habits:read`).
  - Backend authorizes each call against both scope and object-level
    ownership/policy checks.
  - Audit trail must preserve both delegator (human) and executor (agent)
    context for each mutation.

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

## Policy Regression

- AI weekly planning context is evaluated by policy guardrails before
  recommendation generation.
- Regression suite coverage and CI expectations:
  `docs/modules/ai_policy_testing_suite.md`.

