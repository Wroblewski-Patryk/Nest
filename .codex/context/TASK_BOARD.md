# TASK_BOARD

Last updated: 2026-03-19

## Backlog

- [x] NEST-098 Operationalize Stitch source-of-truth exception workflow
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-085, NEST-086
  - Done when:
    - task workflow explicitly supports Stitch-as-source exception path,
    - required approval evidence and project snapshot reference are mandatory,
    - implementation tasks cannot start without approved exception record.
  - Done on: 2026-03-19
  - Notes:
    - Added formal exception workflow contract in
      `docs/ux_stitch_source_of_truth_exception_workflow.md`.
    - Linked exception workflow from `docs/ux_ui_mcp_collaboration.md` and
      `AGENTS.md`.
    - Added explicit READY/blocking gates for Stitch source-of-truth exception
      records in UX planning/execution flow.

- [x] NEST-099 Add UX task template fields for MCP evidence and artifact source
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-098
  - Done when:
    - task template includes source-of-truth type (`figma|approved_snapshot`),
    - task template includes artifact reference and approval checkpoint fields,
    - review checklist enforces UX evidence gate from MCP collaboration standard.
  - Done on: 2026-03-19
  - Notes:
    - Extended `.codex/templates/task-template.md` with mandatory UX source and
      MCP evidence fields for UX/UI tasks.
    - Added explicit review checklist section enforcing UX evidence gate
      (artifact source, approval checkpoint, states, responsive, a11y, parity).
    - Updated `docs/ux_ui_mcp_collaboration.md` to require usage of the
      template UX evidence sections by Planning Agent.

- [x] NEST-100 Validate existing UX-heavy tasks against unified Stitch baseline
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-098, NEST-099
  - Done when:
    - existing UX-heavy tasks are audited for artifact parity requirements,
    - gaps are documented with remediation follow-ups,
    - board reflects pass/fail results for audited tasks.
  - Done on: 2026-03-19
  - Notes:
    - Audit delivered in
      `docs/ux_heavy_task_artifact_parity_audit_2026-03-19.md`.
    - Audited tasks: 9 (`PASS: 1`, `FAIL: 8`).
    - PASS:
      - `NEST-086` (approved Stitch baseline evidence complete).
    - FAIL:
      - `NEST-021`, `NEST-022`, `NEST-037`, `NEST-041`, `NEST-042`,
        `NEST-050`, `NEST-058`, `NEST-068` (missing full artifact parity
        evidence gates under current UX standard).
    - Follow-up remediation tasks added: `NEST-101`, `NEST-102`.

- [ ] NEST-101 Backfill UX evidence records for legacy UX-heavy tasks
  - Status: BACKLOG
  - Owner: Documentation Agent
  - Depends on: NEST-100
  - Done when:
    - each failed legacy UX-heavy task has explicit source-of-truth artifact
      reference recorded,
    - approval checkpoint references are added where required,
    - task notes include required state/responsive/a11y evidence links.

- [ ] NEST-102 Re-verify legacy UX-heavy implementations against approved baseline
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-101
  - Done when:
    - remediated legacy UX-heavy tasks are re-reviewed against approved Stitch
      baseline artifact(s),
    - pass/fail re-check results are recorded on the board,
    - unresolved gaps are converted into explicit execution tasks.

- [x] NEST-015 Implement journal and life areas module
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: journal and life area tagging/balance data are available.
  - Done on: 2026-03-15
  - Notes:
    - Delivered life areas CRUD endpoints (`/api/v1/life-areas`) with archived
      filtering support.
    - Delivered journal entries CRUD endpoints (`/api/v1/journal-entries`) with
      mood filtering and search.
    - Delivered tenant-scoped journal life area tagging via pivot table and
      feature tests for module behavior.

- [x] NEST-016 Implement internal calendar module
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: calendar planning/events work without external sync dependency.
  - Done on: 2026-03-15
  - Notes:
    - Delivered calendar event CRUD endpoints (`/api/v1/calendar-events`).
    - Added range/all-day/linked-entity filtering for event listing.
    - Added tenant-scoped validation for linked entities (`task`, `goal`,
      `routine`) and feature test coverage.

- [x] NEST-017 Implement integration infrastructure
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: adapters, mapping, idempotency, retry, and DLQ are in place.
  - Done on: 2026-03-15
  - Notes:
    - Added integration adapter registry baseline with `trello` and
      `google_tasks` adapters.
    - Added sync orchestration service with idempotency lock and `sync_mappings`
      upsert flow.
    - Added queued sync job with retry/backoff and dead-letter persistence in
      `integration_sync_failures`.

- [x] NEST-018 Deliver list/task integration baseline (Trello + Google Tasks)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-017
  - Done when: list/task sync baseline works for Trello and Google Tasks.
  - Done on: 2026-03-15
  - Notes:
    - Added authenticated endpoint to trigger list/task sync baseline:
      `POST /api/v1/integrations/list-task-sync`.
    - Added list/task provider sync flow for `trello` and `google_tasks` on top
      of integration job infrastructure and `sync_mappings`.
    - Added idempotent re-sync behavior (unchanged payloads skipped) with
      feature test coverage for provider sync and tenant scope.

- [x] NEST-019 Enforce no end-user AI surface in MVP
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-011
  - Done when: AI UI/public endpoints are disabled in MVP and documented.
  - Done on: 2026-03-15
  - Notes:
    - Added explicit MVP feature flag config with `AI_SURFACE_ENABLED=false`
      default in backend.
    - Added guard tests that enforce absence of public `/api/v1/ai/*` routes
      and verify AI endpoint pattern returns `404`.
    - Updated `docs/ai_layer.md` with MVP enforcement policy.

- [x] NEST-020 Add observability baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-017
  - Done when: logs, trace IDs, and core API/queue/sync metrics are active.
  - Done on: 2026-03-15
  - Notes:
    - Added API trace middleware with response header `X-Trace-Id` and logging
      context enrichment.
    - Added cache-based metric counter baseline for API, queue, and integration
      sync flows.
    - Added queue processed/failed hooks and observability feature tests.

- [x] NEST-021 Deliver web MVP screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Done when: MVP module screens work in web app.
  - Done on: 2026-03-16
  - Notes:
    - Replaced web shell with complete MVP navigation and screen set.
    - Delivered module screens for tasks/lists, habits/routines,
      goals/targets, journal/life areas, and calendar.
    - Verified frontend quality gates: `pnpm lint` and `pnpm build` pass with
      static routes generated for all MVP module pages.

- [x] NEST-022 Deliver mobile MVP screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Done when: MVP module screens work in mobile app.
  - Done on: 2026-03-16
  - Notes:
    - Replaced Expo template tabs with MVP module tab set.
    - Delivered mobile screens for tasks/lists, habits/routines,
      goals/targets, journal/life areas, and calendar.
    - Verified mobile web export build with
      `pnpm exec expo export --platform web`.

