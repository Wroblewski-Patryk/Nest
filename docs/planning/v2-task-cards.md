# V2 Task Cards (Executor Detailed Plan)

Last updated: 2026-03-21

Source order: `.codex/context/TASK_BOARD.md` (`NEST-125..NEST-152`).
Use together with `docs/planning/v2-execution-roundbook.md`.

## NEST-125

- Objective: baseline real production telemetry and failure hotspots.
- Implementation slices:
  - define dashboard pack and mandatory panels,
  - export first 7/14-day baseline,
  - publish reliability priority memo.
- Automated checks:
  - `powershell -ExecutionPolicy Bypass -File scripts/quality-gate.ps1 -AcknowledgeManualChecks`
- Manual checks:
  - verify dashboard values match raw logs/metrics sample,
  - verify top-10 failure list includes impact and owner.
- Commit:
  - `chore(obs): baseline production telemetry for v2 planning`

## NEST-126

- Objective: convert SLO/error-budget policy into release gate.
- Implementation slices:
  - add gate script/workflow step,
  - encode breach thresholds,
  - update runbook escalation path.
- Automated checks:
  - quality gate,
  - release workflow dry-run if changed.
- Manual checks:
  - simulate breached and healthy scenarios,
  - verify blocker behavior for breached state.
- Commit:
  - `ops(slo): enforce error-budget release gates`

## NEST-127

- Objective: enable progressive API/web delivery.
- Implementation slices:
  - add canary or blue-green rollout path,
  - add promotion criteria,
  - add rollback automation.
- Automated checks:
  - quality gate,
  - `scripts/release/deploy-api-web.ps1 -Environment staging -DryRun`.
- Manual checks:
  - verify partial rollout metrics collection,
  - verify rollback simulation.
- Commit:
  - `ops(release): add api-web progressive delivery`

## NEST-128

- Objective: staged mobile rollout and rollback controls.
- Implementation slices:
  - define channels and rollout percentages,
  - add halt criteria,
  - add rollback runbook.
- Automated checks:
  - quality gate,
  - `scripts/release/mobile-release.ps1 -Profile preview -DryRun`.
- Manual checks:
  - install and verify internal build on phone,
  - simulate rollback decision path.
- Commit:
  - `ops(mobile): add staged rollout and rollback flow`

## NEST-129

- Objective: close V1.1 stabilization and open V2 gate.
- Implementation slices:
  - aggregate unresolved risks,
  - capture acceptance/mitigation decisions,
  - publish V2 gate sign-off.
- Automated checks:
  - quality gate.
- Manual checks:
  - cross-check sign-off dependencies (`NEST-127`, `NEST-128`).
- Commit:
  - `docs(ops): publish v1.1 stabilization and v2 gate signoff`

## NEST-130

- Objective: automatic background sync.
- Implementation slices:
  - add scheduler trigger,
  - retry/backoff with jitter,
  - preserve manual force-sync override.
- Automated checks:
  - quality gate,
  - api tests if sync endpoints changed,
  - web/mobile checks for settings/state changes.
- Manual checks:
  - offline->online auto-sync path,
  - failure then retry path.
- Commit:
  - `feat(sync): add background auto-sync with adaptive retry`

## NEST-131

- Objective: durable local sync scheduler on clients.
- Implementation slices:
  - persist job queue metadata locally,
  - restart-safe scheduler state,
  - stuck-job detection signal.
- Automated checks:
  - quality gate,
  - mobile unit/smoke and web build when touched.
- Manual checks:
  - restart app during pending queue,
  - verify scheduler resumes without duplicates.
- Commit:
  - `feat(sync): add durable local sync scheduler`

## NEST-132

- Objective: deterministic offline merge policy.
- Implementation slices:
  - document field-level merge matrix,
  - implement auto/manual merge pathways,
  - update conflict UI states.
- Automated checks:
  - quality gate,
  - API conflict tests,
  - web/mobile smoke around conflict resolution.
- Manual checks:
  - concurrent edit on two clients,
  - verify identical output for same merge inputs.
- Commit:
  - `feat(sync): implement deterministic offline merge policy`

