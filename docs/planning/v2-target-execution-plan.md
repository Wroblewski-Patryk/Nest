# V2 Target Execution Plan

Last updated: 2026-03-31

## Goal

Deliver `V2` as the target production version of Nest with:

- robust daily operation on server and phone,
- true multi-user collaboration quality,
- advanced AI copilot and automation workflows,
- commercial and operational readiness for scale.

## Execution Artifacts for Implementation Agent

- Round protocol and quality/commit workflow:
  `docs/planning/v2-execution-roundbook.md`
- Detailed per-task implementation/test/commit cards:
  `docs/planning/v2-task-cards.md`

## Entry Gate

Execution of this plan starts after launch closure tasks are complete:

- `NEST-122` production launch window checklist,
- `NEST-123` Day0/Day1 operational validation,
- `NEST-124` Week1 stabilization summary and next wave decision.

## Workstream A: V1->V2 Reliability and Release Operations (`NEST-125..NEST-129`)

- [ ] NEST-125 Establish real-traffic observability baseline for V2 planning
  - Depends on: NEST-123
  - Done when:
    - production dashboards include real traffic baseline for API/web/mobile,
    - top 10 failure modes are quantified with frequency and impact,
    - V2 reliability priorities are published in operations docs.

- [x] NEST-126 Enforce SLO/error-budget workflow with automated gate checks
  - Depends on: NEST-125
  - Done when:
    - SLO checks block risky releases on budget burn,
    - alert routing and escalation ownership are explicit,
    - runbook includes recovery flow per breached SLO.

- [x] NEST-127 Implement progressive delivery for API/web (canary or blue-green)
  - Depends on: NEST-126
  - Done when:
    - deployment supports partial rollout and monitored promotion,
    - rollback path is automated and tested,
    - release evidence includes canary metrics before full rollout.

- [ ] NEST-128 Implement mobile staged rollout and rollback strategy
  - Depends on: NEST-126
  - Done when:
    - internal/beta/prod channels are documented and automated,
    - staged rollout percentages and halt criteria are defined,
    - rollback/revert procedure is tested on physical devices.

- [ ] NEST-129 Close V1.1 stabilization wave and open V2 execution gate
  - Depends on: NEST-127, NEST-128
  - Done when:
    - reliability risks from V1 launch period are resolved or accepted,
    - unresolved high risks have explicit mitigation tasks,
    - V2 execution gate sign-off is recorded.
  - Current status:
    - temporary NO-GO recorded in
      `docs/operations/v1_1_stabilization_gate_review_2026-03-31.md`.

## Workstream B: Offline-First and Cross-Device Continuity (`NEST-130..NEST-134`)

- [x] NEST-130 Deliver automatic background sync with adaptive retry/backoff
  - Depends on: NEST-129
  - Done when:
    - sync can run automatically in background on supported clients,
    - retry/backoff/jitter rules are deterministic,
    - user can still force manual sync and inspect recent outcome.

- [x] NEST-131 Add durable local sync scheduler for web/mobile
  - Depends on: NEST-130
  - Done when:
    - scheduler survives app restarts and transient network failures,
    - sync jobs are deduplicated and persisted safely,
    - monitoring includes scheduler lag and stuck-job detection.

- [x] NEST-132 Implement deterministic merge policy for offline conflicts (V2)
  - Depends on: NEST-130
  - Done when:
    - module-level merge strategy is documented (auto vs manual fields),
    - conflict resolution UI handles auto-merged and manual-merge states,
    - regressions cover multi-device concurrent edits.

- [x] NEST-133 Add encrypted local cache profile and retention controls
  - Depends on: NEST-131
  - Done when:
    - local offline data is encrypted at rest on supported clients,
    - cache retention/cleanup policy is configurable and documented,
    - secure wipe path exists for logout/account removal.

- [x] NEST-134 Ship offline chaos/regression suite for unstable network scenarios
  - Depends on: NEST-131, NEST-132, NEST-133
  - Done when:
    - automated test matrix covers packet loss, high latency, and reconnect storms,
    - key user flows pass in offline-first scenarios,
    - known limitations are documented with mitigation guidance.

## Workstream C: Collaboration and Communication V2 (`NEST-135..NEST-139`)

- [x] NEST-135 Expand collaboration model to shared household/workspace operations
  - Depends on: NEST-129
  - Done when:
    - shared ownership and role model supports family/friends workflows,
    - cross-user task/list/goal permissions are policy-enforced,
    - collaboration audits confirm tenant and membership boundaries.

- [x] NEST-136 Add shared planning workflows (assignment, handoff, reminders)
  - Depends on: NEST-135
  - Done when:
    - tasks/events can be assigned and handed over between members,
    - reminder ownership and visibility are explicit,
    - timeline/history captures assignment changes.

- [x] NEST-137 Deliver in-app notification center with actionable events
  - Depends on: NEST-136
  - Done when:
    - users can view grouped activity and pending actions in-app,
    - notification items deep-link to relevant module context,
    - read/unread and snooze behavior is consistent across clients.