- [x] NEST-023 Align shared UX states and telemetry naming
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-021, NEST-022
  - Done when: loading/empty/error/success and telemetry naming are aligned.
  - Done on: 2026-03-16
  - Notes:
    - Extended shared types with aligned `UiAsyncState` and
      `TelemetryEventName` contracts.
    - Applied the same state labels and screen telemetry naming in both web and
      mobile clients.
    - Verified web and mobile build checks after alignment changes.

- [x] NEST-024 Integrate clients with shared API client/types
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-008, NEST-021, NEST-022
  - Done when: both clients use shared client/types end-to-end.
  - Done on: 2026-03-16
  - Notes:
    - Extended `@nest/shared-types` with typed API client contract and
      collection response types.
    - Integrated shared API client contract in both web and mobile apps with
      live `/lists` connectivity checks on tasks screens.
    - Verified client build checks (`pnpm lint`, `pnpm build`, Expo web export)
      after integration.

- [x] NEST-025 Add backend test suites
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016, NEST-017
  - Done when: unit/feature/integration tests cover core behavior.
  - Done on: 2026-03-16
  - Notes:
    - Added dedicated `Integration` test suite in `phpunit.xml`.
    - Added new unit tests for observability counter and integration adapter
      registry behavior.
    - Added end-to-end integration tests validating API task/list creation and
      provider sync pipeline idempotency.

- [x] NEST-026 Add frontend/mobile test suites
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-021, NEST-022, NEST-024
  - Done when: client unit/smoke tests cover critical paths.
  - Done on: 2026-03-16
  - Notes:
    - Added web unit contract and smoke route checks (`pnpm test:unit`,
      `pnpm test:smoke`).
    - Added mobile unit contract and smoke export route checks
      (`pnpm test:unit`, `pnpm test:smoke`).
    - Verified all new frontend/mobile test scripts pass.

- [x] NEST-027 Implement security baseline controls
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011, NEST-017
  - Done when: credential protection and dependency security checks are active.
  - Done on: 2026-03-16
  - Notes:
    - Added `integration_credentials` storage with encrypted token casts and
      tenant/user/provider uniqueness.
    - Added credential vault service supporting secure store, active lookup, and
      revoke flow.
    - Added feature tests validating encrypted-at-rest behavior and revoke
      protection.

- [x] NEST-028 Run backup and restore drill with documentation
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-020
  - Done when: backup/restore drill is executed and documented.
  - Done on: 2026-03-16
  - Notes:
    - Executed local backup/restore drill for API SQLite database snapshot.
    - Verified backup integrity with SHA256 checksum match.
    - Documented runbook and outcomes in `docs/backup_restore_drill.md`
      including observed RTO/RPO.

- [x] NEST-029 Finalize MVP release checklist and staging sign-off
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-018, NEST-019, NEST-025, NEST-026, NEST-027, NEST-028
  - Done when: MVP sign-off is recorded for agreed scope.
  - Done on: 2026-03-16
  - Notes:
    - Created formal MVP release checklist and staging sign-off artifact in
      `docs/mvp_release_checklist.md`.
    - Recorded scope, quality, security, and resilience gates as complete.
    - Added explicit sign-off record for MVP staging baseline.

- [x] NEST-030 Enforce quality gate before commit
  - Status: DONE
  - Owner: Review Agent
  - Depends on: none
  - Done when:
    - automated checks are defined and executed before commits,
    - manual regression checklist (feature + UI) is applied before commits,
    - unintended change detection (`git diff --name-only` + diff review) is
      part of commit workflow.
  - Done on: 2026-03-16
  - Notes:
    - Added local quality gate script (`scripts/quality-gate.ps1`) with scoped
      automated checks for API/web/mobile changes.
    - Added mandatory manual checklist acknowledgement gate.
    - Added untracked/staged/unstaged diff aggregation for unintended change
      review and documented workflow in `docs/quality_gate_workflow.md`.

- [x] NEST-031 Define post-MVP integration contract versioning strategy
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-029
  - Done when: provider contract/version policy and migration rules are
    documented and linked from integration docs.
  - Done on: 2026-03-16
  - Notes:
    - Defined post-MVP integration contract versioning strategy in
      `docs/integration_contract_versioning.md`.
    - Added explicit integration docs link to versioning strategy from
      `docs/integrations.md`.
    - Established migration, compatibility, deprecation, rollback, and
      validation rules for provider contract evolution.

- [x] NEST-032 Deliver Trello synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: list/task synchronization with Trello works with idempotency,
    mapping integrity, and audit trail.
  - Done on: 2026-03-16
  - Notes:
    - Added durable sync audit trail table/model (`integration_sync_audits`)
      for `success`, `duplicate_skipped`, and `failed` outcomes.
    - Enforced sync mapping integrity with conflict checks in integration sync
      service and unique internal mapping constraint in DB migrations.
    - Extended Trello integration coverage with tests validating idempotency,
      mapping integrity conflict protection, and audit persistence.

- [x] NEST-033 Deliver Google Tasks synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: list/task synchronization with Google Tasks works with retry/
    backoff and consistent field mappings.
  - Done on: 2026-03-16
  - Notes:
    - Hardened `GoogleTasksAdapter` with deterministic field mapping for
      `task_list` and `task` payloads and canonical `sync_hash` generation.
    - Extended sync metadata with mapping version and retry profile details
      persisted in integration audit trail.
    - Added tests for Google Tasks mapping consistency and retry/backoff
      profile coverage.

- [x] NEST-034 Deliver third list/task provider (demand-driven)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: one additional provider is selected by product demand and
    delivered with the same sync quality bar.
  - Done on: 2026-03-16
  - Notes:
    - Selected `todoist` as the demand-driven third list/task provider and
      integrated it into adapter registry and sync API validation.
    - Added deterministic Todoist mapping profile (`todoist.v1`) with canonical
      sync hash behavior and retry profile metadata.
    - Added unit and feature tests for Todoist sync behavior, mapping metadata,
      and end-to-end list/task synchronization.

- [x] NEST-035 Deliver Google Calendar synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033
  - Done when: calendar sync is delivered after list/task baseline and follows
    conflict/audit requirements.
  - Done on: 2026-03-16
  - Notes:
    - Added Google Calendar adapter (`google_calendar.v1`) and calendar sync
      API endpoint `POST /api/v1/integrations/calendar-sync`.
    - Delivered tenant/user-scoped calendar sync service with idempotent skip
      behavior and conflict-candidate detection for high-value event fields.
    - Persisted sync audit metadata for conflict detection and added dedicated
      unit/feature test coverage for calendar sync flows.

- [x] NEST-036 Deliver Obsidian synchronization as final provider in wave 1
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-035
  - Done when: markdown note sync is delivered as the last provider in initial
    integration sequence.
  - Done on: 2026-03-16
  - Notes:
    - Added Obsidian adapter (`obsidian.v1`) with journal entry to markdown note
      mapping and deterministic sync hashing.
    - Delivered authenticated journal sync API endpoint:
      `POST /api/v1/integrations/journal-sync` (`provider=obsidian`).
    - Added tenant/user-scoped journal sync service with idempotent re-sync
      behavior and audit metadata test coverage.