## NEST-133

- Objective: encrypted local cache and retention controls.
- Implementation slices:
  - add encrypted-at-rest storage adapter,
  - retention/cleanup policy hooks,
  - secure wipe flow.
- Automated checks:
  - quality gate,
  - mobile tests and API checks if key exchange/metadata touched.
- Manual checks:
  - inspect encrypted payload behavior,
  - verify wipe on logout/account removal.
- Commit:
  - `feat(security): add encrypted offline cache profile`

## NEST-134

- Objective: offline chaos suite.
- Implementation slices:
  - add unstable-network test scenarios,
  - capture pass/fail matrix,
  - document known limits.
- Automated checks:
  - quality gate,
  - run new chaos/regression suite.
- Manual checks:
  - packet loss and reconnect storm smoke run.
- Commit:
  - `test(sync): add offline chaos and reconnection regression suite`

## NEST-135

- Objective: collaboration model expansion.
- Implementation slices:
  - extend membership/role semantics,
  - enforce shared object permissions,
  - update API contracts and clients.
- Automated checks:
  - quality gate,
  - API policy tests,
  - web/mobile build checks.
- Manual checks:
  - shared workspace flow with two accounts,
  - tenant boundary checks.
- Commit:
  - `feat(collab): expand shared household workspace model`

## NEST-136

- Objective: assignment/handoff/reminder ownership workflows.
- Implementation slices:
  - add assign and handoff actions,
  - add ownership timeline,
  - align reminders with assignee visibility.
- Automated checks:
  - quality gate,
  - API feature tests,
  - client smoke for new interactions.
- Manual checks:
  - assign, reassign, handoff end-to-end.
- Commit:
  - `feat(collab): add assignment handoff and reminder ownership`

## NEST-137

- Objective: in-app notification center.
- Implementation slices:
  - grouped feed model,
  - deep links to source modules,
  - read/unread/snooze controls.
- Automated checks:
  - quality gate,
  - web/mobile tests for notification components/routes.
- Manual checks:
  - verify event->notification->deep-link flow.
- Commit:
  - `feat(notifications): add in-app notification center`

## NEST-138

- Objective: channel matrix (push/email/in-app).
- Implementation slices:
  - per-event and per-channel preferences,
  - quiet hours windows,
  - delivery telemetry.
- Automated checks:
  - quality gate,
  - API tests for preference model,
  - notification dispatch tests where available.
- Manual checks:
  - preference changes reflected immediately,
  - quiet-hours suppression validation.
- Commit:
  - `feat(notifications): add push-email-inapp channel matrix`

## NEST-139

- Objective: collaboration certification.
- Implementation slices:
  - permission regression pack,
  - UX parity smoke across devices,
  - publish certification report.
- Automated checks:
  - quality gate,
  - full collaboration regression suite.
- Manual checks:
  - key collaboration flows on web desktop/mobile + app.
- Commit:
  - `test(collab): run collaboration safety and ux certification`

## NEST-140

- Objective: AI context graph foundation.
- Implementation slices:
  - unify entity context assembly,
  - version context payload schema,
  - implement redaction filters.
- Automated checks:
  - quality gate,
  - API/unit tests for context builder.
- Manual checks:
  - verify sensitive fields are excluded,
  - verify deterministic context snapshot for same input.
- Commit:
  - `feat(ai): build unified context graph for copilot`

## NEST-141

- Objective: conversational copilot UI/API.
- Implementation slices:
  - add conversation endpoint/client layer,
  - add web/mobile copilot surface,
  - add provider fallback behavior.
- Automated checks:
  - quality gate,
  - API and client tests,
  - build/export checks.
- Manual checks:
  - ask/answer flow in web and mobile,
  - provider failure fallback UX.
- Commit:
  - `feat(ai): deliver conversational copilot surface`

## NEST-142

- Objective: approval-gated AI write actions.
- Implementation slices:
  - action proposal payload,
  - explicit approve/reject flow,
  - execution audit trail.
- Automated checks:
  - quality gate,
  - policy/action safety tests.
