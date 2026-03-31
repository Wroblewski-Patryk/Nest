# Open Decisions

## Decision Item
- ID:
- Context:
- Options:
- Recommendation:
- Owner:
- Due date:
- Status: OPEN | DECIDED

## Decision Item
- ID: OD-2026-03-31-01
- Context: delegated AI access needs machine credentials for user-approved
  scopes with safe rotation/revocation and clear compatibility with existing
  auth stack.
- Options:
  - Keep Laravel Sanctum personal access tokens with scoped abilities and
    metadata extension for delegation.
  - Introduce OAuth2 client-credentials grant for AI automation immediately.
- Recommendation: start with scoped Sanctum credentials for faster delivery in
  `NEST-164`, then evaluate OAuth2 migration after first real usage telemetry.
- Owner: Planning Agent
- Due date: 2026-04-03
- Status: OPEN

## Decision Item
- ID: OD-2026-03-31-02
- Context: AI write operations can run in agent-own mode or delegated-user mode
  and need predictable approval behavior for safety and usability.
- Options:
  - Require explicit per-action approval for all delegated writes.
  - Allow scope-based auto-execution for selected low-risk actions with user
    configurable policy and full audit.
- Recommendation: enforce explicit approval by default with optional future
  opt-in auto-execution for low-risk scopes only.
- Owner: Product + Review Agent
- Due date: 2026-04-05
- Status: OPEN