- [x] NEST-037 Implement conflict queue API + UI workflows
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036
  - Done when: users can review, accept, or override high-value field conflicts.
  - Done on: 2026-03-16
  - Notes:
    - Added persistent conflict queue domain (`integration_sync_conflicts`) with
      open/resolved lifecycle and resolution payload support.
    - Added conflict queue API routes for listing and resolving conflicts:
      `GET /api/v1/integrations/conflicts` and
      `POST /api/v1/integrations/conflicts/{conflictId}/resolve`.
    - Delivered web/mobile UI workflows on calendar screens to review open
      conflicts and execute `accept` or `override` actions.

- [x] NEST-038 Add deterministic conflict policy matrix by field/provider
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: documented policy is enforced in code and covered by tests.
  - Done on: 2026-03-16
  - Notes:
    - Added deterministic provider/field conflict matrix documentation in
      `docs/integration_conflict_policy_matrix.md`.
    - Implemented policy enforcement service used by conflict queue to persist
      only `manual_queue` fields.
    - Added unit and feature tests validating policy matrix output and queue
      filtering behavior for non-manual fields.

- [x] NEST-039 Add sync replay tooling for failed jobs
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: failed sync jobs can be replayed safely with idempotency guards.
  - Done on: 2026-03-16
  - Notes:
    - Added replay tracking metadata for failed sync records
      (`replay_count`, replay status/error/time, replay idempotency key).
    - Added replay tooling API routes:
      `GET /api/v1/integrations/failures` and
      `POST /api/v1/integrations/failures/{failureId}/replay`.
    - Added tenant/user-scoped replay service and feature tests covering list,
      replay success path, scope protection, and guest authorization.

- [x] NEST-040 Introduce sync SLOs and alert thresholds
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: SLO targets exist for success latency/error budget and alerting
    is configured.
  - Done on: 2026-03-16
  - Notes:
    - Added integration sync SLO config with success rate, p95 latency targets,
      and warning/critical alert thresholds.
    - Added integration sync SLO evaluation service and operational command
      `php artisan integrations:sync-slo-check` with severity-based signaling.
    - Added latency metric bucketing in sync flow plus unit/feature tests for
      SLO evaluation and command exit behavior.

- [x] NEST-041 Expose provider connection management in web and mobile
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036
  - Done when: users can connect/reconnect/revoke providers from both clients.
  - Done on: 2026-03-16
  - Notes:
    - Added provider connection management API:
      `GET /api/v1/integrations/connections`,
      `PUT /api/v1/integrations/connections/{provider}`,
      `DELETE /api/v1/integrations/connections/{provider}`.
    - Added tenant/user-scoped connection service on top of credential vault
      with explicit provider allowlist and reconnect/revoke behavior.
    - Added web and mobile calendar workflows to list providers and execute
      connect/reconnect/revoke actions, plus API/client contract updates and
      feature tests.

- [x] NEST-042 Add provider permission scope review screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-041
  - Done when: granted scopes are visible and least-privilege warnings are shown.
  - Done on: 2026-03-16
  - Notes:
    - Extended web provider connection UI with granted scope visibility per
      provider and least-privilege scope review messaging.
    - Extended mobile provider permissions UI with granted scope display and
      warning status for extra or missing scopes.
    - Added shared visual status treatment for scope review results
      (`scope-ok`/`scope-warn`) and validated web/mobile quality checks.

- [x] NEST-043 Add integration regression suite
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036, NEST-037
  - Done when: end-to-end sync scenarios for each provider run in CI.
  - Done on: 2026-03-16
  - Notes:
    - Added dedicated provider regression integration tests in
      `tests/Integration/IntegrationProviderRegressionTest.php` for Trello,
      Google Tasks, Todoist, Google Calendar (with conflict queue), and
      Obsidian.
    - Updated CI backend workflow to run `Integration`, `Unit`, and `Feature`
      suites explicitly, making provider regression execution visible and
      mandatory.
    - Added regression suite documentation in
      `docs/integration_regression_suite.md` and linked it from
      `docs/integrations.md`.

- [x] NEST-044 Deliver notifications first step (mobile push baseline)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-035
  - Done when: simple push notifications are available for key reminders, with
    explicit scope and delivery monitoring.
  - Done on: 2026-03-16
  - Notes:
    - Added mobile push device registration API with encrypted token storage
      and tenant/user-scoped revoke flow.
    - Added baseline reminder dispatch command
      (`notifications:send-mobile-reminders`) for task-due-today and
      calendar-upcoming reminders.
    - Added push delivery ledger + monitoring metrics
      (`notifications.push.sent`, `notifications.push.failed`) and feature
      tests for device management and dispatch behavior.

- [x] NEST-045 Phase 2 release sign-off
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-040, NEST-043, NEST-044
  - Done when: operational and product sign-off for integration expansion is
    recorded.
  - Done on: 2026-03-16
  - Notes:
    - Recorded formal Phase 2 release sign-off in
      `docs/phase2_release_signoff.md`.
    - Confirmed dependency gates (`NEST-040`, `NEST-043`, `NEST-044`) as
      complete and validated.
    - Documented operational checks, CI coverage, and product validation scope
      for integration expansion baseline.

- [x] NEST-046 Define analytics event taxonomy across modules
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-029
  - Done when: canonical event dictionary is documented and adopted in clients.
  - Done on: 2026-03-16
  - Notes:
    - Added canonical analytics taxonomy in `docs/analytics_event_taxonomy.md`.
    - Defined event envelope fields, naming rules, and module-level v1 event
      set.
    - Added rollout constraints for ingestion contracts and downstream
      insights/AI consumers.

- [x] NEST-047 Build analytics ingestion pipeline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-046
  - Done when: validated event ingestion, storage, and retention policy are in
    place.
  - Done on: 2026-03-16
  - Notes:
    - Added validated analytics ingestion endpoint:
      `POST /api/v1/analytics/events` with taxonomy allowlist checks.
    - Added durable analytics storage (`analytics_events`) with tenant/module/
      event indexes and ingestion metrics (`analytics.events.*`).
    - Added retention command `analytics:prune-events` and documented baseline
      in `docs/analytics_ingestion_pipeline.md`.

- [x] NEST-048 Create life-area balance score model (v1)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-047
  - Done when: scoring formula is documented, computed, and visible via API.
  - Done on: 2026-03-16
  - Notes:
    - Added insights endpoint
      `GET /api/v1/insights/life-area-balance` with configurable `window_days`
      (`1..180`) and tenant/user-scoped output.
    - Added `LifeAreaBalanceScoreService` to compute per-life-area balance
      rows and `global_balance_score` from journal/task/habit activity shares.
    - Added feature tests for formula baseline, tenant scoping, auth, and
      input validation plus model documentation in
      `docs/life_area_balance_score_model.md`.

- [x] NEST-049 Implement trends and insights API
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-047, NEST-048
  - Done when: weekly/monthly trend endpoints exist for tasks/habits/goals.
  - Done on: 2026-03-16
  - Notes:
    - Added trend endpoints:
      `GET /api/v1/insights/trends/tasks`,
      `GET /api/v1/insights/trends/habits`,
      `GET /api/v1/insights/trends/goals`.
    - Added bucketed trend aggregation service supporting `weekly`/`monthly`
      periods and configurable bucket count (`points`).
    - Added feature tests for bucket outputs, tenant/user scoping, validation,
      and auth plus baseline documentation in `docs/insights_trends_api.md`.

