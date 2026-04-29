# PROJECT_STATE

Last updated: 2026-04-29

## Agent Workflow Snapshot

- Canonical execution queue: `.codex/context/TASK_BOARD.md`
- Default delivery loop: plan -> implement -> relevant tests -> architecture
  review -> sync context
- Planning fallbacks when no task is `READY`:
  - `docs/planning/next_execution_wave_2026-03-21.md`
  - `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md`
  - `docs/planning/open-decisions.md`
- Validation baseline by surface:
  - API: integration, unit, feature, and security-controls verification
  - Web: lint, typecheck, build, and unit checks
  - Mobile: typecheck, Expo web export, and unit checks
  - Contracts: OpenAPI lint when specs change
- Guardrails that must remain explicit in implementation:
  - multi-tenant isolation
  - human and AI actor boundaries
  - web and mobile parity for core modules
  - localization baseline (`en`, `pl`)

## Recent Execution Updates

- 2026-04-29: Completed `NEST-243` canonical dashboard mode pass. Added
  dashboard-specific canonical utility/rail overrides and a canonical portrait
  asset through
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/app/globals.css`, and
  `apps/web/public/assets/dashboard/workspace-account-avatar-canonical.png`.
  Fresh evidence:
  `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseT.png`.
- 2026-04-29: Completed `NEST-244` parity review after phase T. Current
  conclusion: dashboard now clears practical 90%+ similarity to the canonical
  founder image, with only ultra-narrow microtypography, spacing, and material
  differences remaining.
- 2026-04-29: Completed `NEST-241` dashboard shell serenity pass. Replaced
  symbolic brand/plant/focus ornaments with canonical-derived assets in
  `apps/web/public/assets/dashboard/` and integrated them through
  `apps/web/src/app/globals.css`. Fresh evidence:
  `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseR.png`.
- 2026-04-29: Completed `NEST-242` parity review after the shell serenity
  pass. Main conclusion: shell fidelity improved and the next best closure move
  is final calm spacing plus focus-card material softening.
- 2026-04-29: Completed `NEST-239` dashboard asset-driven fidelity pass.
  Added workspace-bound painterly assets in
  `apps/web/public/assets/dashboard/` and integrated them into
  `apps/web/src/app/globals.css`. Fresh evidence:
  `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseP.png`.
- 2026-04-29: Completed `NEST-240` dashboard parity review after the asset
  pass. Main conclusion: the dashboard improved in medium fidelity and the next
  best closure move is shell serenity plus `Now focus` softness, not more
  generic hero-only experimentation.
- 2026-04-28: Completed `NEST-238` canonical dashboard closure planning.
  Added a full element-by-element audit in
  `docs/ux/nest_237_dashboard_canonical_element_audit_2026-04-28.md` and a
  task contract in
  `docs/planning/nest_238_dashboard_canonical_closure_plan_2026-04-28.md`.
  Main conclusion: remaining dashboard gap should no longer be treated as
  generic CSS polish only; hero and decorative fidelity now require explicit
  asset-strategy decisions and a staged closure sequence.
- 2026-04-28: Completed `NEST-235` dashboard editorial detail pass. Refined
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`, and
  `apps/web/src/app/globals.css` to improve topbar editorial rhythm, right-rail
  fidelity, and insight-strip finish. Fresh evidence:
  `docs/ux_canonical_artifacts/2026-04-28/nest-dashboard-web-parity-preview-phaseN.png`.
- 2026-04-28: Completed `NEST-236` review of the phase N dashboard capture.
  Outcome: dashboard is again closer to the canonical founder image; remaining
  work is now a final cosmetic finish pass focused on hero watercolor softness,
  left-rail calm, and slight reduction of `Now focus` contrast.

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
- Ownership model (`v1`): one private user account with no shared workspace or
  shared-scope requirement.
- Ownership model (`v2` target): user-defined shareable spaces may represent
  family, company, or another custom sphere and can be shared with multiple
  participants.
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
- Authentication gate policy (v1): dashboard and core module routes are private
  and require authenticated session; only pre-auth surfaces are public.
- Public entrypoint policy (v1): `/` is always a public welcome page; private
  product workspace starts at `/dashboard` after successful authentication.
- Usability readiness policy (v1): core modules are not considered usable unless
  primary create/edit actions are functional and discoverable in GUI.
- Dual-actor policy (v1+): Nest supports both `human_user` and `ai_agent`
  principals in one domain model and policy layer.
- Delegated AI access policy (v1+): user-issued scoped API credentials are the
  required mechanism for AI agents acting on behalf of user-owned data.
- AI operation mode policy (`v2` target): AI must support both in-app assistive
  surfaces (reports, suggestions, module guidance) and external delegated-agent
  operation through API tool endpoints, while sharing one policy and audit
  model.
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
- Integration source-of-truth policy (v1+): Nest is the canonical
  life-management source of truth, while connected tools may synchronize
  bidirectionally and may offer import-on-connect so existing provider data can
  be ingested into Nest.
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
- Canonical dashboard direction package added on 2026-04-26 with founder-approved
  preview artifact and reusable UX implementation contract in
  `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`
- Web dashboard implementation updated on 2026-04-26 to adopt the canonical
  hierarchy and reusable primitives in:
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/app/globals.css`
- Web journal implementation updated on 2026-04-26 to adopt the same canonical
  hero/context grammar and warmer reflection treatment in:
  `apps/web/src/app/journal/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/app/globals.css`
- Web planning implementation updated on 2026-04-26 to adopt the same
  hero/focus/context hierarchy while preserving existing board workflows in:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`
- Dashboard parity gap plan against the founder target image added on
  2026-04-26 in:
  `docs/ux/nest_201_dashboard_parity_gap_plan_2026-04-26.md`
  with repository artifact:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
- Dashboard visual parity phase 1 implemented on 2026-04-26 with a more
  premium shell, illustrated hero, support rail stack, ceremonial day-flow,
  and footer insight strip in:
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`
  with current implementation preview artifact:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`
- Dashboard visual parity phase 2 refined on 2026-04-26 to remove duplicate
  hierarchy, restore the target-like `Tasks + Habits` lower zone, and preserve
  a premium dashboard composition even when live data is sparse in:
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/app/globals.css`
- Dashboard finish pass refined on 2026-04-26 to further improve shell
  elegance, topbar lightness, hero rhythm, right-rail density, and lower-card
  polish in:
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`
- Shell-level canonical alignment planning was extended on 2026-04-26 so the
  remaining founder-target gap is now modeled as a full workspace-system task,
  not only a dashboard polishing task, in:
  `docs/ux/nest_212_workspace_shell_and_dashboard_canonical_alignment_2026-04-26.md`
  with matching task contract:
  `docs/planning/nest_212_workspace_shell_and_dashboard_alignment_2026-04-26.md`
  covering root shell responsibilities, assistant/chat surface placement, and
  cross-module propagation rules
