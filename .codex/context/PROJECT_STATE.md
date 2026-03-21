# PROJECT_STATE

Last updated: 2026-03-21

## Product

- Name: Nest (LifeOS)
- Goal: unified life orchestration platform with AI support
- Commercial intent: SaaS
- Current strategic priority: maximize practical day-to-day usefulness for the
  founder user.
- Product horizon priority: long-term life management foundation that prepares
  structured context for future conversational AI agent operation.
- V1 delivery priority policy: optimize first for founder usability, while
  keeping architecture scalable and extensible for later AI expansion.
- V1 quality priority policy: stability, test coverage, and security validation
  take precedence over shipping speed for new features.
- Core user value model (v1): reduce stress/chaos, strengthen execution
  consistency, and maintain strong planning control as equal outcomes.
- UX complexity policy (v1): target a balanced middle-ground with simple
  default interface and sufficient, non-overwhelming configurability.
- Monetization staging: current phase runs on free tier; target model is
  `free/basic/advanced` with limits and permissions to be calibrated in later
  phases.

## Product Decisions (Confirmed)

- Tenancy: multi-tenant architecture from day one
- Tenancy data model (v1): shared PostgreSQL database with row-level isolation
  via `tenant_id` across tenant-scoped tables
- Launch mode: one active user (founder)
- Audience: private users first, then family/friends shared collaboration
- Product positioning: personal life-management system (not enterprise/corporate
  workflow tooling); collaboration direction is family/friends context.
- Planning hierarchy: goals -> targets -> lists/tasks -> habits/routines ->
  calendar -> journal
- Core loop priority model (v1): tasks/lists, calendar planning, and
  habits/routines are equally critical and intentionally interconnected as one
  unified daily workflow.
- Planning/execution/reflection model (v1): planning and execution are
  first-class together with reflection/insight loops (journal + analytics) as
  one connected lifecycle.
- V1 foundation policy: product and data model decisions must support future
  human+agent collaboration workflows without redesigning core domain entities.
- Feature integration policy (v1): every new capability must integrate cleanly
  with existing modules and shared contracts before release.
- Client parity policy (v1): no functional differences between web and mobile
  for end-user core modules in current phase.
- Admin surface policy: subscription/user administration is planned as
  web-only surface in a later phase and is not required in current single-user
  operation mode.
- Offline behavior policy (v1): user changes made offline are queued locally
  and synchronized by explicit manual action from sync options (automatic
  background sync is disabled by default).
- Offline sync ordering policy (v1): manual synchronization processes queued
  offline changes sequentially from oldest to newest.
- Manual sync scope policy (v1): force sync runs for all pending changes
  globally (no per-module selection in v1); scoped sync may be added later.
- Manual sync failure policy (v1): synchronization stops on first error and
  presents clear reason/context to user for corrective action before retry.
- Manual sync retry policy (v1): retry starts from queue beginning, verifies
  already-synced items via idempotency checks, skips sent items, and syncs only
  missing/pending items.
- Manual sync success feedback policy (v1): successful sync uses the same
  standard success notification pattern as other completed actions in app.
- Sync visibility policy (v1): no persistent sync status element in primary UI;
  sync controls are available in settings/options, including a manual "force
  sync" action.
- Conflict resolution policy (v1): when both local and remote versions change
  the same record, user is shown base/local/remote values in context and
  chooses final resolution manually.
- Conflict recommendation policy (v1): conflict UI is neutral by default and
  does not auto-recommend a winning version.
- Project scope in this workspace: documentation and delivery decisions in this
  repository apply only to Nest; Cryptosparrow is handled independently.
- Product reach and localization: Nest is a global product with multi-language
  support and locale-aware user settings (language, region, formatting, and
  culturally-aware defaults).
- Localization rollout policy (v1): multilingual capability is implemented in
  code from day one; default language is English (`en`), and Polish (`pl`) is
  the first additionally deployed language.
- Timezone preference policy (v1): timezone is configured per user account and
  is independent from workspace defaults.
- Week-start preference policy (v1): first day of week is user-configurable,
  with locale-based default value.
- Time format policy (v1): clock format is user-configurable (for example 12h
  or 24h).
- Number and currency formatting policy (v1): defaults are inferred from user
  locale, with user-level override support.