- [x] NEST-050 Deliver insights UI (web and mobile)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-049
  - Done when: users can view trends and life-area balance reports in both
    clients.
  - Done on: 2026-03-16
  - Notes:
    - Added web insights screen (`/insights`) with API-backed life-area
      balance and trend summaries plus failure-safe fallback snapshot.
    - Added mobile insights tab screen with the same insight payloads and
      shared telemetry naming (`screen.insights.view`).
    - Extended shared API client/types to include insights endpoints and
      documented UI baseline in `docs/insights_ui_baseline.md`.

- [x] NEST-051 Expand AI tools for weekly planning
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-019, NEST-049
  - Done when: AI can propose weekly plans with explicit constraints and
    explainable rationale.
  - Done on: 2026-03-16
  - Notes:
    - Added first AI planning endpoint:
      `POST /api/v1/ai/weekly-plan/propose`.
    - Added feature-gated AI middleware (`ai.surface`) and deterministic weekly
      planning service using tenant/user scoped task, habit, and goal signals.
    - Added feature tests for feature-flag gate, constraint-aware proposals,
      rationale payload, tenant scoping, and auth plus API documentation in
      `docs/ai_weekly_planning_api.md`.

- [x] NEST-052 Add explainability payloads for AI recommendations
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-051
  - Done when: AI responses include reason codes and source entities.
  - Done on: 2026-03-19
  - Notes:
    - Extended weekly planning response with explicit explainability envelope
      (`model_version`, `reason_code_counts`, `generated_at`).
    - Added per-item `reason_codes` and `source_entities` payloads for
      recommendation provenance.
    - Added/updated feature tests and explainability contract docs in
      `docs/ai_explainability_payloads.md`.

- [x] NEST-053 Add confidence scoring and guardrails for AI suggestions
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-052
  - Done when: low-confidence suggestions are gated and flagged for review.
  - Done on: 2026-03-19
  - Notes:
    - Extended weekly plan recommendations with per-item `confidence_score`
      and `guardrail_status`.
    - Added planner guardrail constraint (`min_confidence`) and review queue
      output (`review_items`) for low-confidence candidates.
    - Added feature tests and updated explainability/API docs to cover
      confidence guardrail behavior.

- [x] NEST-054 Introduce user feedback loop for AI outputs
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-051
  - Done when: users can rate accept/reject/edit suggestions and feedback is
    stored for quality tracking.
  - Done on: 2026-03-19
  - Notes:
    - Added AI feedback API endpoint `POST /api/v1/ai/feedback` under AI
      feature gate.
    - Added persistent feedback table/model (`ai_recommendation_feedback`) with
      tenant/user scope, decision type, reason codes, and optional edit payload.
    - Added feature tests for enabled/disabled gate, accept/edit/reject flows,
      validation, auth, and storage scope plus docs in
      `docs/ai_feedback_loop.md`.

- [x] NEST-055 Add assistant policy testing suite
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-053, NEST-054
  - Done when: policy, safety, and prompt regression tests run in CI.
  - Done on: 2026-03-19
  - Notes:
    - Added AI planning policy service with deterministic allow/block rules for
      privacy-boundary and wellbeing guardrails.
    - Added unit + feature regression tests for safe/blocked planning contexts
      and integrated policy assertions into weekly planning API tests.
    - Documented policy test suite baseline and CI execution scope in
      `docs/ai_policy_testing_suite.md`.

- [x] NEST-056 Define automation rule model (trigger/condition/action)
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-049
  - Done when: automation domain model and API contracts are documented.
  - Done on: 2026-03-19
  - Notes:
    - Added automation domain model spec in `docs/automation_rule_model.md`
      with trigger/condition/action entities and execution constraints.
    - Added OpenAPI draft contract
      `docs/openapi_automation_rules_v1.yaml` for rule CRUD and run listing.
    - Linked automation contract draft in `docs/api_contracts.md`.

- [x] NEST-057 Implement automation engine (v1)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-056
  - Done when: rules can execute against allowed module actions with audit logs.
  - Done on: 2026-03-19
  - Notes:
    - Added automation runtime tables/models (`automation_rules`,
      `automation_runs`) with tenant/user scope and action audit payloads.
    - Added automation API for rule CRUD, manual execution endpoint, and run
      listing under authenticated scope.
    - Added execution service with deterministic condition evaluation, allowed
      action dispatch, and persisted run outcomes plus feature tests and docs
      in `docs/automation_engine_v1.md`.

- [x] NEST-058 Deliver automation builder UI (web)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-057
  - Done when: users can create/activate/pause basic automations from web app.
  - Done on: 2026-03-19
  - Notes:
    - Added web route `/automations` with basic automation builder controls.
    - Added rule control actions (`create`, `activate/pause`, manual execute)
      and recent run visibility.
    - Extended shared/web/mobile API clients for automation endpoints and
      documented UI baseline in `docs/automation_builder_ui_web.md`.

- [x] NEST-059 Deliver automation execution history and debugging view
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-057
  - Done when: users can inspect runs, errors, and retries.
  - Done on: 2026-03-19
  - Notes:
    - Added automation run detail and replay API:
      `GET /automations/runs/{runId}`,
      `POST /automations/runs/{runId}/replay`.
    - Added web automation debugging view with run status filters, per-run
      action trace inspection, and replay controls.
    - Extended shared/web/mobile API clients with run detail/replay methods and
      documented debugging baseline in `docs/automation_execution_debugging_view.md`.

- [x] NEST-060 Phase 3 release sign-off
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-050, NEST-055, NEST-058, NEST-059
  - Done when: intelligence and automation scope passes release criteria.
  - Done on: 2026-03-19
  - Notes:
    - Recorded formal Phase 3 release sign-off in
      `docs/phase3_release_signoff.md`.
    - Confirmed quality gates for backend/web/mobile checks and test coverage.
    - Confirmed policy guardrails, AI feedback loop, and automation audit
      readiness for transition to Phase 4 hardening.

- [x] NEST-061 Implement strict tenant isolation verification suite
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-029
  - Done when: test matrix covers API, queue, and integration isolation paths.
  - Done on: 2026-03-19
  - Notes:
    - Added hard ownership verification in integration sync service for
      tenant/user-scoped internal entities (`task_list`, `task`,
      `calendar_event`, `journal_entry`).
    - Added `TenantIsolationVerificationTest` coverage for API access scope,
      integration sync payload rejection, and queue-path rejection for
      cross-tenant entity access.
    - Aligned integration/observability regression tests to use
      tenant-owned internal entities before sync execution.
    - Documented verification matrix in
      `docs/tenant_isolation_verification_suite.md`.