- Shell truth implementation landed on 2026-04-26 with a stronger sanctuary
  frame, upgraded shared shell, richer display typography, and a first-class
  assistant route in:
  `apps/web/src/app/layout.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/assistant/page.tsx`,
  `apps/web/src/app/globals.css`
  with fresh local evidence artifacts:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseA.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseA.png`
- A fresh parity review after shell-truth implementation confirms the app is
  closer to the founder target but still not yet fully canonical; remaining
  gaps and next iteration slices are recorded in:
  `docs/ux/nest_214_dashboard_shell_parity_review_2026-04-26.md`
- Dashboard/shell finish pass phase B landed on 2026-04-26 with a denser hero,
  softer support rail, and more Nest-native assistant conversation staging in:
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/app/assistant/page.tsx`,
  `apps/web/src/app/globals.css`
  with refreshed artifacts:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseB.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseB.png`
- A second parity review on 2026-04-26 confirms the app is again closer to the
  canonical target, but still needs one more pass focused on hero proportion,
  editorial entry merge, rail luxury finish, and assistant response-state
  polish; see:
  `docs/ux/nest_216_dashboard_shell_parity_review_phaseB_2026-04-26.md`
- Dashboard/shell phase E refinement landed on 2026-04-26 with a true
  dashboard shell grid, lighter editorial entry, calmer sidebar/account
  rhythm, and further assistant polish in:
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/app/assistant/page.tsx`,
  `apps/web/src/app/globals.css`
  with refreshed artifacts:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseD.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseD.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseE.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseE.png`
- A third parity review on 2026-04-26 confirms the shell is materially closer
  to the founder target, but still needs one more focused pass on sidebar
  serenity, hero typography/metrics, focus-timeline proportion, support-card
  material softness, and assistant finish; see:
  `docs/ux/nest_218_dashboard_shell_parity_review_phaseE_2026-04-26.md`
- Dashboard/assistant living parity phase F landed on 2026-04-26 with softer
  rail weight, calmer hero density, refined focus/timeline balance, richer
  support-card materials, subtle living motion, and improved assistant
  response-state preparation in:
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/app/globals.css`
  with refreshed artifacts:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseF.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseF.png`
- A fourth parity review on 2026-04-26 confirms the app feels more alive and
  premium, but still needs one final narrow finish pass on hero softness, rail
  quietness, focus-card dominance, assistant warmth, and reusable propagation
  rules; see:
  `docs/ux/nest_220_dashboard_living_parity_review_phaseF_2026-04-26.md`
- Canonical finish phase G landed on 2026-04-26 with softer dashboard hero
  typography, quieter rail identity/account rhythm, reduced focus-card
  dominance, and a warmer assistant idle state in:
  `apps/web/src/app/assistant/page.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/app/globals.css`
  with refreshed artifacts:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseG.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseG.png`
- A fifth parity review on 2026-04-26 confirms the app is now in a narrow-gap
  state relative to the canonical target, with remaining work focused on final
  dashboard closure and propagation rules for other modules; see:
  `docs/ux/nest_222_canonical_finish_review_phaseG_2026-04-26.md`