- Measurement units policy (v1): defaults are inferred from user locale
  (metric/imperial), with user-level override support.
- Localization detection policy (v1): onboarding proposes the most accurate
  defaults from available signals and granted permissions; if no reliable
  signal is available, user sets localization preferences manually.
- Localization preferences apply behavior (v1): all localization setting
  changes apply immediately after save in active session without restart or
  re-login.
- Localization preference source-of-truth (v1): backend-stored user profile
  settings synchronized across web and mobile clients.
- Localization profile scope (v1): one shared user localization profile across
  all devices; no per-device localization overrides.
- Language initialization flow (v1): default language is set during onboarding
  and remains editable later in account settings.
- Content language policy (v1): account language is the single enforced
  language for user experience, including UI copy, validation messages, and
  system-generated content; mixed-language behavior is not supported.
- User-generated content translation policy (v1): user-authored content (for
  example list names, task titles, notes) is never auto-translated when account
  language changes; localization applies only to system/UI surfaces.
- Outbound communication localization policy (v1): system emails and push
  notifications are sent in the current account language of the user.
- Outbound template strategy (v1): communication templates share one structural
  layout across languages; localized text and optional localized graphics may
  vary per language.
- Onboarding localization confirmation (v1): first-run onboarding includes a
  simplified language selection step with detected language preselected and a
  single primary continue action.
- Onboarding friction policy (v1): localization setup is optimized for minimal
  clicks and only essential account configuration before entering the app.
- Onboarding entry requirement (v1): a short onboarding step is required before
  first app access, with minimum mandatory fields `language` and `display
  name`.
- Post-onboarding navigation (v1): user lands directly on the main dashboard;
  guided quick setup is planned for a future release.
- Pre-auth localization access (v1): language selection is available from the
  very beginning on authentication screens (sign in/sign up), before login.
- Localization consistency policy (v1): one unified localization-detection and
  default-selection mechanism is used across pre-auth, onboarding, and in-app
  flows.
- Localization settings persistence policy (v1): store only current effective
  localization preferences; no dedicated localization change history is kept.
- Account locale baseline policy (v1): one default account-level locale profile
  (language, region, formatting preferences) is the shared default for all
  modules.
- Localization reset policy (v1): no dedicated "reset to defaults" action;
  users manage localization preferences by editing individual settings.
- RTL support policy (v1): right-to-left language support is deferred to a
  future phase after v1.
- Region initialization policy (v1): region is auto-detected during onboarding
  and remains user-editable in settings.
- Region change side-effect policy (v1): changing region does not
  auto-adjust other localization preferences (currency/number formats/units).
- Translation storage policy (v1): system translation resources are maintained
  in-repository with application code; no external translation management
  platform is used in v1.
- Translation rollout quality gate (v1): a new language can be released only
  after reaching at least 90% translation key coverage.

## Platform Strategy

- Web app: desktop/tablet/mobile browser
- Mobile app: tablet/phone native
- Feature parity required for core modules

## Technical Baseline

- Backend: Laravel 12 + PHP 8.4
- Database: PostgreSQL 17 default (18 where stable in provider)
- Cache/Queue: Redis
- Web: Next.js 16 + React 19.2 + TypeScript 5.x
- Mobile: Expo SDK 55 + React Native + TypeScript 5.x
- Local default ports: API `9000`, Web `9001`

## Current Phase

- Architecture and documentation foundation complete
- Planning baseline complete for MVP and full-product roadmap
- Next execution wave plan documented in
  `docs/planning/next_execution_wave_2026-03-21.md`
- `NEST-001` completed: monorepo structure approved and documented in
  `docs/engineering/monorepo_structure.md`
- `NEST-002` completed: Laravel backend skeleton bootstrapped in `apps/api`
  with health endpoint (`GET /health`) and passing baseline tests
- `NEST-003` completed: Next.js web shell bootstrapped in `apps/web` with
  baseline layout and passing production build
- `NEST-004` completed: Expo mobile shell bootstrapped in `apps/mobile` with
  base tabs navigation and passing web export build
- `NEST-005` completed: OpenAPI v1 draft for tasks/lists created in
  `docs/engineering/contracts/openapi_tasks_lists_v1.yaml` and referenced from docs