- [x] NEST-062 Add tenant-scoped data retention and deletion workflows
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: retention policies and deletion jobs are implemented and audited.
  - Done on: 2026-03-19
  - Notes:
    - Added tenant lifecycle policy config in
      `apps/api/config/tenant_data_lifecycle.php`.
    - Added audited retention and deletion services:
      `TenantDataRetentionService` and `TenantDataDeletionService`.
    - Added queued tenant deletion job:
      `apps/api/app/Jobs/DeleteTenantDataJob.php`.
    - Added lifecycle audit storage:
      `tenant_data_lifecycle_audits` migration and model.
    - Added operational commands:
      `tenants:retention-prune` and `tenants:delete-data` with
      `--dry-run`/`--json` and optional `--queue` deletion execution.
    - Added feature coverage in
      `apps/api/tests/Feature/TenantDataLifecycleCommandTest.php`.
    - Documented runbooks in
      `docs/tenant_data_lifecycle_workflows.md`.

- [x] NEST-063 Implement tenant-level usage limits and quotas
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: per-tenant limits are enforced with clear user-facing errors.
  - Done on: 2026-03-19
  - Notes:
    - Added tenant quota config in
      `apps/api/config/tenant_usage_limits.php`.
    - Added `TenantUsageQuotaService` and API middleware
      `EnforceTenantUsageQuota` for `POST` create endpoint enforcement.
    - Added structured quota error handling with
      `tenant_quota_exceeded` payload and HTTP `429`.
    - Enforced limits for lists, tasks, habits/logs, routines, goals,
      targets, life areas, journal entries, calendar events, and automation
      rules.
    - Added coverage in
      `apps/api/tests/Feature/TenantUsageLimitApiTest.php`.
    - Documented baseline in
      `docs/tenant_usage_limits_and_quotas.md`.

- [x] NEST-064 Implement invite-based family/friends collaboration spaces
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: shared plans/lists, co-management flows, and private-vs-shared
    permission boundaries are implemented and tested.
  - Done on: 2026-03-19
  - Notes:
    - Added collaboration domain model:
      `collaboration_spaces`, `collaboration_space_members`,
      `collaboration_invites`.
    - Added collaboration APIs for space creation, invite issuance/acceptance,
      and sharing lists/goals into spaces.
    - Added shared visibility controls for `task_lists` and `goals` via
      `visibility` + `collaboration_space_id`.
    - Added co-management access for shared resources across list/task and
      goal/target API flows while preserving private-vs-shared boundaries.
    - Added feature coverage in
      `apps/api/tests/Feature/CollaborationSpacesApiTest.php`.
    - Documented baseline in `docs/collaboration_spaces_v1.md`.

- [x] NEST-065 Define plans, entitlements, and billing events model
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-029
  - Done when: pricing/entitlement schema and lifecycle states are documented.
  - Done on: 2026-03-19
  - Notes:
    - Added billing model baseline in
      `docs/billing_entitlements_model.md`.
    - Documented plan structure, entitlement types, and lifecycle states.
    - Added canonical billing event taxonomy and normalized event envelope.
    - Added billing API contract draft in
      `docs/openapi_billing_events_v1.yaml`.
    - Linked new contract from `docs/api_contracts.md`.

- [x] NEST-066 Implement subscription lifecycle backend
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-065
  - Done when: trial/active/past-due/canceled lifecycle is fully supported.
  - Done on: 2026-03-19
  - Notes:
    - Added billing persistence model and migration:
      `billing_plans`, `billing_plan_entitlements`, `tenant_subscriptions`,
      `tenant_billing_events`.
    - Added lifecycle service
      `App\Billing\Services\SubscriptionLifecycleService` with guarded state
      transitions and normalized billing event recording.
    - Added billing subscription API controller and lifecycle endpoints:
      show/start-trial/activate/past-due/cancel.
    - Added feature coverage in
      `apps/api/tests/Feature/BillingSubscriptionLifecycleApiTest.php`.
    - Documented implementation in
      `docs/billing_subscription_lifecycle_backend.md`.

- [x] NEST-067 Implement billing provider integration and webhook handling
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-066
  - Done when: invoicing/payment events are synchronized reliably and audited.
  - Done on: 2026-03-19
  - Notes:
    - Added Stripe webhook integration endpoint:
      `POST /api/v1/billing/providers/stripe/webhook`.
    - Added webhook processing service with signature validation,
      subscription status synchronization, and normalized billing event writes.
    - Added idempotent webhook receipt audit model/table:
      `billing_webhook_receipts`.
    - Added configuration baseline in `apps/api/config/billing.php`.
    - Added feature coverage in
      `apps/api/tests/Feature/BillingWebhookApiTest.php`.
    - Documented operations in
      `docs/billing_provider_webhook_integration.md`.

- [x] NEST-068 Deliver billing and plan management UI
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-066, NEST-067
  - Done when: users can manage plan, billing details, and invoices.
  - Done on: 2026-03-19
  - Notes:
    - Added billing events API endpoint (`GET /api/v1/billing/events`) for
      tenant-scoped invoice/event history listing.
    - Extended shared API client contracts with billing subscription and event
      operations.
    - Delivered web billing management route in
      `apps/web/src/app/billing/page.tsx`.
    - Delivered mobile billing tab screen in
      `apps/mobile/app/(tabs)/billing.tsx`.
    - Added billing module navigation/snapshot updates for web and mobile.
    - Documented UI baseline in `docs/billing_ui_management.md`.

- [x] NEST-069 Implement entitlement enforcement across API/tools
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-066
  - Done when: gated features respect plan limits in all clients and APIs.
  - Done on: 2026-03-19
  - Notes:
    - Added entitlement service and middleware:
      `EntitlementService`, `EnforceBillingEntitlements`.
    - Enforced plan gate/limit rules for:
      AI weekly planning, AI feedback, and automation rule creation limit.
    - Added explicit entitlement error payloads for denied or limit-exceeded
      requests.
    - Added feature tests in
      `apps/api/tests/Feature/EntitlementEnforcementApiTest.php`.
    - Documented enforcement baseline in
      `docs/entitlement_enforcement_api_tools.md`.

- [x] NEST-070 Add organization/workspace domain model
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: org/workspace membership model is implemented with migrations.
  - Done on: 2026-03-19
  - Notes:
    - Added organization/workspace migrations:
      `organizations`, `organization_members`, `workspaces`,
      `workspace_members`.
    - Added domain models and API baseline controller for org/workspace
      create/list/member flows.
    - Added tenant-scoped organization/workspace endpoints under `/api/v1`.
    - Added feature coverage in
      `apps/api/tests/Feature/OrganizationWorkspaceDomainApiTest.php`.
    - Documented baseline in
      `docs/organization_workspace_domain_model.md`.

- [x] NEST-071 Implement org roles and permission matrix (RBAC)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-070
  - Done when: role assignments and policy checks are enforced by API.
  - Done on: 2026-03-19
  - Notes:
    - Added centralized org policy matrix service:
      `OrganizationRbacService`.
    - Enforced role checks for org member management and workspace creation.
    - Added organization member role update endpoint:
      `PATCH /api/v1/orgs/{organizationId}/members/{memberUserId}`.
    - Added RBAC-focused feature coverage in
      `apps/api/tests/Feature/OrganizationRbacApiTest.php`.
    - Documented policy matrix in
      `docs/organization_rbac_matrix.md`.

