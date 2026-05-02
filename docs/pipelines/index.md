# Pipeline Registry

Last updated: 2026-05-03

## Purpose

Pipelines describe cross-module flows. Each row links trigger, UI, backend,
data, failure points, tests, and related docs. This registry is the first
repair loop; individual pipeline files should be split out as the next
iterations harden each flow.

## Pipeline Format

Each pipeline must include:

- trigger
- user/system action
- involved frontend files
- involved backend files
- involved services
- data read/write
- failure points
- tests
- related docs

## Core Pipeline Registry

| Pipeline | Trigger | Frontend files | Backend files/services | Data read/write | Failure points | Tests | Related docs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Auth and session | Register/login/session/settings/logout | `apps/web/src/app/auth/page.tsx`, `apps/web/src/app/settings/page.tsx`, `auth-session.ts`, `route-guard.ts`, web API proxy | `AuthController`, `UserSettingsController`, delegated credential and AI agent controllers, auth services, middleware stack | `User`, `Tenant`, token/delegated credential/OAuth/SSO data | invalid credentials, onboarding routing, revoked token, delegated scope denial, quota/entitlement denial | `AuthApiTest`, `OAuthProviderAuthApiTest`, delegated/AI agent tests | `docs/engineering/api_contracts.md`, `docs/modules/localization_foundation_v1.md` |
| Dashboard daily overview | User opens `/dashboard` | `dashboard/page.tsx`, workspace shell/primitives | Core module controllers; dashboard aggregation is frontend-composed | tasks, events, habits, journal, life areas, notifications | auth/API outage, partial module failures, localization drift, showcase hiding real errors | API feature tests per module; web smoke evidence | `docs/ux/nest_canonical_view_architecture_2026-05-02.md`, `docs/ux/production_showcase_error_state_rule_2026-05-02.md` |
| Planning task capture | Create/edit/complete/assign/delete task or list | `apps/web/src/app/tasks/page.tsx`; adjacent mobile planning surfaces | `TaskController`, `TaskListController`, policies, assignment/collaboration services | `Task`, `TaskList`, `AssignmentTimeline`, `SyncMapping` | tenant breach, missing list, validation failure, assignment conflict, sync mapping divergence | `TasksAndListsApiTest`, `TenantIsolationVerificationTest`, `ListTaskSyncPipelineTest` | `docs/engineering/contracts/openapi_tasks_lists_v1.yaml` |
| Calendar event management | Open calendar or mutate event | `apps/web/src/app/calendar/page.tsx`, mobile calendar | `CalendarEventController`, `CalendarIntegrationSyncService` | `CalendarEvent`, `AssignmentTimeline`, `SyncMapping` | invalid date/time, hidden composer state, provider conflict, ownership breach | `CalendarEventsApiTest`, `IntegrationCalendarSyncApiTest` | `docs/engineering/contracts/openapi_core_modules_v1.yaml` |
| Journal reflection | Create/edit/delete/filter journal entry | `apps/web/src/app/journal/page.tsx`, mobile journal | `JournalEntryController`, `LifeAreaController`, `JournalIntegrationSyncService` | `JournalEntry`, `LifeArea`, `SyncMapping` | missing life area, validation failure, provider conflict, date/localization drift | `JournalAndLifeAreasApiTest`, `IntegrationJournalSyncApiTest` | `docs/ux/nest_290_journal_canonical_material_finish_2026-05-02.md` |
| Habit and routine consistency | Create/log/pause/delete rhythm records | web habits/routines, mobile habits | `HabitController`, `RoutineController`, `HabitPolicy` | `Habit`, `HabitLog`, `Routine`, `RoutineStep` | duplicate names, tenant breach, log-date collision, partial step update | `HabitsAndRoutinesApiTest` | `docs/engineering/contracts/openapi_core_modules_v1.yaml` |
| Integration sync | Manual/provider sync for tasks, calendar, journal | web integration/support cards | `IntegrationSyncController`, `ProcessIntegrationSyncJob`, adapters, sync/health/conflict/replay/marketplace services | credential, mapping, audit, conflict, failure, ingestion records | provider outage, credential expiry, mapping conflict, queue failure, replay failure | integration API tests, provider regression, adapter unit tests | `docs/modules/integrations.md`, `docs/engineering/integration_regression_suite.md` |
| Automation execution | Rule CRUD/execute/run replay | `apps/web/src/app/automations/page.tsx` | `AutomationRuleController`, `AutomationRunController`, `AutomationEngineService` | `AutomationRule`, `AutomationRun` | invalid trigger/action, entitlement denial, replay mismatch, missing target | `AutomationEngineApiTest` | `docs/modules/automation_engine_v1.md` |
| Billing lifecycle | Trial, activation, checkout/portal, webhook, dunning, cancel/recover | web/mobile billing | billing controllers/services, entitlement middleware | billing plans, entitlements, subscription, webhook, self-serve, dunning, tenant events | webhook config/signature, entitlement mismatch, dunning drift, provider failure | billing feature tests, entitlement tests | billing module docs, billing OpenAPI spec |
| AI guarded actions | Copilot/action proposal/briefing/weekly plan/feedback | assistant page and AI card | AI controllers/services, actor context, AI surface gate, policy/evaluation | AI proposal/briefing/feedback/audit models | surface disabled, prompt injection, unauthorized data access, missing approval, actor breach | AI feature/policy/safety tests | `docs/modules/ai_layer.md`, `AI_TESTING_PROTOCOL.md` |
| Web-first release | Release candidate or deploy | web app, CI workflows | Docker/Coolify/GitHub Actions, API/web configs, worker/scheduler | production DB and queues | stack drift, missing env, migration failure, worker failure, auth proxy failure, smoke failure | CI, post-deploy smoke, release checklist | `docs/operations/nest_web_first_release_runbook_2026-05-02.md`, `DEPLOYMENT_GATE.md` |

## Required Follow-Up Pipeline Files

Create one file per pipeline when the next repair loop focuses that area:

- `docs/pipelines/auth-session.md`
- `docs/pipelines/dashboard-daily-overview.md`
- `docs/pipelines/planning-task-capture.md`
- `docs/pipelines/calendar-event-management.md`
- `docs/pipelines/journal-reflection.md`
- `docs/pipelines/habit-routine-consistency.md`
- `docs/pipelines/integration-sync.md`
- `docs/pipelines/automation-execution.md`
- `docs/pipelines/billing-lifecycle.md`
- `docs/pipelines/ai-guarded-actions.md`
- `docs/pipelines/web-first-release.md`