- `NEST-006` completed: minimum CI pipeline configured in
  `.github/workflows/ci.yml` (backend/web/mobile checks + security + OpenAPI validation)
- `NEST-007` completed: OpenAPI v1 draft for remaining MVP modules created in
  `docs/engineering/contracts/openapi_core_modules_v1.yaml` and referenced from docs
- `NEST-008` completed: shared API/domain package created in
  `packages/shared-types` and consumed by both web and mobile clients
- `NEST-009` completed: tenant-ready MVP PostgreSQL schema migrated with FK and
  index baseline (`apps/api/database/migrations/2026_03_15_230000_create_mvp_domain_tables.php`)
- `NEST-010` completed: baseline dictionary migration and seed data added
  (`task_statuses`, `task_priorities`, `life_area_templates`) with successful
  `migrate:fresh --seed` verification
- `NEST-011` completed: email/password auth and user settings API implemented
  with Sanctum token authentication
- `NEST-012` completed: tasks/lists API with CRUD + filter/sort/pagination and
  tenant isolation checks
- `NEST-013` completed: habits/routines API with habit logging and routine step
  sequences, covered by feature tests
- `NEST-014` completed: goals/targets API with CRUD and measurable progress
  update support, covered by feature tests
- `NEST-015` completed: journal/life areas API with CRUD, mood/search filtering,
  archived life area support, and tenant-scoped journal tagging
- `NEST-016` completed: internal calendar events API with CRUD, planning window
  filters, and tenant-scoped linked entity validation
- `NEST-017` completed: integration infrastructure baseline with provider
  adapter registry, sync mapping/idempotency service, queued retries, and DLQ
  persistence
- `NEST-018` completed: list/task integration baseline for `trello` and
  `google_tasks` with authenticated sync trigger and idempotent re-sync
- `NEST-019` completed: MVP AI surface guard enforced with default-off feature
  flag, route-level absence checks, and documented policy
- `NEST-020` completed: observability baseline with API trace IDs, queue/sync
  counters, and middleware + queue event instrumentation
- `NEST-021` completed: web MVP module screens delivered for tasks/lists,
  habits/routines, goals/targets, journal/life areas, and calendar
- `NEST-022` completed: mobile MVP module screens delivered in Expo tabs for
  tasks/lists, habits/routines, goals/targets, journal/life areas, and calendar
- `NEST-023` completed: shared UX states and telemetry naming aligned across
  web/mobile clients through common type contracts
- `NEST-024` completed: web/mobile clients integrated with shared API client
  contract and shared domain response types
- `NEST-025` completed: backend unit/feature/integration suite baseline
  expanded with integration pipeline coverage
- `NEST-026` completed: frontend/mobile client unit and smoke checks added for
  UX contract and MVP route coverage
- `NEST-027` completed: integration credential security baseline added with
  encrypted token vault and revoke coverage tests
- `NEST-028` completed: backup/restore drill executed and documented with local
  integrity and recovery metrics
- `NEST-029` completed: MVP release checklist finalized with staging baseline
  sign-off record
- `NEST-030` completed: pre-commit quality gate workflow enforced with script,
  manual checklist acknowledgement, and diff review support
- `NEST-082` completed: documentation sequencing aligned so Phase 2 remains
  integration-focused and first end-user AI surface starts in Phase 3
- `NEST-085` completed: UX/UI MCP collaboration standard added with
  Figma-first design-source policy, optional Stitch ideation role, and
  evidence-gated UX implementation/review workflow
- `NEST-086` completed: unified Stitch UX/UI approval baseline finalized in
  Stitch with documented evidence and user approval before implementation
  (`docs/ux/ux_ui_stitch_unified_spec_v1.md`)
- `NEST-107` completed: approved "Mix Ideal" Nest design system baseline
  captured as canonical documentation and linked into Stitch/playbook/frontend
  strategy (`docs/ux/nest_os_design_system_mix_ideal_v1.md`)
- `NEST-108` completed: Stitch unified screen workflow operationalized for active
  Mix Ideal v2 cycle, including screen registry, playbook execution contract,
  and unified spec source/evidence update to project
  `projects/11122321523690086751`