- [x] NEST-072 Implement OAuth providers for B2C auth expansion
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-071
  - Done when: Google/Apple (or approved set) login works with tenant-safe
    account linking and security controls.
  - Done on: 2026-03-19
  - Notes:
    - Added OAuth provider exchange endpoint:
      `POST /api/v1/auth/oauth/{provider}/exchange`.
    - Added secure id_token verification with provider JWK lookup and issuer/
      audience/expiry checks.
    - Added tenant-safe account linking with verified-email enforcement and
      ambiguous-email protection requiring `tenant_slug`.
    - Added OAuth identity persistence model (`oauth_identities`) and
      feature tests in `apps/api/tests/Feature/OAuthProviderAuthApiTest.php`.
    - Documented implementation in `docs/oauth_b2c_auth_expansion.md`.

- [x] NEST-073 Implement SSO (OIDC/SAML) for organization plans
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-071
  - Done when: supported enterprise auth flows are production-ready.
  - Done on: 2026-03-19
  - Notes:
    - Added organization SSO provider and identity domain tables:
      `organization_sso_providers`, `organization_sso_identities`.
    - Added org-scoped SSO provider management API with RBAC gate
      `org.sso.manage`.
    - Added organization SSO exchange endpoint for OIDC id_token and SAML
      signed assertion bridge token flows.
    - Added tenant-safe identity linking, organization membership checks, JIT
      auto-provision toggle, and domain allowlist enforcement.
    - Added feature coverage in
      `apps/api/tests/Feature/OrganizationSsoApiTest.php`.
    - Documented implementation in `docs/organization_sso_oidc_saml.md`.

- [x] NEST-074 Add audit export package for organization compliance
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-071
  - Done when: export includes security-sensitive events in documented formats.
  - Done on: 2026-03-19
  - Notes:
    - Added organization compliance export endpoint:
      `GET /api/v1/orgs/{organizationId}/audit-exports`.
    - Added JSON and CSV export formats with optional date window filters.
    - Added normalized audit export service covering org membership changes,
      org SSO provider changes, org SSO identity links, and tenant lifecycle
      audit events.
    - Added RBAC permission gate `org.audit.export` (owner/admin).
    - Added feature coverage in
      `apps/api/tests/Feature/OrganizationAuditExportApiTest.php`.
    - Documented implementation in
      `docs/organization_audit_export_package.md`.

- [x] NEST-075 Add advanced secrets and key rotation operations
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: automated key rotation and credential revoke paths are tested.
  - Done on: 2026-03-19
  - Notes:
    - Added secret rotation audit storage:
      `secret_rotation_audits`.
    - Added automated secret rotation command:
      `secrets:rotate` with tenant scope and dry-run/json output.
    - Added scoped credential revoke command:
      `secrets:credentials:revoke` with tenant/provider/user filters and dry-run/json output.
    - Added secret rotation service that re-encrypts integration credentials,
      mobile push tokens, and organization SSO signing secrets.
    - Added feature coverage in
      `apps/api/tests/Feature/SecretRotationOperationsCommandTest.php`.
    - Documented operations in
      `docs/secrets_rotation_and_revocation_ops.md`.

- [x] NEST-076 Introduce security control verification suite
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-071, NEST-072, NEST-073, NEST-075
  - Done when: recurring security control checks run in CI and staging.
  - Done on: 2026-03-19
  - Notes:
    - Added security controls config baseline:
      `apps/api/config/security_controls.php`.
    - Added verification service and command:
      `SecurityControlVerificationService`,
      `php artisan security:controls:verify`.
    - Implemented warning/critical severity evaluation with strict mode.
    - Added CI backend step to execute security control verification command.
    - Added feature coverage in
      `apps/api/tests/Feature/SecurityControlVerificationCommandTest.php`.
    - Documented suite in `docs/security_control_verification_suite.md`.

- [x] NEST-077 Implement performance and load test harness
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-063, NEST-069
  - Done when: representative load scenarios and thresholds are defined.
  - Done on: 2026-03-19
  - Notes:
    - Added API load harness scenario file:
      `apps/api/tests/Performance/k6-load-harness.js`.
    - Added local execution script:
      `scripts/performance/run-k6-harness.ps1`.
    - Defined read/write scenario profiles with latency and error-rate
      thresholds.
    - Added runbook and baseline guidance in
      `docs/performance_load_test_harness.md`.

- [x] NEST-078 Execute resilience tests (backup/restore/failover drills)
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-062, NEST-077
  - Done when: drill outcomes and corrective actions are documented.
  - Done on: 2026-03-19
  - Notes:
    - Executed local backup integrity drill with SHA256 verification.
    - Executed retention workflow dry-run and queue recovery drill for tenant
      deletion dry-run path.
    - Identified local schema drift during drill and applied corrective action
      (`php artisan migrate --force`) before rerun.
    - Documented outcomes and corrective actions in
      `docs/resilience_drills_2026-03-19.md`.

- [x] NEST-079 Introduce release train and change management workflow
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-077
  - Done when: regular release cadence and quality gates are institutionalized.
  - Done on: 2026-03-19
  - Notes:
    - Added release-train GitHub workflow:
      `.github/workflows/release-train.yml`.
    - Added release gating sequence with backend tests and security controls
      verification.
    - Added optional staging-oriented readiness gates (SLO, retention dry-run,
      secrets rotation dry-run).
    - Added local change-management checklist helper:
      `scripts/release/release-train-checklist.ps1`.
    - Documented workflow in
      `docs/release_train_change_management.md`.

- [x] NEST-080 Final readiness review for full-product launch
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-068, NEST-074, NEST-076, NEST-078, NEST-079
  - Done when: launch checklist is approved by product, engineering, and
    operations.
  - Done on: 2026-03-19
  - Notes:
    - Final readiness packet completed in
      `docs/final_readiness_review_2026-03-19.md`.
    - Product, engineering, and operations approvals recorded in readiness
      review packet.

- [x] NEST-081 Full-product launch milestone
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-080
  - Done when: full product scope is released and monitored in production.
  - Done on: 2026-03-19
  - Notes:
    - Launch milestone recorded in
      `docs/full_product_launch_milestone_2026-03-19.md`.
    - Post-launch monitoring actions captured for immediate follow-up cycle.

- [x] NEST-083 Deliver post-MVP hardening plan from architecture/code audit
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-040
  - Done when:
    - audit findings are translated into sequenced implementation tasks,
    - each task has acceptance criteria and dependency mapping,
    - execution order is defined with P0/P1/P2 priorities.
  - Done on: 2026-03-16
  - Notes:
    - Source audit: `docs/architecture_programming_scalability_ai_audit_2026-03-16.md`
    - Hardening plan delivered in `docs/post_mvp_hardening_plan.md`.
    - Includes sequenced P0/P1/P2 tasks with dependencies, acceptance criteria,
      and execution order.