- [x] NEST-138 Implement notification channel matrix (push/email/in-app)
  - Depends on: NEST-137
  - Done when:
    - per-channel and per-event preferences are configurable,
    - quiet hours and locale-aware delivery windows are supported,
    - delivery telemetry exists per channel with failure reasons.

- [x] NEST-139 Run collaboration safety and UX regression certification
  - Depends on: NEST-136, NEST-137, NEST-138
  - Done when:
    - permission and privacy regressions are validated,
    - collaboration UX smoke runs pass on desktop/mobile,
    - certification report is attached to release docs.

## Workstream D: AI Copilot V2 (`NEST-140..NEST-144`)

- [x] NEST-140 Build AI context graph across tasks/calendar/habits/goals/journal
  - Depends on: NEST-129
  - Done when:
    - context model unifies key entities and recent behavior signals,
    - retrieval payload is deterministic and versioned,
    - privacy and redaction rules are enforced in context assembly.

- [x] NEST-141 Deliver conversational copilot surface (web + mobile)
  - Depends on: NEST-140
  - Done when:
    - users can ask planning/execution questions in natural language,
    - responses include explainability and source references,
    - feature has graceful fallback when AI provider is unavailable.

- [x] NEST-142 Implement approval-gated AI actions (write operations)
  - Depends on: NEST-141
  - Done when:
    - AI can propose concrete mutations (create/update plans/tasks),
    - destructive or high-impact actions require explicit user approval,
    - audit trail records proposal, approval, and execution result.

- [x] NEST-143 Add proactive briefings (daily + weekly) with user controls
  - Depends on: NEST-141
  - Done when:
    - daily and weekly briefing templates are generated reliably,
    - briefing cadence and content scope are user-configurable,
    - notifications link directly to briefing summaries.

- [x] NEST-144 Deliver AI safety/evaluation harness for V2 copilot behaviors
  - Depends on: NEST-142, NEST-143
  - Done when:
    - regression suite covers policy, hallucination, and action-safety checks,
    - quality scorecard is produced for each release candidate,
    - release gate blocks promotion below minimum safety threshold.

## Workstream E: Integrations and Automation V2 (`NEST-145..NEST-148`)

- [x] NEST-145 Implement integration marketplace framework
  - Depends on: NEST-129
  - Done when:
    - providers can be discovered, connected, and managed from one catalog,
    - install/uninstall flows are auditable and reversible,
    - provider metadata and status are exposed in API contracts.

- [x] NEST-146 Add next-wave providers based on demand scoring
  - Depends on: NEST-145
  - Done when:
    - at least two high-priority providers are implemented end-to-end,
    - each new provider meets sync/idempotency/conflict quality bars,
    - provider rollout docs include limits and known caveats.

- [x] NEST-147 Add near-real-time sync triggers (webhooks/event ingestion)
  - Depends on: NEST-146
  - Done when:
    - webhook/event-driven sync paths exist where provider supports them,
    - deduplication and replay protection are enforced,
    - monitoring captures ingestion lag and dropped-event rates.

- [x] NEST-148 Deliver integration health center and auto-remediation playbooks
  - Depends on: NEST-147
  - Done when:
    - health center surfaces provider status, failures, and recovery hints,
    - common failures have one-click remediation or guided flows,
    - ops runbooks include provider-specific incident procedures.

## Workstream F: Commercial and V2 Release (`NEST-149..NEST-152`)

- [x] NEST-149 Expand billing to self-serve checkout/portal/dunning V2
  - Depends on: NEST-129
  - Done when:
    - checkout and subscription self-management are production-ready,
    - dunning and payment recovery flows are automated,
    - financial event audit trail is complete and reconciled.

- [ ] NEST-150 Implement activation, retention, and monetization analytics loops
  - Depends on: NEST-149
  - Done when:
    - funnel and retention metrics are tracked end-to-end,
    - experiment hooks support onboarding and pricing tests,
    - decision dashboard exists for weekly product iterations.

- [ ] NEST-151 Execute V2 production readiness review (perf/security/cost/ops)
  - Depends on: NEST-134, NEST-139, NEST-144, NEST-148, NEST-150
  - Done when:
    - cross-functional readiness packet is complete,
    - unresolved P0/P1 risks have explicit owner and mitigation,
    - go/no-go decision is documented with sign-offs.

- [ ] NEST-152 Execute V2 GA release and 30-day stabilization plan
  - Depends on: NEST-151
  - Done when:
    - V2 GA release is deployed and monitored,
    - day0/day1/week1/week4 checkpoints are executed,
    - next backlog wave (V2.1) is published with prioritized tasks.

## Quality Gates (Mandatory for every V2 task)

- Automated checks for changed scope (tests/lint/typecheck/build).
- Manual regression checks for impacted feature and UI (desktop/mobile).
- Unintended-change check (`git diff --name-only` + diff review).
- No DONE status without full DoD (`AGENTS.md`).

## Commit Standard

- Use Conventional Commits.
- Keep commits small and single-purpose.
- Never commit before passing quality gates.
- Update at least one context/documentation source per meaningful change:
  - `docs/`
  - `.codex/context/TASK_BOARD.md`
  - `.codex/context/PROJECT_STATE.md`