- Final closure phase H landed on 2026-04-26 with additional dashboard
  micro-softness in hero, rail, focus card, and support rail, plus explicit
  finish propagation rules for future modules in:
  `apps/web/src/app/globals.css`,
  `docs/ux/design-memory.md`
  with refreshed artifacts:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseH.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseH.png`
- A sixth parity review on 2026-04-26 confirms the dashboard and assistant are
  now very close to the canonical founder direction and the remaining gap is
  primarily micro-aesthetic rather than structural; see:
  `docs/ux/nest_224_final_closure_review_phaseH_2026-04-26.md`
- Mobile dashboard parity decision remains open on 2026-04-26 because the
  mobile app still lands in `Tasks` and has no dedicated dashboard route; see
  `docs/planning/open-decisions.md` item `OD-2026-04-26-01`
- V1/V2 documentation split refreshed on 2026-04-26 so current planning can
  distinguish practical `v1` delivery from later AI-assisted `v2` expansion
  without changing core architecture
- Planning baseline complete for MVP, full-product roadmap, and V2 target wave
- Next execution wave plan documented in
  `docs/planning/next_execution_wave_2026-03-21.md`
- Auth/usability/AI-access remediation wave documented in
  `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md` with
  execution queue `NEST-160` to `NEST-191`.
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
- `NEST-115` completed: production topology + env/secrets + TLS/backup
  prerequisites are documented in
  `docs/operations/production_topology_environment_contract_v1.md`
- `NEST-116` completed: API+web deploy pipeline is versioned with staging/
  production paths, migration/health/rollback steps, and dry-run validation
  (`.github/workflows/deploy-api-web.yml`,
  `scripts/release/deploy-api-web.ps1`)
- `NEST-117` completed: mobile release pipeline for physical devices is
  documented and automated with profile-aware workflow + dry-run script
  (`.github/workflows/mobile-release.yml`,
  `scripts/release/mobile-release.ps1`)
- `NEST-118` completed: post-deploy smoke suite is available for server + phone
  critical paths in staging/production candidate flows
  (`.github/workflows/post-deploy-smoke.yml`,
  `scripts/release/post-deploy-smoke.ps1`)
- `NEST-119` completed: production operations runbook is finalized with
  incident/rollback/escalation procedures, release ownership, and monitoring
  checklist (`docs/operations/production_operations_runbook_v1.md`)
- `NEST-120` completed: staging rehearsal packet and production go-live sign-off
  are documented (`docs/operations/staging_rehearsal_go_live_signoff_2026-03-21.md`)
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
- `NEST-122` execution packet published with production-profile launch-window
  runbook evidence in dry-run mode; live environment and device pass evidence is
  still required to close the task
  (`docs/operations/production_launch_window_execution_2026-03-21.md`)
- `NEST-123` Day0/Day1 validation packet prepared with monitoring/regression
  evidence and first stabilization patch decision; live post-launch evidence is
  still required for task closure
  (`docs/operations/day0_day1_operational_validation_packet_2026-03-31.md`)
- `NEST-124` Week1 stabilization summary published with temporary hotfix cadence
  decision and prioritized next wave; live post-launch metric append is still
  required for final closure
  (`docs/operations/week1_stabilization_summary_2026-03-31.md`)
- `NEST-126` completed: strict SLO/error-budget release gate enforced in
  release-train workflow with runbook breach-recovery escalation flow
  (`docs/operations/release_train_change_management.md`,
  `docs/operations/production_operations_runbook_v1.md`)
- `NEST-127` completed: progressive API/web delivery flow implemented with
  canary/blue-green strategy options, monitored promotion, and rollback
  rehearsal evidence (`docs/operations/api_web_progressive_delivery_rehearsal_2026-03-31.md`)
- `NEST-128` staged mobile rollout framework implemented and rehearsed in
  dry-run mode; physical-device rollback validation remains open for final
  closure (`docs/operations/mobile_staged_rollout_rehearsal_2026-03-31.md`)
- `NEST-129` stabilization gate review published with temporary V2 NO-GO
  decision and explicit mitigation owners for unresolved high-severity launch
  risks (`docs/operations/v1_1_stabilization_gate_review_2026-03-31.md`)
- `NEST-125` observability baseline execution pack is prepared (dashboard set,
  SQL extracts, reliability scoring template), but task remains open pending
  live 7-day and 14-day production traffic exports
  (`docs/operations/v2_real_traffic_observability_baseline_pack_2026-03-31.md`)
- `NEST-130` completed: automatic background sync added on web/mobile offline
  queue flows with adaptive retry/backoff and deterministic jitter while
  preserving manual force-sync override
  (`docs/modules/background_auto_sync_adaptive_retry_v2.md`)
- `NEST-131` completed: durable local sync scheduler state, queue deduplication,
  and stuck/lag monitoring signals added on web/mobile clients
  (`docs/modules/durable_local_sync_scheduler_v2.md`)
- `NEST-132` completed: deterministic offline conflict merge policy surfaced in
  API and web/mobile UI with regression coverage for repeated concurrent-style
  updates (`docs/modules/deterministic_offline_merge_policy_v2.md`)
- `NEST-133` completed: encrypted local cache profile and retention controls
  added for web/mobile offline queue + scheduler payloads with secure wipe path
  (`docs/modules/encrypted_local_cache_profile_v2.md`)
- `NEST-134` completed: offline chaos/regression suite added with deterministic
  packet-loss/high-latency/reconnect-storm scenarios, machine-readable run
  matrix, and documented limitations/mitigations
  (`docs/operations/offline_chaos_regression_report_2026-03-31.md`)
- `NEST-135` completed: collaboration role model expanded for shared household
  operations (`owner/editor/viewer`), with policy-enforced shared task/list/
  goal permissions, member lifecycle APIs, and boundary regression coverage
  (`docs/modules/shared_household_workspace_operations_v2.md`)
- `NEST-136` completed: shared planning assignment/handoff workflows delivered
  for tasks and calendar events with explicit reminder ownership and auditable
  timeline history endpoints (`docs/modules/shared_planning_assignment_handoff_reminder_ownership_v2.md`)
- `NEST-137` completed: in-app notification center delivered across API/web/mobile
  with grouped activity feed, read/unread/snooze actions, actionable deep-link
  routing, and shared contract updates
  (`docs/modules/in_app_notification_center_actionable_events_v2.md`)
- `NEST-138` completed: notification channel matrix delivered with configurable
  global/per-event routing (`push/email/in_app`), quiet-hours suppression
  windows, and per-channel delivery telemetry with failure reasons
  (`docs/modules/notification_channel_matrix_push_email_in_app_v2.md`)
- `NEST-139` completed: collaboration safety and UX regression certification
  executed with permission/privacy regression validation, desktop/mobile smoke
  pass evidence, and formal certification packet publication
  (`docs/operations/collaboration_safety_ux_regression_certification_2026-03-31.md`)
- `NEST-157` completed: web/mobile visual parity pass against active Stitch
  screen set executed with capture artifacts, deviation classification
  (`intentional|follow-up`), and attached readability/accessibility checks
  (`docs/ux/nest_157_visual_parity_pass_2026-03-31.md`)
- `NEST-158` completed: web Tasks+Lists usability remediation delivered with
  login-backed list/task CRUD baseline, split module IA (`habits` vs `routines`,
  `goals` vs `targets`), and removal of misleading/non-functional UI controls
  (`apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/lib/auth-session.ts`,
  `apps/web/src/components/workspace-shell.tsx`)
- `NEST-159` completed: critical click-path UX audit executed for life-management
  usability with screenshot evidence pack, per-view good/bad/why/fix analysis,
  and explicit Stitch project URL reference for continued parity iterations
  (`docs/ux/nest_159_life_management_ux_critical_audit_2026-03-31.md`,
  `docs/ux_audit_evidence/2026-03-31/nest-159/artifact-index.md`,
  `docs/ux/stitch_screen_registry_2026-03-21.md`)
- `NEST-160` completed: web auth + onboarding gate now enforced for dashboard
  and module routes with middleware guard, dedicated `/auth` entry flow, and
  cookie-backed session gating signals (`apps/web/middleware.ts`,
  `apps/web/src/app/auth/page.tsx`,
  `apps/web/src/lib/route-guard.ts`,
  `apps/web/src/lib/auth-session.ts`)
- `NEST-161` completed: Tasks+Lists web flow now supports practical authenticated
  CRUD baseline (create/update/complete/delete for tasks and create/update/
  delete for lists), with `per_page` client contract fixed and actionable error
  feedback (`apps/web/src/app/tasks/page.tsx`)
- `NEST-162` completed: web first-create flows are now active for core
  life-management modules (`habits`, `routines`, `goals`, `targets`,
  `calendar`) with API-backed creation forms and listing surfaces
  (`apps/web/src/app/habits/page.tsx`,
  `apps/web/src/app/routines/page.tsx`,
  `apps/web/src/app/goals/page.tsx`,
  `apps/web/src/app/targets/page.tsx`,
  `apps/web/src/app/calendar/page.tsx`)
- `NEST-163` completed: dual-actor backend identity context is now active for
  write-path policy and audit layers (`human_user`, `ai_agent`,
  `delegated_agent`) with middleware propagation and actor-aware sync/
  marketplace audit metadata (`apps/api/app/Actors/ActorContext.php`,
  `apps/api/app/Http/Middleware/ResolveActorContext.php`,
  `apps/api/app/Policies/Concerns/ResolvesActorContextForPolicy.php`,
  `apps/api/app/Integrations/Services/IntegrationSyncService.php`,
  `apps/api/app/Integrations/Services/IntegrationMarketplaceService.php`)
- `NEST-164` completed: delegated AI API credential lifecycle is active with
  user-issued scoped Sanctum credentials (expiry + revoke controls), route-level
  least-privilege scope enforcement middleware, and deterministic denied access
  behavior for revoked/expired credentials under API error envelope contract
  (`apps/api/app/Auth/DelegatedCredentialScopeCatalog.php`,
  `apps/api/app/Http/Middleware/EnforceDelegatedCredentialScope.php`,
  `apps/api/app/Http/Controllers/Api/DelegatedCredentialController.php`,
  `apps/api/database/migrations/2026_03_31_233500_add_revoked_at_to_personal_access_tokens_table.php`,
  `docs/modules/delegated_ai_api_credentials_v1.md`)
- `NEST-165` completed: AI agent account lifecycle and boundary enforcement are
  active with tenant-scoped AI principals, human-owner lifecycle endpoints,
  AI-agent credential issuance/revoke/deactivate flows, and audited denial of
  unauthorized cross-boundary access attempts (`boundary_mismatch`,
  `route_not_allowed`, `missing_scope`, `ai_agent_revoked`) in
  `actor_boundary_audits` (`apps/api/app/Http/Controllers/Api/AiAgentAccountController.php`,
  `apps/api/database/migrations/2026_03_31_234500_add_ai_agent_principal_columns_to_users_table.php`,
  `apps/api/database/migrations/2026_03_31_234600_create_actor_boundary_audits_table.php`,
  `apps/api/app/Http/Middleware/EnforceDelegatedCredentialScope.php`,
  `docs/modules/ai_agent_account_lifecycle_boundaries_v1.md`)
- `NEST-166` completed: GUI+API access-control management surface is active
  with protected web settings flow (`/settings`) for delegated credentials,
  AI-agent lifecycle/credential review, and access-boundary audit visibility;
  auth API surface and shared client contracts are aligned to final management
  flows (`apps/web/src/app/settings/page.tsx`,
  `apps/api/app/Http/Controllers/Api/AccessAuditController.php`,
  `apps/api/app/Http/Controllers/Api/AiAgentAccountController.php`,
  `packages/shared-types/src/client.js`,
  `docs/modules/access_control_management_surface_v1.md`)
- `NEST-167` completed: Stitch-driven web shell refresh is active with
  rail/topbar navigation hierarchy, updated aura/tokenized styling, and unified
  desktop/mobile module navigation behavior
  (`apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`,
  `apps/web/src/lib/mvp-snapshot.ts`)
- `NEST-168` completed: Tasks+Lists command surface is redesigned for practical
  daily use with clearer quick-capture flow, deterministic zero-list Inbox
  fallback, and preserved authenticated CRUD behavior
  (`apps/web/src/app/tasks/page.tsx`)
- `NEST-169` completed: journal usability baseline is now API-backed
  (journal-entry + life-area create/list), insights actions are functional
  (`refresh`/`export`), and auth screen no longer ships demo credentials
  (`apps/web/src/app/journal/page.tsx`,
  `apps/web/src/app/insights/page.tsx`,
  `apps/web/src/app/auth/page.tsx`)
- `NEST-170` completed: public/private app boundary now starts from public
  welcome `/` and private `/dashboard`, with route-guard redirects enforcing
  authenticated access for dashboard and module routes
  (`apps/web/src/lib/route-guard.ts`,
  `apps/web/scripts/route-guard-regression.mjs`,
  `apps/web/src/app/dashboard/page.tsx`)
- `NEST-171` completed: auth/register surfaces now use dedicated welcome-style
  public shell, while private app menu uses outline icon navigation in the left
  rail and mobile pill nav
  (`apps/web/src/components/public-shell.tsx`,
  `apps/web/src/app/page.tsx`,
  `apps/web/src/app/auth/page.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`)
- `NEST-172` completed: deterministic seeded admin login is now
  `admin@admin.com / password`, and local startup/login flow is documented in
  repository README
  (`apps/api/database/seeders/DatabaseSeeder.php`,
  `README.md`)
- `NEST-173` completed: secondary module-pill nav removed from workspace views,
  settings promoted to primary rail navigation, Settings module split into
  `Profile` and `Access Control` tabs with profile name/language update flow,
  and middleware session resolution made deterministic to prevent
  module-specific redirect drift
  (`apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/settings/page.tsx`,
  `apps/web/src/app/globals.css`,
  `apps/web/middleware.ts`,
  `apps/web/src/app/tasks/page.tsx`)
- `NEST-174` completed: journal/module navigation no longer depends on forced
  onboarding redirects, seeded admin is onboarding-ready by default, and core
  module create flows/copy were simplified to practical day-to-day usage
  (`apps/web/src/lib/route-guard.ts`,
  `apps/web/scripts/route-guard-regression.mjs`,
  `apps/web/src/app/auth/page.tsx`,
  `apps/api/database/seeders/DatabaseSeeder.php`,
  `apps/web/src/app/journal/page.tsx`,
  `apps/web/src/app/targets/page.tsx`,
  `apps/web/src/app/calendar/page.tsx`,
  `README.md`)
- `NEST-175` completed: web modules `goals`, `habits`, `routines`, `targets`,
  and `journal` now expose complete CRUD actions from GUI with inline edit
  forms and delete controls (plus journal life-area CRUD and
  habits/routines pause/reactivate controls)
  (`apps/web/src/app/goals/page.tsx`,
  `apps/web/src/app/habits/page.tsx`,
  `apps/web/src/app/routines/page.tsx`,
  `apps/web/src/app/targets/page.tsx`,
  `apps/web/src/app/journal/page.tsx`)
- `NEST-176` completed: module header and grid layout now use centered
  max-width constraints to avoid over-stretched UI on wide screens
  (`apps/web/src/app/globals.css`)
- `NEST-177` completed: calendar module now supports full GUI CRUD with inline
  edit and delete actions on timeline rows
  (`apps/web/src/app/calendar/page.tsx`)
- `NEST-178` completed: life areas now have a dedicated GUI module with CRUD
  controls, balance context metrics, and explicit navigation/route-guard
  support
  (`apps/web/src/app/life-areas/page.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/lib/route-guard.ts`)
- `NEST-179` completed: settings IA is reorganized into practical tabs
  (`Moj profil`, `Ustawienia aplikacji`, `Access i API`, `Subskrypcja`),
  global logout is available in the main left menu, and middleware no longer
  persists onboarding status cookie (preventing stale onboarding navigation
  side effects on guarded settings access)
  (`apps/web/src/app/settings/page.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/components/workspace-logout-button.tsx`,
  `apps/web/src/app/globals.css`,
  `apps/web/middleware.ts`)
- `NEST-180` completed: workspace layout stretch artifacts were removed by
  anchoring module grids to natural top-flow sizing, and calendar now provides
  practical `day/week/month` view switching with date-range navigation and
  combined visibility of events plus due tasks in selected window
  (`apps/web/src/app/globals.css`,
  `apps/web/src/app/calendar/page.tsx`)
- `NEST-181` completed: Tasks+Lists now uses a practical kanban board flow
  with lists as columns and task cards with enabled create/edit/delete actions;
  list-level planning context assignments (`goal_id`, `target_id`,
  `life_area_id`) and task-level `life_area_id` assignment are now persisted
  and validated in API + GUI
  (`apps/web/src/app/tasks/page.tsx`,
  `apps/api/database/migrations/2026_04_01_030000_add_context_references_to_task_lists_table.php`,
  `apps/api/app/Http/Controllers/Api/TaskListController.php`,
  `apps/api/app/Http/Controllers/Api/TaskController.php`)
- `NEST-182` completed: Tasks+Lists board usability upgraded with practical
  filter toolbar (`search`, `status`, `context`, `life area`, `hide empty`),
  filtered-column rendering states, and improved card metadata readability
  (priority/status chips + overdue highlighting)
  (`apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/globals.css`)
- `NEST-183` completed: Tasks+Lists now supports optional hierarchy links
  end-to-end, so lists can be created without parent context and tasks can be
  created as standalone (`list_id=null`) then moved between list/unassigned
  states with explicit `No list` column UX, backend nullable-schema support,
  and policy/test coverage
  (`apps/web/src/app/tasks/page.tsx`,
  `apps/api/database/migrations/2026_04_01_050000_make_tasks_list_id_nullable.php`,
  `apps/api/app/Http/Controllers/Api/TaskController.php`,
  `apps/api/app/Policies/TaskPolicy.php`,
  `apps/api/tests/Feature/TasksAndListsApiTest.php`)
- `NEST-184` completed: Tasks module clickthrough audit is executed end-to-end
  with documented web findings/remediation, web `/tasks` loading contract and
  feedback UX issues fixed, and mobile `tasks` tab rebuilt to practical
  API-backed CRUD baseline for lists/tasks (including standalone no-list flow)
  (`docs/ux/nest_184_tasks_module_clickthrough_remediation_2026-04-01.md`,
  `apps/web/src/app/tasks/page.tsx`,
  `apps/mobile/app/(tabs)/index.tsx`)
- `NEST-185` completed: planning hierarchy surfaces are now unified in one web
  module (`/tasks`) with in-module view switching (`Board`, `Goals`,
  `Targets`), while legacy `/goals` and `/targets` routes redirect to the same
  workspace tabs and main rail navigation no longer duplicates separate
  goal/target entries
  (`apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/goals/page.tsx`,
  `apps/web/src/app/targets/page.tsx`,
  `apps/web/src/components/workspace-shell.tsx`)
- `NEST-186` completed: `/tasks` UX is now optimized for immediate daily use
  with `Today Focus` primary actions, always-visible `No list` quick-capture
  column (no zero-column dead-end), collapsible setup/filter tools, and
  stronger card/metric/panel visual hierarchy for readability
  (`apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`)
- `NEST-187` completed: backend seed baseline now includes practical demo
  planning data (`goals`, `targets`, `task_lists`, `tasks`) for seeded admin
  account, so `/tasks` is populated right after `migrate --seed`; repeated seed
  runs remain idempotent for demo entities
  (`apps/api/database/seeders/DatabaseSeeder.php`,
  `README.md`)
- `NEST-188` completed: planning IA now uses one `Planning` entry with explicit
  subviews (`tasks`, `lists`, `targets`, `goals`), tasks capture is progressive
  (`Add card` opens form on demand and closes after save), and goals now show a
  visible path summary from goal through targets/lists to linked task workload
  (`apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/globals.css`)
- `NEST-189` completed: dashboard is now rebuilt as a mobile-first daily
  cockpit with one responsive system for web-mobile and desktop, including:
  progress hero, `Morning/Now/Evening` timeline, `Zadania/Nawyki` focus tabs,
  quick reflection save flow, and compact quick actions
  (`apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/app/globals.css`)
- `NEST-190` completed: full-system desktop/mobile UX clickthrough audit is
  captured with deterministic screenshot evidence, and a single target
  assumptions baseline is now documented for next UX implementation wave
  (`scripts/ux-audit/capture-system-audit.mjs`,
  `docs/ux_audit_evidence/2026-04-01/capture-manifest.json`,
  `docs/ux/nest_190_full_system_ux_target_assumptions_2026-04-01.md`,
  `docs/ux/ui-ux-foundation.md`)
- `NEST-191` completed: first post-audit UX implementation slice is active with
  mobile-first workspace shell hierarchy (no cramped mid-width rail), action-
  first dashboard "Now focus" block, and simplified planning surface feedback
  and setup noise reduction (`apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/app/globals.css`)
- `NEST-140` completed: AI context graph foundation delivered with deterministic
  snapshot fingerprinting, cross-module context assembly
  (tasks/calendar/habits/goals/journal), and strict redaction policy for
  sensitive long-form fields (`docs/modules/ai_context_graph_v2.md`)
- `NEST-141` completed: conversational copilot surface delivered across
  API/web/mobile with explainability payloads, source references, and graceful
  fallback behavior when AI provider credentials are unavailable
  (`docs/modules/conversational_copilot_surface_v2.md`)
- `NEST-142` completed: approval-gated AI write actions delivered with explicit
  proposal/approve/reject lifecycle, no-write-before-approval enforcement, and
  persisted execution audit trail (`docs/modules/ai_approval_gated_write_actions_v2.md`)
- `NEST-143` completed: proactive daily/weekly briefing generation delivered
  with user cadence/scope preferences and in-app notification deep-link context
  to insights summaries (`docs/modules/ai_proactive_briefings_v2.md`)
- `NEST-144` completed: AI copilot safety/evaluation harness delivered with
  deterministic policy/hallucination/action-safety scorecard command and
  release-train threshold gate enforcement
  (`docs/modules/ai_copilot_safety_evaluation_harness_v2.md`)
- `NEST-145` completed: integration marketplace framework delivered with
  provider catalog discovery, auditable reversible install/uninstall lifecycle,
  and exposed metadata/status contracts
  (`docs/modules/integration_marketplace_framework_v2.md`)
- `NEST-146` completed: next-wave providers `clickup` and `microsoft_todo`
  delivered end-to-end with adapter contracts, sync pipeline coverage, and
  rollout caveat documentation (`docs/modules/next_wave_provider_rollout_v2.md`)
- `NEST-147` completed: near-real-time integration event ingestion delivered
  with webhook/event-driven ingestion endpoints, strict replay protection, and
  ingestion lag/drop monitoring metrics + command baseline
  (`docs/modules/integration_near_real_time_sync_triggers_v2.md`)
- `NEST-148` completed: integration health center delivered with provider
  status/failure/event-risk aggregation, one-click replay remediation, guided
  reconnect playbooks, and web/mobile health center surfaces
  (`docs/modules/integration_health_center_remediation_playbooks_v2.md`)
- `NEST-149` completed: billing self-serve checkout/portal + recovery and
  automated dunning delivered with reconciliation visibility, command-driven
  dunning execution, and updated web/mobile billing surfaces
  (`docs/modules/billing_self_serve_checkout_portal_dunning_v2.md`)
- `NEST-150` completed: activation/retention/monetization analytics loops
  delivered with decision dashboard APIs, onboarding/pricing experiment hooks,
  and web/mobile growth-loop visibility in insights surfaces
  (`docs/modules/analytics_activation_retention_monetization_loops_v2.md`)
- `NEST-151` completed: V2 production readiness review packet published with
  perf/security/cost/ops gate matrix, explicit P1 owners/mitigations, and
  documented NO-GO decision for GA pending risk closure
  (`docs/operations/v2_production_readiness_review_2026-03-31.md`)
- `NEST-152` execution packet and V2.1 prioritized backlog are now published,
  with pre-GA control checks re-validated in current environment; task remains
  open pending non-dry-run GA deploy and live Day0/Day1/Week1/Week4 evidence
  checkpoints
  (`docs/operations/v2_ga_30_day_stabilization_execution_packet_2026-03-31.md`,
  `docs/planning/v2_1_prioritized_backlog_wave_2026-03-31.md`)
- `NEST-097` completed: audit remediation execution handoff prepared with
  strict task order, ownership, and DoD for implementation agents
  (`docs/operations/audit_remediation_execution_handoff_2026-03-19.md`)
- Current execution focus: `v1` repair execution has started with three early
  hardening slices completed on 2026-04-26:
  repository startup truth corrected, Laravel testing bootstrap stabilized,
  stale async sync regressions updated to the enqueue-first contract, web
  entry-path onboarding/access truth aligned with the documented product policy,
  the mobile validation baseline restored to green, and web feedback copy
  hardened so key surfaces no longer expose raw technical API messaging while
  the web lint/typecheck/build/unit baseline remains green; mobile support
  surfaces (`settings modal`, `billing`, `insights`) now follow the same
  user-safer feedback standard and keep the mobile validation/export baseline
  green; settings/support copy is also more consistent across web and mobile,
  with the web settings page no longer mixing Polish and English and the mobile
  settings hub using cleaner founder-ready wording; the remaining daily-flow
  dashboard/support surfaces and API-backed mobile CRUD tabs also now use one
  calmer English baseline instead of mixed-language or generic low-signal
  feedback. The active `v1` wave is now also sequenced through
  `docs/planning/v1_execution_backlog_2026-04-26.md`, and mobile support/core
  tabs now share one UX error helper instead of screen-local duplicates.
- Parallel backlog context still includes ongoing V2 launch-window/live-evidence
  closures (`NEST-122`, `NEST-123`, `NEST-124`, `NEST-125`, `NEST-128`,
  `NEST-129`) and commercial/release continuation (`NEST-152` onward).

## Auth, AI, Offline, Notifications

- MVP auth: email + password
- OAuth providers: post-MVP
- AI: post-MVP rollout, default ON when introduced
- Access direction: human-first GUI with strict auth gate now; dual-actor
  Human+AI account/delegation model is active planning baseline for next
  execution wave.
- Offline: local offline queue with manual force-sync in settings/options
- Notifications: mostly post-MVP, simplest mobile push can be first

## Integrations Direction

- Sequence: list/task providers first (Trello + Google Tasks + Todoist),
  then Google Calendar, Obsidian last
- Long-term: up to 3 major providers per functional area where practical

## Planning Baseline

- MVP execution backlog: `docs/planning/implementation_plan_mvp.md`
- Full-product execution backlog: `docs/planning/implementation_plan_full.md`
- Current practical `v1` execution focus:
  `docs/planning/v1_execution_focus_2026-04-26.md`
- Current canonical `v1` repair execution plan:
  `docs/planning/v1_repair_execution_plan_2026-04-26.md`
- V2 target execution backlog: `docs/planning/v2-target-execution-plan.md`
- V2 execution roundbook: `docs/planning/v2-execution-roundbook.md`
- V2 task cards: `docs/planning/v2-task-cards.md`
- Human+AI dual-actor execution wave:
  `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md`
- UX/UI refresh implementation wave: `docs/ux/uxui_refresh_implementation_wave_2026-03-31.md`
- Roadmap overview: `docs/product/roadmap.md`
- Next execution wave: `docs/planning/next_execution_wave_2026-03-21.md`
- MVP execution track: `docs/planning/mvp-execution-plan.md`
- V1 launch track: `docs/planning/v1-live-release-plan.md`
- Function coverage audit: `docs/planning/function_coverage_audit_2026-03-21.md`

## Documentation Refreshes

- `NEST-208` completed: mobile support surfaces and API-backed CRUD tabs now
  share one UX error contract helper for API issue descriptions and payload
  fallback handling, removing duplicated mobile-only status mapping logic
  (`apps/mobile/lib/ux-contract.ts`,
  `apps/mobile/app/modal.tsx`,
  `apps/mobile/app/(tabs)/billing.tsx`,
  `apps/mobile/app/(tabs)/insights.tsx`,
  `apps/mobile/app/(tabs)/index.tsx`,
  `apps/mobile/app/(tabs)/goals.tsx`,
  `apps/mobile/app/(tabs)/habits.tsx`,
  `apps/mobile/app/(tabs)/journal.tsx`)
- `NEST-209` completed: web dashboard is materially closer to the founder
  target through a richer shell, illustrated editorial hero, support rail
  cards, ceremonial day-flow timeline, and low-noise insight footer strip,
  with reusable shared primitives and a browser-captured parity preview
  artifact
  (`apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`)
- `NEST-210` completed: dashboard parity is refined further toward the founder
  reference by removing duplicate hero hierarchy, aligning the lower section to
  `Tasks + Habits`, and adding a polished sparse-data presentation fallback so
  the canonical preview keeps its visual quality
  (`apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/app/globals.css`)
- `NEST-211` completed: the dashboard received a premium finish pass on shell
  chrome, sidebar presence, hero spacing, support-rail density, and lower-card
  typography rhythm, bringing the web preview materially closer to the founder
  reference in overall feel
  (`apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`)
- `NEST-212` completed: shell-level canonical parity is now explicitly planned
  as a full workspace-system alignment problem, including root layout
  responsibility, sidebar/topbar refinement, dashboard residual parity, future
  assistant/chat surface framing, and a propagation model for later module
  rebuilds
  (`docs/ux/nest_212_workspace_shell_and_dashboard_canonical_alignment_2026-04-26.md`,
  `docs/planning/nest_212_workspace_shell_and_dashboard_alignment_2026-04-26.md`)
- `NEST-213` completed: the web app now has a stronger canonical sanctuary
  frame plus a first-class `Assistant` room, moving parity work from
  dashboard-only refinement into a broader reusable shell system
  (`apps/web/src/app/layout.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/assistant/page.tsx`,
  `apps/web/src/app/globals.css`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseA.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseA.png`)