- Manual checks:
  - verify no write without approval,
  - verify audit entries for both accepted/rejected.
- Commit:
  - `feat(ai): add approval-gated write actions`

## NEST-143

- Objective: proactive briefings.
- Implementation slices:
  - daily/weekly summary generation,
  - user controls for cadence/scope,
  - notification/deep-link integration.
- Automated checks:
  - quality gate,
  - API tests for briefing generation.
- Manual checks:
  - verify schedule config and delivered summaries.
- Commit:
  - `feat(ai): add proactive daily and weekly briefings`

## NEST-144

- Objective: AI safety evaluation harness.
- Implementation slices:
  - policy and hallucination regression tests,
  - action safety checks,
  - scorecard and gate threshold.
- Automated checks:
  - quality gate,
  - full AI evaluation suite.
- Manual checks:
  - review low-score scenarios and expected block behavior.
- Commit:
  - `test(ai): add v2 copilot safety evaluation harness`

## NEST-145

- Objective: integration marketplace framework.
- Implementation slices:
  - provider catalog model,
  - install/uninstall workflow,
  - status and metadata API.
- Automated checks:
  - quality gate,
  - integration API suite and client build checks.
- Manual checks:
  - add/remove provider flow and state consistency.
- Commit:
  - `feat(integrations): build provider marketplace framework`

## NEST-146

- Objective: next-wave providers.
- Implementation slices:
  - choose top-demand providers,
  - add adapters/contracts/sync paths,
  - publish caveats and limits.
- Automated checks:
  - quality gate,
  - provider-specific regression tests.
- Manual checks:
  - connect and run first successful sync per provider.
- Commit:
  - `feat(integrations): add next-wave providers by demand score`

## NEST-147

- Objective: near-real-time sync triggers.
- Implementation slices:
  - webhook/event ingestion endpoints,
  - deduplication and replay guards,
  - ingestion observability.
- Automated checks:
  - quality gate,
  - integration tests for duplicate/replay events.
- Manual checks:
  - webhook replay simulation and lag review.
- Commit:
  - `feat(integrations): add webhook and event-driven sync triggers`

## NEST-148

- Objective: integration health center.
- Implementation slices:
  - provider health dashboard,
  - remediation actions/guides,
  - provider incident runbooks.
- Automated checks:
  - quality gate,
  - UI/API tests for health center endpoints/views.
- Manual checks:
  - simulate common provider failures and remediation path.
- Commit:
  - `feat(integrations): add health center and remediation playbooks`

## NEST-149

- Objective: self-serve billing V2.
- Implementation slices:
  - checkout and portal updates,
  - dunning automation,
  - financial audit completeness.
- Automated checks:
  - quality gate,
  - billing API/webhook tests.
- Manual checks:
  - trial->active->past_due->recovery path.
- Commit:
  - `feat(billing): expand self-serve checkout portal and dunning`

## NEST-150

- Objective: monetization analytics loops.
- Implementation slices:
  - activation and retention funnels,
  - experiment hooks,
  - weekly decision dashboard.
- Automated checks:
  - quality gate,
  - analytics ingestion and aggregation tests.
- Manual checks:
  - verify metric values against source data sample.
- Commit:
  - `feat(analytics): add activation retention monetization loops`

## NEST-151

- Objective: final V2 readiness review.
- Implementation slices:
  - collect perf/security/cost/ops packet,
  - resolve or accept open risks,
  - publish go/no-go sign-offs.
- Automated checks:
  - quality gate,
  - run release dry-run scripts.
- Manual checks:
  - explicit review meeting checklist completion.
- Commit:
  - `docs(release): publish v2 production readiness review`

## NEST-152

- Objective: V2 GA + 30-day stabilization.
- Implementation slices:
  - execute launch runbook,
  - monitor day0/day1/week1/week4,
  - publish V2.1 prioritized backlog.
- Automated checks:
  - quality gate,
  - post-deploy smoke and release scripts.
- Manual checks:
  - complete launch checklist and incident triage cadence.
- Commit:
  - `ops(release): execute v2 ga launch and 30-day stabilization`
