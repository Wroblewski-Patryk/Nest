# Module Registry

Last updated: 2026-05-03

## Purpose

This registry is the technical map of Nest modules. It links each module to
its responsibility, public interface, dependencies, pipelines, data, tests, and
known gaps. Individual files in `docs/modules/` remain deep dives; this file is
the dependency index.

## Module Registry

| Module | Responsibility | Public interface | Dependencies | Used by pipelines | Data/models | Tests | Related docs | Known gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Auth, settings, delegated access | Login/register/session, settings, delegated credentials, AI agent accounts | `/api/v1/auth/*`, settings route, web route guard | Sanctum, middleware, actor context, tenant quota, entitlements | Auth/session, AI guarded actions | `User`, `Tenant`, tokens, OAuth/SSO, actor audit | `AuthApiTest`, `DelegatedCredentialApiTest`, `AiAgentAccountApiTest` | `docs/security/oauth_b2c_auth_expansion.md`, `docs/modules/delegated_ai_api_credentials_v1.md` | Web/mobile route-to-test map incomplete |
| Tasks and lists | Planning objects, task lifecycle, list ownership | `/api/v1/tasks`, `/api/v1/lists`, web `/tasks` | policies, integrations, assignment/collaboration | Planning task capture, dashboard, list/task sync | `Task`, `TaskList`, `AssignmentTimeline`, `SyncMapping` | `TasksAndListsApiTest`, `ListTaskSyncPipelineTest` | `docs/engineering/contracts/openapi_tasks_lists_v1.yaml` | Existing `docs/architecture/modules.md` is too shallow |
| Calendar | Event lifecycle and assignment timeline | `/api/v1/calendar-events`, web `/calendar` | integrations, assignment timeline | Calendar event management, dashboard, calendar sync | `CalendarEvent`, `AssignmentTimeline`, `SyncMapping` | `CalendarEventsApiTest`, `IntegrationCalendarSyncApiTest` | `docs/engineering/contracts/openapi_core_modules_v1.yaml` | Per-pipeline file missing |
| Journal and life areas | Reflection entries and life-area organization | `/api/v1/journal-entries`, `/api/v1/life-areas`, web `/journal`, `/life-areas` | life-area policy, integrations, insights | Journal reflection, dashboard, life-area balance, journal sync | `JournalEntry`, `LifeArea`, `SyncMapping` | `JournalAndLifeAreasApiTest`, `LifeAreaBalanceScoreApiTest` | `docs/modules/life_area_balance_score_model.md` | Some UX docs are richer than technical docs |
| Habits and routines | Repeating behavior tracking and routine sequences | `/api/v1/habits`, `/api/v1/routines`, web/mobile rhythm screens | tenant policies, dashboard | Habit/routine consistency, dashboard | `Habit`, `HabitLog`, `Routine`, `RoutineStep` | `HabitsAndRoutinesApiTest` | `docs/engineering/contracts/openapi_core_modules_v1.yaml` | Need dedicated module deep-dive update |
| Goals and targets | Long-term objectives and measurable targets | `/api/v1/goals`, `/api/v1/targets`, web `/goals`, `/targets` | goal policy, planning, life areas | Goal/target planning, dashboard | `Goal`, `Target` | `GoalsAndTargetsApiTest` | `docs/architecture/domain_model.md` | Need module file tied to current code |
| Insights and analytics | Life-area balance, trend endpoints, event ingestion, decision dashboard | `/api/v1/insights/*`, `/api/v1/analytics/*` | core module data, analytics services | Dashboard, life-area balance, analytics ingestion | `AnalyticsEvent`, core domain models | `AnalyticsIngestionApiTest`, `InsightsTrendApiTest`, `LifeAreaBalanceScoreApiTest` | `docs/modules/analytics_ingestion_pipeline.md`, `docs/modules/insights_trends_api.md` | Web analytics views are support-level; mapping needs deeper pass |
| Integrations | Provider connections, sync, health, conflicts, replay, marketplace | `/api/v1/integrations/*` | adapters, queues, credentials, sync mappings | Integration sync pipelines, dashboard support cards | integration credential/sync/conflict/failure models | `Integration*ApiTest`, adapter unit tests | `docs/modules/integrations.md`, `docs/modules/integration_sync_slos.md` | Provider-by-provider docs need code-linked refresh |
| Automation | Automation rule CRUD, execution, runs and replay | `/api/v1/automations/*`, web `/automations` | entitlements, core module targets | Automation execution | `AutomationRule`, `AutomationRun` | `AutomationEngineApiTest` | `docs/modules/automation_engine_v1.md` | Pipeline details should move to dedicated file |
| Notifications | In-app notifications, preferences, deliveries, mobile push devices | `/api/v1/notifications/*`, web support cards, mobile devices | notification services, channel telemetry | Notification delivery, dashboard support | notification and mobile push models | notification/mobile push feature tests | notification module docs | Need route-to-client mapping for each card |
| Billing and entitlements | Subscription lifecycle, checkout, portal, dunning, webhooks, enforcement | `/api/v1/billing/*`, Stripe webhook, web/mobile billing | Stripe/provider config, entitlement middleware | Billing lifecycle, release/runtime | billing and subscription models | `Billing*ApiTest`, `EntitlementEnforcementApiTest` | billing module docs, OpenAPI billing spec | Provider configuration specifics are environment-dependent |
| AI layer | Guarded copilot, context graph, action proposals, briefings, weekly plan, feedback | `/api/v1/ai/*`, web `/assistant` | AI surface gate, actor context, policy/evaluation, domain context | AI guarded action pipeline | AI proposal/briefing/feedback/audit models | `Ai*ApiTest`, AI policy/safety tests | `docs/modules/ai_layer.md`, `AI_TESTING_PROTOCOL.md` | Must keep V1/V2 surface status explicit |
| Organizations and collaboration | Organization/workspace domain, SSO, RBAC, shared spaces/invites | `/api/v1/orgs`, `/api/v1/workspaces`, `/api/v1/collaboration/*` | auth, organization services, collaboration access | Collaboration workspace pipeline, shared planning | organization/workspace/collaboration models | organization/collaboration feature tests | org/collab module docs | Current web entrypoints are less explicit than API breadth |
| Tenancy, quotas, lifecycle | Tenant isolation, usage quotas, lifecycle deletion/retention | middleware, tenant services, lifecycle jobs/commands | all modules | All pipelines | `Tenant`, lifecycle audit, tenant-scoped domain records | tenant isolation/lifecycle/quota tests | tenancy/security docs | Requires recurring coverage-ledger checks |
| Security and observability | Secret rotation, controls verification, metrics, SLO checks | commands/services/tests | runtime, integrations, deployment | Release pipeline, integration sync | `SecretRotationAudit`, metrics/logs | security/observability tests | security and operations docs | Need automated doc link from controls to tests |
| Web shell and shared UI | Canonical web shell, components, confirmation, localization, support cards | Next routes/components | shared types, API client, localization | Dashboard, planning, calendar, journal, settings | client state and API data | web lint/typecheck/build/unit/smoke evidence | UX docs, planning reports | Active `NEST-321` localization closure in progress |
| Mobile app | Expo mobile surfaces for core/support modules | Expo Router tabs | shared types, API client | V2 mobile parity and support flows | API-backed domain data | mobile typecheck/export/unit evidence | mobile planning docs | Release promise is V2; keep status explicit |

## Existing Deep-Dive Files

This registry does not replace existing module files. Use it as the first
dependency map, then open the matching deep-dive file under `docs/modules/`.

High-confidence current anchors:

- `docs/modules/integrations.md`
- `docs/modules/automation_engine_v1.md`
- `docs/modules/ai_layer.md`
- `docs/modules/localization_foundation_v1.md`
- `docs/modules/life_area_balance_score_model.md`
- `docs/modules/billing_subscription_lifecycle_backend.md`
- `docs/modules/organization_workspace_domain_model.md`
- `docs/modules/tenant_data_lifecycle_workflows.md`
- `docs/modules/tenant_usage_limits_and_quotas.md`

## Registry Maintenance

When a module changes, update:

1. This registry row.
2. The module deep-dive file.
3. `docs/architecture/traceability-matrix.md`.
4. Any pipeline row or file using the module.
5. Relevant OpenAPI/schema/test docs.