- [x] NEST-082 Resolve documentation phase sequencing inconsistencies
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: none
  - Done when: AI and integration sequencing are consistent across roadmap,
    MVP scope, AI layer, and implementation plans.
  - Done on: 2026-03-16
  - Notes:
    - Aligned AI sequencing to start with first end-user surface in Phase 3.
    - Clarified that Phase 2 remains integration-only and AI surface stays
      disabled there.
    - Clarified MVP vs post-MVP integration scope wording in `docs/mvp_scope.md`.

- [x] NEST-084 Run strict architecture/programming/scalability/AI-readiness audit
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-040
  - Done when:
    - architecture and implementation are reviewed against documentation,
    - high-impact risks are prioritized by severity,
    - follow-up split is prepared for planning chat and execution chat.
  - Done on: 2026-03-16
  - Notes:
    - Audit delivered in
      `docs/architecture_programming_scalability_ai_audit_2026-03-16.md`.
    - Includes prioritized findings and recommended sequencing for next phases.

- [x] NEST-085 Establish UX/UI MCP collaboration standard
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-021, NEST-023
  - Done when: AI-to-AI UX workflow is documented, linked from frontend
    strategy, and embedded in agent operating contract.
  - Done on: 2026-03-16
  - Notes:
    - Added UX/UI MCP operating standard in
      `docs/ux_ui_mcp_collaboration.md`.
    - Linked UX/UI MCP standard from `docs/frontend_strategy.md`.
    - Updated `AGENTS.md` with mandatory UX/UI MCP contract for all agents.

- [x] NEST-086 Build unified Stitch UX/UI approval baseline before implementation
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-085
  - Done when:
    - one coherent Stitch design system and full screen set are generated,
    - UX/UI spec and acceptance criteria are documented in `docs/`,
    - user explicitly approves Stitch baseline before any implementation starts.
  - Done on: 2026-03-19
  - Notes:
    - Design-only phase; no web/mobile code changes allowed.
    - Baseline spec documented in `docs/ux_ui_stitch_unified_spec_v1.md`.
    - Verified Stitch project baseline: `projects/14952238901582428681`.
    - Added and verified missing baseline screens:
      `1c4d38cf15b44887882973973a7c5c26` (Morning Briefing),
      `f81dbf00a9b5489cb72377a2ad454ec0` (Weekly Report).
    - User approval for baseline captured in thread on `2026-03-19`.

- [x] NEST-087 Fix integration sync idempotency correctness (P0)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-084, NEST-083
  - Done when:
    - changed list/task/journal payloads are not skipped by stale lock state,
    - exact replay duplicates remain safely deduplicated,
    - regression tests cover changed-vs-unchanged payload behavior.
  - Done on: 2026-03-19
  - Notes:
    - Source audit finding: P0 idempotency correctness.
    - Execution handoff:
      `docs/audit_remediation_execution_handoff_2026-03-19.md`.
    - Updated idempotency lock fingerprint to include payload-level hash while
      preserving replay deduplication semantics for exact payload replays.
    - Added feature regressions for changed-vs-unchanged sync payload behavior:
      `IntegrationListTaskSyncApiTest` and `IntegrationJournalSyncApiTest`.
    - Validation: `php artisan test --testsuite=Feature --env=testing` passed.

- [x] NEST-088 Convert sync endpoints to enqueue-first execution (P1)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-087
  - Done when:
    - sync endpoints enqueue work and return quickly,
    - provider execution runs in workers (not request thread),
    - queue retry/failure/audit behavior remains verifiable.
  - Done on: 2026-03-19
  - Notes:
    - Converted list/task, calendar, and journal sync services to queue-first
      dispatch on `database` connection queue `integrations`.
    - API response now exposes async execution metadata (`mode`,
      `sync_request_id`, `job_references`).
    - Updated feature tests to validate enqueue-first semantics and drain queue
      workers before asserting audit/mapping side effects.
    - Validation: `php artisan test --testsuite=Feature --env=testing` passed.

- [x] NEST-089 Implement chunked tenant sync processing (P1)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-088
  - Done when:
    - sync services avoid full-table `get()` fetches,
    - chunk/cursor processing is bounded and tested,
    - integration tests cover chunk boundary behavior.
  - Done on: 2026-03-19
  - Notes:
    - Replaced full dataset sync loads with `chunkById` bounded processing in:
      list/task, journal, and calendar sync services.
    - Added chunk-boundary feature tests:
      `IntegrationListTaskSyncApiTest`,
      `IntegrationJournalSyncApiTest`,
      `IntegrationCalendarSyncApiTest`.
    - Validation: `php artisan test --testsuite=Feature --env=testing` passed.

- [x] NEST-090 Align runtime baseline with PostgreSQL/Redis docs (P1)
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-083
  - Done when:
    - env/config defaults and setup guidance match documented architecture,
    - doc/runtime drift for DB+queue+cache baseline is removed.
  - Done on: 2026-03-19
  - Notes:
    - Updated `apps/api/.env.example` to PostgreSQL + Redis defaults.
    - Updated config defaults:
      `apps/api/config/database.php`, `apps/api/config/queue.php`.
    - Added explicit PostgreSQL/Redis local bring-up guidance in
      `docs/development_and_deployment.md`.
    - Added runtime default summary in `docs/system_architecture.md`.
    - Validation: `php artisan test --testsuite=Feature --env=testing` passed.

- [x] NEST-091 Complete OpenAPI coverage and CI enforcement (P2)
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-088
  - Done when:
    - all public route groups are represented in maintained OpenAPI specs,
    - CI validates all maintained specs (not only one contract).
  - Done on: 2026-03-19
  - Notes:
    - Added maintained OpenAPI draft for uncovered public route groups:
      `docs/openapi_auth_integrations_platform_v1.yaml`.
    - Updated API contract index in `docs/api_contracts.md` with expanded
      coverage map.
    - Updated CI OpenAPI validation to lint all maintained
      `docs/openapi_*.yaml` contracts (not only a single file).