- `NEST-087` completed: integration sync idempotency now distinguishes changed
  payloads while safely deduplicating exact replays, with feature regressions
  for list/task and journal sync flows
- `NEST-088` completed: integration sync API endpoints now operate in
  enqueue-first async mode, returning job references while provider execution
  runs in queue workers
- `NEST-089` completed: list/task, journal, and calendar sync candidate
  traversal now uses bounded chunk processing to avoid full-table sync loads
- `NEST-090` completed: backend runtime defaults and setup guidance aligned to
  PostgreSQL + Redis baseline across env/config/docs
- `NEST-091` completed: OpenAPI coverage expanded for auth/integrations/platform
  route groups and CI now lints all maintained OpenAPI contracts
- `NEST-092` completed: web and mobile now instantiate only shared runtime API
  client from `@nest/shared-types` with duplicated local client logic removed
- `NEST-093` completed: shared pagination contract now uses canonical
  `meta.per_page` with an optional deprecated `meta.perPage` compatibility alias
- `NEST-094` completed: soft-delete uniqueness policy implemented so list and
  life-area names can be recreated after archival with schema + validation
  alignment
- `NEST-095` completed: explicit policy-layer authorization added for life
  areas, integration conflict resolution, and failed-sync replay paths
- `NEST-096` completed: versioned machine-readable API error envelope and
  retry taxonomy added for AI/tool client compatibility
- `NEST-098` completed: Stitch source-of-truth exception workflow formalized
  with mandatory approval evidence, snapshot reference, and implementation
  blocking rules
- `NEST-099` completed: UX task template now requires MCP source/artifact
  evidence fields and review evidence-gate checklist
- `NEST-100` completed: legacy UX-heavy tasks audited against unified Stitch
  baseline evidence requirements (`PASS: 1`, `FAIL: 8`) with remediation
  follow-up tasks created
- `NEST-101` completed: legacy UX-heavy tasks now have backfilled UX evidence
  records with approved snapshot source references, approval checkpoint linkage,
  and state/responsive/a11y evidence pointers
- `NEST-102` completed: remediated legacy UX-heavy tasks re-reviewed against
  approved baseline (`PASS: 0`, `FAIL: 8`), with explicit execution follow-up
  tasks defined for parity, responsive, accessibility, and fix cycle closure
- `NEST-104` completed: legacy UX-heavy accessibility verification outputs are
  now documented per task (keyboard/focus, semantic labels, contrast checks)
- `NEST-105` completed: legacy UX-heavy responsive verification outputs are now
  documented per task (desktop/tablet/mobile outcomes)
- `NEST-103` completed: deterministic parity capture pipeline now publishes
  web/mobile evidence packs and visual diff index for legacy UX-heavy tasks
  (`docs/ux_parity_evidence/2026-03-21/artifact-index.md`,
  `docs/ux_parity_evidence/2026-03-21/capture-manifest.json`,
  `docs/ux_parity_evidence/2026-03-21/web/*.png`,
  `docs/ux_parity_evidence/2026-03-21/mobile/*.png`)
- `NEST-106` completed: web/mobile legacy UX parity fix waves are implemented,
  parity captures refreshed, and closure report confirms source/parity/state/
  responsive/a11y evidence gate coverage for legacy UX-heavy task set
  (`docs/ux/legacy_ux_evidence_gate_closure_2026-03-21.md`)
- `NEST-109` completed: localization foundation baseline (`en` + `pl`) is now
  active across API/web/mobile with shared runtime helpers, deterministic
  language/locale fallback, and locale-aware date-time formatting baseline
  (`docs/modules/localization_foundation_v1.md`)
- `NEST-110` completed: pre-auth language selection + onboarding localization
  preference flow are active with required `display_name` and `language` fields
  and immediate preference-apply behavior (`docs/modules/onboarding_localization_preference_flow_v1.md`)
- `NEST-111` completed: offline queue + manual force-sync baseline is active in
  web/mobile options surfaces with oldest-first processing and stop-on-first-
  error behavior (`docs/modules/offline_queue_manual_force_sync_baseline_v1.md`)
- `NEST-112` completed: manual retry sync baseline and conflict comparison UI
  are active in web/mobile with base/local/remote values and explicit user
  resolution actions (`docs/modules/manual_sync_retry_conflict_resolution_baseline_v1.md`)