- `NEST-214` completed: a fresh parity review now explicitly records the
  remaining dashboard/shell gaps after the shell-truth implementation and
  defines the next iteration slices toward full canonical founder parity
  (`docs/ux/nest_214_dashboard_shell_parity_review_2026-04-26.md`)
- `NEST-215` completed: the dashboard and shell received a tighter parity pass
  that removed duplicate hero utility noise, softened support-rail support
  copy, and made the assistant surface feel more like a real Nest room
  (`apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/app/assistant/page.tsx`,
  `apps/web/src/app/globals.css`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseB.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseB.png`)
- `NEST-216` completed: a second post-implementation parity review documents
  the remaining hero, entry-merge, rail-luxury, and assistant response-state
  gaps after the phase B finish pass
  (`docs/ux/nest_216_dashboard_shell_parity_review_phaseB_2026-04-26.md`)
- `NEST-217` completed: the shared web shell is closer to the canonical
  reference through one real dashboard shell grid, a lighter page entry,
  calmer sidebar/account rhythm, and refreshed dashboard/assistant evidence
  artifacts
  (`apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/app/assistant/page.tsx`,
  `apps/web/src/app/globals.css`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseE.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseE.png`)
- `NEST-218` completed: a fresh parity review now records the remaining gaps
  after the phase E shell pass and defines the next slices toward full
  canonical founder parity
  (`docs/ux/nest_218_dashboard_shell_parity_review_phaseE_2026-04-26.md`)