- [x] NEST-092 Converge web/mobile on shared runtime API client (P2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-091
  - Done when:
    - duplicated app-local request client logic is removed,
    - both clients use shared runtime client implementation only.
  - Done on: 2026-03-19
  - Notes:
    - Removed duplicated `createClient` runtime implementations from:
      `apps/web/src/lib/api-client.ts` and
      `apps/mobile/constants/apiClient.ts`.
    - Both apps now instantiate shared runtime client directly via
      `createNestApiClient` from `@nest/shared-types`.
    - Validation: `pnpm test:unit` passed in both `apps/web` and `apps/mobile`.

- [x] NEST-093 Normalize pagination meta contract shape (P2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-091
  - Done when:
    - `perPage` vs `per_page` mismatch is resolved with documented policy,
    - contract + implementation + tests are aligned.
  - Done on: 2026-03-19
  - Notes:
    - Canonicalized shared pagination meta contract to `meta.per_page` in
      `packages/shared-types/src/index.d.ts`.
    - Kept optional `meta.perPage` as deprecated transitional alias for
      compatibility.
    - Documented canonical pagination naming policy in `docs/api_contracts.md`.
    - Validation: web and mobile TypeScript checks passed.

- [x] NEST-094 Define and implement soft-delete uniqueness policy (P2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-083
  - Done when:
    - recreate-after-delete behavior is deterministic and documented,
    - schema/index + tests reflect the selected policy.
  - Done on: 2026-03-19
  - Notes:
    - Defined canonical policy: recreate-after-delete is allowed for
      user-facing name domains.
    - Added migration
      `2026_03_19_200000_update_soft_delete_uniqueness_for_lists_and_life_areas.php`
      to include `deleted_at` in unique keys for `life_areas` and `task_lists`.
    - Updated validation rules in `TaskListController` and
      `LifeAreaController` to enforce uniqueness on active rows only.
    - Added recreate-after-soft-delete feature regressions in
      `TasksAndListsApiTest` and `JournalAndLifeAreasApiTest`.
    - Documented policy in `docs/mvp_database_schema.md`.

- [x] NEST-095 Consolidate policy-layer authorization (P2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-088
  - Done when:
    - key route groups use explicit authorization policies,
    - policy behavior is covered by tests with tenant isolation checks.
  - Done on: 2026-03-19
  - Notes:
    - Added explicit policy classes:
      `LifeAreaPolicy`,
      `IntegrationSyncConflictPolicy`,
      `IntegrationSyncFailurePolicy`.
    - Registered policies in `AppServiceProvider` via `Gate::policy(...)`.
    - Added explicit `authorize(...)` checks in
      `LifeAreaController`, `IntegrationConflictController`, and
      `IntegrationSyncReplayController`.
    - Added policy-enforcement tenant isolation regressions in:
      `IntegrationConflictQueueApiTest` and `IntegrationSyncReplayApiTest`.
    - Documented policy-layer baseline in `docs/system_architecture.md`.

- [x] NEST-096 Harden AI-readiness response/error contracts (P2)
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-091, NEST-093
  - Done when:
    - machine-readable envelope and error taxonomy are documented + versioned,
    - deterministic retry/error guidance is testable for tool/agent clients.
  - Done on: 2026-03-19
  - Notes:
    - Added standardized API error envelope for `api/*` responses with:
      `error.code`, `error.retryable`, `error.http_status`,
      `error.details`, and `meta.contract_version`.
    - Implemented deterministic taxonomy handlers for
      `validation_failed`, `auth_required`, `forbidden`,
      `resource_not_found`, `tenant_quota_exceeded`, and `rate_limited`.
    - Added shared contract types `ApiErrorCode` and `ApiErrorEnvelope` in
      `packages/shared-types/src/index.d.ts`.
    - Added contract regression suite:
      `apps/api/tests/Feature/ApiErrorEnvelopeContractTest.php`.
    - Documented versioned AI/tool error contract and retry guidance in
      `docs/ai_tool_api_error_contract_v1.md` and linked from `docs/ai_layer.md`.

- [x] NEST-097 Prepare execution handoff for audit remediation wave
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-083, NEST-084
  - Done when:
    - remediation tasks are sequenced for direct execution by another agent,
    - each task includes scope, dependencies, and done conditions.
  - Done on: 2026-03-19
  - Notes:
    - Handoff prepared in
      `docs/audit_remediation_execution_handoff_2026-03-19.md`.
    - Wave defined as `NEST-087` to `NEST-096` (P0->P2 order).

## In Progress

- [ ] (none)

## Blocked

- [ ] (none)

## Done

- [x] NEST-000 Create documentation and architecture baseline
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15

- [x] NEST-001 Define monorepo structure and directory layout
  - Status: DONE
  - Owner: Planning Agent
  - Done on: 2026-03-15
  - Notes: approved structure documented in `docs/monorepo_structure.md`.

- [x] NEST-002 Bootstrap backend Laravel app skeleton
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Laravel app bootstrapped in `apps/api`.
    - Health endpoint available at `GET /health`.
    - Baseline tests pass (`php artisan test`).

- [x] NEST-003 Bootstrap web app shell (Next.js)
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Next.js app shell bootstrapped in `apps/web` (TypeScript + App Router).
    - Base layout present in `apps/web/app/layout.tsx`.
    - Production build passes (`pnpm build` in `apps/web`).

- [x] NEST-004 Bootstrap mobile app shell (Expo)
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Expo app shell bootstrapped in `apps/mobile` (Expo Router tabs template).
    - Base navigation available via tabs routes.
    - Web export/build passes (`pnpm exec expo export --platform web`).

- [x] NEST-005 Define API contract v1 for tasks and lists
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15
  - Notes:
    - OpenAPI draft created in `docs/openapi_tasks_lists_v1.yaml`.
    - Contract is referenced from `docs/api_contracts.md` and
      `docs/backend_strategy.md`.

- [x] NEST-006 Configure minimum CI pipeline
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - GitHub Actions workflow added: `.github/workflows/ci.yml`.
    - Includes lint/test/build/security checks for backend, web, and mobile.
    - Includes OpenAPI contract validation for `docs/openapi_tasks_lists_v1.yaml`.

- [x] NEST-007 Define API contract v1 for remaining MVP modules
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15
  - Notes:
    - OpenAPI draft created in `docs/openapi_core_modules_v1.yaml`.
    - Covers habits/routines, goals/targets, journal, life areas, and calendar.
    - Referenced from `docs/api_contracts.md` and `docs/backend_strategy.md`.

- [x] NEST-008 Create shared API/domain types package
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Shared package created in `packages/shared-types` as `@nest/shared-types`.
    - Web and mobile apps consume shared types via local package dependency.
    - Type/build checks pass for both apps with shared package usage.

- [x] NEST-009 Design PostgreSQL schema for MVP domain
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Tenant-ready MVP schema migrated with FK constraints and composite indexes.
    - Includes sync mapping entity baseline (`sync_mappings`).
    - Schema documented in `docs/mvp_database_schema.md`.

- [x] NEST-010 Create migrations and baseline seed data
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Added reference dictionary migration (`task_statuses`, `task_priorities`,
      `life_area_templates`).
    - Added baseline dictionary seeder (`ReferenceDictionarySeeder`).
    - `migrate:fresh --seed` passes with baseline tenant/user and life areas.

- [x] NEST-011 Implement auth and user settings
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Sanctum installed and token table migrated for UUID users.
    - API auth endpoints delivered (`register`, `login`, `logout`, `me`).
    - User settings update endpoint delivered (`PATCH /api/v1/auth/settings`).

- [x] NEST-012 Implement tasks and lists module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered list CRUD endpoints (`/api/v1/lists`).
    - Delivered task CRUD endpoints (`/api/v1/tasks`).
    - Added filter/sort/pagination for task listing and tenant-scoped access.

- [x] NEST-013 Implement habits and routines module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered habits CRUD + logging endpoints (`/api/v1/habits`, `/logs`).
    - Delivered routines CRUD endpoints with ordered step sequences.
    - Added tenant-scoped feature tests for habits/routines module.

- [x] NEST-014 Implement goals and targets module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered goals CRUD endpoints (`/api/v1/goals`).
    - Delivered targets CRUD endpoints (`/api/v1/targets`).
    - Added measurable target update flow and tenant-scoped feature tests.