- `NEST-113` completed: full UX evidence gate re-run confirms `PASS 8/8` for
  legacy UX-heavy task set (`docs/ux/full_ux_evidence_gate_rerun_2026-03-21.md`)
- `NEST-114` completed: planning status checkboxes in
  `docs/planning/implementation_plan_full.md` are reconciled to task-board
  completion state (`docs/planning/planning_status_reconciliation_2026-03-21.md`)
- `NEST-121` completed: MVP offline/manual-sync policy wording is aligned across
  product overview/scope and project context
  (`docs/product/offline_policy_alignment_2026-03-21.md`)
- `NEST-031` completed: post-MVP integration contract versioning strategy
  documented with compatibility, migration, rollback, and deprecation rules and
  linked from integration docs
- `NEST-032` completed: Trello sync reliability hardened with durable audit
  trail (`integration_sync_audits`) and strict sync mapping integrity checks
  with dedicated test coverage
- `NEST-033` completed: Google Tasks sync hardened with deterministic payload
  mapping, canonical sync hashing, and audit metadata for mapping version and
  retry profile
- `NEST-034` completed: demand-driven third list/task provider selected as
  Todoist with adapter registration, API support, and sync quality parity tests
- `NEST-035` completed: Google Calendar sync baseline added with dedicated
  calendar sync endpoint, audit metadata, and conflict-candidate detection for
  high-value event fields
- `NEST-036` completed: Obsidian sync baseline added for journal markdown note
  export with dedicated journal sync endpoint and audit-backed idempotent flow
- `NEST-037` completed: conflict queue API and UI workflows added for review
  and resolution (`accept`/`override`) of high-value sync conflicts across web
  and mobile calendar surfaces
- `NEST-038` completed: deterministic provider/field conflict policy matrix
  documented and enforced in queue logic with dedicated unit/feature coverage
- `NEST-039` completed: failed sync replay tooling added with tenant/user
  scoped failure listing, safe replay API, replay metadata tracking, and
  idempotency key rotation for deterministic reprocessing
- `NEST-040` completed: integration sync SLO baseline added with success
  rate/p95 latency targets, error budget burn evaluation, warning/critical
  thresholds, and runtime check command (`integrations:sync-slo-check`)
- `NEST-041` completed: provider connection management delivered across API,
  web, and mobile with tenant/user-scoped connect, reconnect, and revoke flows
  plus shared client contract coverage
- `NEST-042` completed: provider permission scope review screens added in web
  and mobile with granted scope visibility and least-privilege warnings for
  extra or missing permissions
- `NEST-043` completed: provider end-to-end integration regression suite added
  and enforced in CI with explicit Integration/Unit/Feature suite execution
- `NEST-044` completed: mobile push notification baseline delivered with
  device registration API, reminder dispatch command, explicit reminder scope,
  and delivery monitoring metrics/logging
- `NEST-045` completed: Phase 2 integration expansion release sign-off recorded
  with operational and product validation baseline
- `NEST-084` completed: strict architecture/programming/scalability/AI-readiness
  audit delivered with prioritized hardening recommendations and implementation
  sequencing (`docs/planning/architecture_programming_scalability_ai_audit_2026-03-16.md`)
- `NEST-083` completed: post-MVP hardening plan translated from audit into
  sequenced P0/P1/P2 implementation backlog with dependencies and acceptance
  criteria (`docs/planning/post_mvp_hardening_plan.md`)
- `NEST-046` completed: analytics event taxonomy documented with canonical
  envelope, naming rules, and v1 cross-module event dictionary
  (`docs/modules/analytics_event_taxonomy.md`)
- `NEST-047` completed: analytics ingestion pipeline delivered with validated
  ingest API, durable event storage, and retention command baseline
- `NEST-048` completed: life-area balance scoring baseline delivered with
  formula-driven API endpoint, tenant/user scoped aggregation, and feature
  coverage
- `NEST-049` completed: trends API delivered for tasks/habits/goals with
  weekly/monthly bucket aggregation, tenant/user scope controls, and feature
  coverage