- `NEST-219` completed: the dashboard and assistant now feel calmer and more
  alive through reduced rail heaviness, softer card materials, subtler center
  proportions, time-aware dashboard greeting, and reusable living-ui guidance
  for future module work
  (`apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/app/globals.css`,
  `docs/ux/design-memory.md`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseF.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseF.png`)
- `NEST-220` completed: a new parity review now records the remaining final
  finish-pass gaps after the phase F living-ui pass
  (`docs/ux/nest_220_dashboard_living_parity_review_phaseF_2026-04-26.md`)
- `NEST-221` completed: the dashboard and assistant received a narrow canonical
  finish pass that further softened hero and rail assertiveness while warming
  the assistant idle state
  (`apps/web/src/app/assistant/page.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/app/globals.css`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseG.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseG.png`)
- `NEST-222` completed: the latest review records the now-narrow remaining gap
  against the canonical founder target and points the next work toward final
  dashboard closure plus propagation rules for further module rebuilds
  (`docs/ux/nest_222_canonical_finish_review_phaseG_2026-04-26.md`)
- `NEST-223` completed: the dashboard and assistant received a last closure
  pass that further softened remaining micro-structure while design memory now
  records finish-language propagation rules for future module refreshes
  (`apps/web/src/app/globals.css`,
  `docs/ux/design-memory.md`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseH.png`,
  `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseH.png`)
- `NEST-224` completed: the latest review confirms the current dashboard and
  assistant are near-closed against the canonical founder target, with
  remaining differences mostly aesthetic rather than systemic
  (`docs/ux/nest_224_final_closure_review_phaseH_2026-04-26.md`)
- `NEST-207` completed: the active `v1` repair wave now has a canonical
  detailed execution queue and refill strategy through
  `docs/planning/v1_execution_backlog_2026-04-26.md`, with
  `docs/planning/mvp-next-commits.md` pointing to the next sequenced tasks
  instead of generic gap-derivation placeholders
- `NEST-206` completed: remaining daily-use copy drift is reduced across the
  web dashboard/support cards and the mobile API-backed CRUD tabs, including
  cleaner success/error/loading messages and removal of broken separator
  rendering
  (`apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/components/workspace-logout-button.tsx`,
  `apps/web/src/components/ai-copilot-card.tsx`,
  `apps/web/src/components/notification-center-card.tsx`,
  `apps/web/src/components/notification-channel-matrix-card.tsx`,
  `apps/mobile/app/(tabs)/index.tsx`,
  `apps/mobile/app/(tabs)/goals.tsx`,
  `apps/mobile/app/(tabs)/habits.tsx`,
  `apps/mobile/app/(tabs)/journal.tsx`)
- `NEST-205` completed: settings and support-adjacent copy is more consistent
  across both clients, including English-baseline web settings labels and
  cleaner mobile settings hub wording without broken separator characters
  (`apps/web/src/app/settings/page.tsx`,
  `apps/web/src/app/journal/page.tsx`,
  `apps/web/src/app/life-areas/page.tsx`,
  `apps/mobile/app/(tabs)/settings.tsx`)
- `NEST-204` completed: mobile settings/support surfaces now use calmer,
  product-safe feedback copy instead of raw technical wording across offline
  sync, notifications, Copilot, billing, and insights, while keeping the
  mobile typecheck/export/unit baseline green
  (`apps/mobile/app/modal.tsx`,
  `apps/mobile/app/(tabs)/billing.tsx`,
  `apps/mobile/app/(tabs)/insights.tsx`)
- `NEST-203` completed: key web status surfaces now use user-safer feedback
  copy instead of raw `HTTP`/`API failed` wording, a shared API issue helper
  exists for consistent product messaging, and lingering web lint blockers were
  removed from onboarding, pre-auth language selection, and several CRUD
  screens
  (`apps/web/src/lib/ux-contract.ts`,
  `apps/web/src/app/automations/page.tsx`,
  `apps/web/src/app/billing/page.tsx`,
  `apps/web/src/app/insights/page.tsx`,
  `apps/web/src/components/api-connect-card.tsx`,
  `apps/web/src/components/conflict-queue-card.tsx`,
  `apps/web/src/components/integration-health-center-card.tsx`,
  `apps/web/src/components/provider-connections-card.tsx`,
  `apps/web/src/components/offline-sync-card.tsx`,
  `apps/web/src/app/onboarding/page.tsx`,
  `apps/web/src/components/pre-auth-language-selector.tsx`)
- `NEST-198` completed: mobile baseline stabilization is green again after
  fixing the tab-layout type regressions that previously blocked mobile
  TypeScript validation and export checks
  (`apps/mobile/app/(tabs)/_layout.tsx`)
- `NEST-199` completed: mobile `Goals + Targets` is no longer a representational
  placeholder; it now exposes an API-backed planning flow with create/edit/
  archive actions for both goals and targets
  (`apps/mobile/app/(tabs)/goals.tsx`)
- `NEST-200` completed: mobile `Journal + Life Areas` is no longer a
  representational placeholder; it now exposes an API-backed reflection flow
  with create/edit/delete journal entries and create/edit/archive life areas
  (`apps/mobile/app/(tabs)/journal.tsx`)
- `NEST-201` completed: mobile `Habits + Routines` is no longer a
  representational placeholder; it now exposes an API-backed consistency flow
  with create/edit/pause/delete habits, quick logging, and create/edit/pause/
  delete routines
  (`apps/mobile/app/(tabs)/habits.tsx`)
- `NEST-202` completed: mobile now has a first-class `Settings + More` hub in
  the main tab navigation, so advanced controls and non-core mobile surfaces
  are reachable without relying on hidden modal-only discovery
  (`apps/mobile/app/(tabs)/settings.tsx`,
  `apps/mobile/app/(tabs)/_layout.tsx`)
- `NEST-197` completed: one canonical founder-ready gate now exists for the
  `v1` repair wave, defining the minimum readiness baseline across repository
  truth, backend reliability, web closure, mobile parity, cross-surface
  integrity, and daily-use quality
  (`docs/planning/v1_founder_ready_checklist_2026-04-26.md`)
- `NEST-196` completed: web entry-path repair now aligns onboarding-required
  access behavior with route guards and redirect flows, while auth/onboarding
  copy and localization baseline are materially cleaner for the first-use path
  (`apps/web/src/lib/route-guard.ts`,
  `apps/web/scripts/route-guard-regression.mjs`,
  `apps/web/src/app/auth/page.tsx`,
  `apps/web/src/app/onboarding/page.tsx`,
  `apps/web/src/components/pre-auth-language-selector.tsx`,
  `apps/web/src/components/public-shell.tsx`,
  `apps/web/src/lib/ui-language.ts`,
  `packages/shared-types/src/localization.js`)
- `NEST-195` completed: repository startup guidance and API sync regression
  truth are aligned with the current architecture, including corrected local
  run docs, deterministic Laravel testing defaults, and async-contract
  integration regressions for queue-first sync behavior
  (`readme.md`,
  `docs/engineering/development_and_deployment.md`,
  `apps/web/README.md`,
  `apps/api/tests/TestCase.php`,
  `apps/api/tests/Integration/ListTaskSyncPipelineTest.php`,
  `apps/api/tests/Integration/IntegrationProviderRegressionTest.php`,
  `apps/api/tests/Integration/TenantIsolationVerificationTest.php`)
- `NEST-194` completed: deep project audit findings are now converted into one
  canonical `v1` repair execution plan covering repo truth recovery, web
  product closure, mobile parity recovery, shared-contract hardening, and
  final polish sequencing
  (`docs/planning/v1_repair_execution_plan_2026-04-26.md`)
- `NEST-192` completed: architecture and planning documentation now separate
  practical `v1` delivery from later `v2` AI-assisted expansion through a
  canonical split doc, refreshed product framing, and a dedicated `v1`
  execution-focus plan
  (`docs/architecture/v1_v2_delivery_split.md`,
  `docs/planning/v1_execution_focus_2026-04-26.md`,
  `docs/product/overview.md`,
  `docs/product/roadmap.md`)
- `NEST-193` completed: architecture assumptions now capture private-first
  ownership in `v1`, shareable user-defined spaces in `v2`, dual AI operation
  modes (in-app assist + external delegated agent), and Nest-first
  bidirectional integration sync policy
  (`docs/architecture/v1_v2_delivery_split.md`,
  `docs/architecture/system-architecture.md`,
  `docs/modules/ai_layer.md`,
  `docs/architecture/core_principles.md`)

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

- Dashboard editorial-entry and shell-serenity pass landed on 2026-04-26 to
  further soften the rail, tighten the hero/focus composition, and calm the
  lower dashboard zone in:
  `apps/web/src/app/globals.css`
  with refreshed parity evidence:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseI.png`
- Phase I review on 2026-04-26 confirmed that the dashboard is again closer to
  the canonical founder reference, with remaining gaps now mostly in
  title/art-direction nuance and support-rail softness, recorded in:
  `docs/ux/nest_226_dashboard_parity_review_phaseI_2026-04-26.md`
- Dashboard founder finish pass landed on 2026-04-26 to reduce rail icon
  dominance, improve editorial title/hero proportion, and soften the right
  `Journal` surface in:
  `apps/web/src/app/globals.css`
  with refreshed parity evidence:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseJ.png`
- Phase J review on 2026-04-26 confirmed that the dashboard is closer again to
  the founder target, with remaining gap now concentrated in title typography,
  hero metric rhythm, and lower-zone ornament balance, recorded in:
  `docs/ux/nest_228_dashboard_parity_review_phaseJ_2026-04-26.md`
- Dashboard micro-finish pass landed on 2026-04-26 to calm the title/subtitle
  cadence, tighten hero metric rhythm, and soften lower dashboard detailing
  in:
  `apps/web/src/app/globals.css`
  with refreshed parity evidence:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseK.png`
- Phase K review on 2026-04-26 confirmed another step toward founder parity,
  with remaining gap now narrowed to final title proportion, hero landscape
  softness, right-rail atmosphere, and lower-card ornamental detail, recorded
  in:
  `docs/ux/nest_230_dashboard_parity_review_phaseK_2026-04-26.md`
- Dashboard ultra-narrow finish pass landed on 2026-04-26 to refine top-entry
  cadence, hero story proportion, hero metric spacing, and lower-card finish
  in:
  `apps/web/src/app/globals.css`
  with refreshed parity evidence:
  `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseL.png`
- Phase L review on 2026-04-26 confirmed that the dashboard is now extremely
  close to the canonical founder target, with remaining differences limited to
  painterly softness and tiny decorative nuance, recorded in:
  `docs/ux/nest_232_dashboard_parity_review_phaseL_2026-04-26.md`
- Dashboard painterly finish pass landed on 2026-04-28 to further soften the
  hero landscape, warm the right rail, calm the top entry, and reduce lower
  card mechanical feel in:
  `apps/web/src/app/globals.css`
  with refreshed parity evidence:
  `docs/ux_canonical_artifacts/2026-04-28/nest-dashboard-web-parity-preview-phaseM.png`
- Phase M review on 2026-04-28 confirmed that the remaining gap is now almost
  entirely art-directional nuance rather than layout or hierarchy mismatch,
  recorded in:
  `docs/ux/nest_234_dashboard_parity_review_phaseM_2026-04-28.md`
- Dashboard canonical micro parity pass landed on 2026-04-29 to remove
  non-canonical shell chrome, simplify `Now focus`, and bring the lower
  ledger and life-area donut closer to the founder screenshot in:
  `apps/web/src/app/dashboard/page.tsx`
  `apps/web/src/components/workspace-shell.tsx`
  `apps/web/src/components/workspace-primitives.tsx`
  `apps/web/src/app/globals.css`
  with refreshed parity evidence:
  `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseU.png`
- Phase U review on 2026-04-29 confirmed another meaningful convergence step
  toward the canonical dashboard image, with remaining drift now concentrated
  in `Now focus`, left-rail micro-spacing, and typography tuning, recorded in:
  `docs/ux/nest_246_dashboard_parity_review_phaseU_2026-04-29.md`