- `NEST-050` completed: insights UI delivered in web and mobile clients with
  life-area balance/trend API integration and fallback snapshots
- `NEST-051` completed: AI weekly planning baseline delivered with
  feature-gated API endpoint, explicit constraints, and rationale-backed
  proposal items
- `NEST-052` completed: AI recommendation responses now include reason codes
  and source-entity provenance payloads with explainability metadata
- `NEST-053` completed: AI planning suggestions now include confidence scoring
  and low-confidence guardrail routing to review queue
- `NEST-054` completed: AI feedback loop delivered with persistent
  accept/reject/edit recommendation tracking under tenant/user scope
- `NEST-055` completed: assistant policy regression suite delivered for AI
  planning context safety/guardrail rules with CI-backed coverage
- `NEST-056` completed: automation trigger/condition/action model and API
  contract draft documented for upcoming engine implementation
- `NEST-057` completed: automation engine delivered with rule CRUD, manual
  execution, and persisted execution run audits
- `NEST-058` completed: web automation builder delivered with rule creation,
  active/paused toggles, manual execution, and recent run visibility
- `NEST-059` completed: automation execution history and debugging view
  delivered with run filtering, detail inspection, and replay flow
- `NEST-060` completed: Phase 3 release sign-off approved for intelligence and
  automation scope with quality/policy gates confirmed
- `NEST-061` completed: tenant isolation verification suite delivered with API,
  integration, and queue path coverage plus strict sync entity ownership checks
  (`docs/security/tenant_isolation_verification_suite.md`)
- `NEST-062` completed: tenant-scoped retention and deletion workflows
  delivered with audited lifecycle logs, queue-backed tenant deletion, and
  command-line operations (`docs/modules/tenant_data_lifecycle_workflows.md`)
- `NEST-063` completed: tenant-level usage limits and quotas delivered with
  middleware-based create-path enforcement, structured quota errors, and
  tenant-scoped API coverage (`docs/modules/tenant_usage_limits_and_quotas.md`)
- `NEST-064` completed: invite-based collaboration spaces delivered with
  shared list/goal co-management, invite acceptance flow, and private-vs-shared
  access boundaries (`docs/modules/collaboration_spaces_v1.md`)
- `NEST-065` completed: plans, entitlements, and billing event model
  documented with lifecycle states and draft billing event contract
  (`docs/modules/billing_entitlements_model.md`, `docs/engineering/contracts/openapi_billing_events_v1.yaml`)
- `NEST-066` completed: subscription lifecycle backend delivered for
  trialing/active/past_due/canceled flows with tenant billing event audit
  logging (`docs/modules/billing_subscription_lifecycle_backend.md`)
- `NEST-067` completed: billing provider webhook integration delivered with
  Stripe webhook processing, idempotent receipt audit trail, and synchronized
  invoice/subscription status updates
  (`docs/modules/billing_provider_webhook_integration.md`)
- `NEST-068` completed: billing and plan management UI delivered across web
  and mobile with subscription actions and billing event history surfaces
  (`docs/modules/billing_ui_management.md`)
- `NEST-069` completed: entitlement enforcement delivered for API/tooling
  feature gates and plan limits with structured denial payloads
  (`docs/security/entitlement_enforcement_api_tools.md`)
- `NEST-070` completed: organization/workspace domain model delivered with
  tenant-scoped memberships, migrations, and baseline org/workspace API flows
  (`docs/modules/organization_workspace_domain_model.md`)
- `NEST-071` completed: org RBAC matrix delivered with API-enforced owner/admin/member
  policy checks and role update flow (`docs/security/organization_rbac_matrix.md`)
- `NEST-072` completed: OAuth B2C expansion delivered with provider
  allowlist (`google`, `apple`), id_token signature/claim verification,
  tenant-safe account linking safeguards, and feature coverage
  (`docs/security/oauth_b2c_auth_expansion.md`)
- `NEST-073` completed: organization SSO expansion delivered with
  OIDC + SAML provider model, tenant-safe identity linking, org membership
  enforcement, and enterprise exchange endpoint coverage
  (`docs/security/organization_sso_oidc_saml.md`)
- `NEST-074` completed: organization audit export package delivered with
  RBAC-gated JSON/CSV export endpoint and normalized security event schema
  for compliance workflows (`docs/security/organization_audit_export_package.md`)
- `NEST-075` completed: advanced secrets rotation and credential revoke
  operations delivered with audited command workflows and scoped execution
  controls (`docs/security/secrets_rotation_and_revocation_ops.md`)
- `NEST-076` completed: recurring security control verification suite
  delivered with command-based control checks, severity gating, CI baseline
  integration, and staging-ready strict mode
  (`docs/security/security_control_verification_suite.md`)
- `NEST-077` completed: performance/load harness delivered with k6 scenario
  baseline, thresholded read/write profiles, and operational run script
  (`docs/engineering/performance_load_test_harness.md`)
- `NEST-078` completed: resilience drills executed and documented with backup
  integrity checks, queue recovery validation, and corrective actions for
  local schema drift (`docs/operations/resilience_drills_2026-03-19.md`)
- `NEST-079` completed: release train and change-management workflow
  delivered with gated release pipeline, checklist baseline, and release
  manifest traceability (`docs/operations/release_train_change_management.md`)
- `NEST-080` completed: final readiness review approved with product,
  engineering, and operations gates accepted
  (`docs/operations/final_readiness_review_2026-03-19.md`)
- `NEST-081` completed: full-product launch milestone declared with post-launch
  monitoring baseline (`docs/operations/full_product_launch_milestone_2026-03-19.md`)
- `NEST-097` completed: audit remediation execution handoff prepared with
  strict task order, ownership, and DoD for implementation agents
  (`docs/operations/audit_remediation_execution_handoff_2026-03-19.md`)
- Current execution focus: complete deploy readiness wave for server + phone
  (`NEST-115` to `NEST-120`).

## Auth, AI, Offline, Notifications

- MVP auth: email + password
- OAuth providers: post-MVP
- AI: post-MVP rollout, default ON when introduced
- Offline: local offline queue with manual force-sync in settings/options
- Notifications: mostly post-MVP, simplest mobile push can be first

## Integrations Direction

- Sequence: list/task providers first (Trello + Google Tasks + Todoist),
  then Google Calendar, Obsidian last
- Long-term: up to 3 major providers per functional area where practical

## Planning Baseline

- MVP execution backlog: `docs/planning/implementation_plan_mvp.md`
- Full-product execution backlog: `docs/planning/implementation_plan_full.md`
- Roadmap overview: `docs/product/roadmap.md`
- Next execution wave: `docs/planning/next_execution_wave_2026-03-21.md`
- MVP execution track: `docs/planning/mvp-execution-plan.md`
- V1 launch track: `docs/planning/v1-live-release-plan.md`

## Confirmed Decisions (2026-03-15)

- MVP launch profile: single active user on top of multi-tenant architecture.
- MVP auth: email + password only; OAuth providers are post-MVP.
- MVP AI policy: no end-user AI surface in MVP.
- Integration sequence: list/task providers first (Trello + Google Tasks +
  Todoist),
  Google Calendar after baseline, Obsidian as the last provider in initial
  wave.

## Working Agreements

- Every meaningful change must update at least one of:
  `docs/`, `.codex/context/TASK_BOARD.md`, `.codex/context/PROJECT_STATE.md`.
- Before each commit, run available automated checks for changed areas
  (tests/lint/typecheck/build where applicable).
- Before each commit, run manual regression checks for changed behavior and UI
  (desktop/mobile where applicable).
- Validate no unintended file changes before commit (`git diff --name-only` and
  diff review).
- Use Conventional Commits and keep commits small, single-purpose, and scoped.
- Do not mark tasks as DONE unless Definition of Done is fully satisfied
  (output + acceptance criteria + board status + updated project state).

## Canonical Docs

- `docs/product/overview.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/tech-stack.md`
- `docs/architecture/database_decision.md`
- `docs/architecture/frontend_strategy.md`
- `docs/ux/ux_ui_mcp_collaboration.md`
- `docs/architecture/backend_strategy.md`
- `docs/engineering/monorepo_structure.md`
- `docs/engineering/api_contracts.md`
- `docs/engineering/development_and_deployment.md`
- `docs/engineering/contracts/openapi_core_modules_v1.yaml`
- `docs/engineering/mvp_database_schema.md`

