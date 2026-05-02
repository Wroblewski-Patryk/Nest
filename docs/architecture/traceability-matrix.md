# Traceability Matrix

Last updated: 2026-05-03

## Purpose

This matrix maps important behavior across UI, API, services, data, tests, and
docs. `GAP` means a link is missing or incomplete. `UNVERIFIED` means the
current pass did not prove the connection from code.

## Core Feature Traceability

| Feature | Frontend entry | Backend route/API | Service/module | Database model | Pipeline | Tests | Related docs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Auth and user settings | `apps/web/src/app/auth/page.tsx`, `apps/web/src/app/settings/page.tsx`, mobile settings | `/api/v1/auth/*` | `AuthController`, `UserSettingsController`, auth services, route guard/session libs | `User`, `Tenant`, `OAuthIdentity`, delegated credential/token tables | Auth/session pipeline | `AuthApiTest`, `OAuthProviderAuthApiTest`, route guard tests/scripts | `docs/engineering/api_contracts.md`, `docs/modules/localization_foundation_v1.md` |
| Dashboard daily overview | `apps/web/src/app/dashboard/page.tsx`, mobile index | Aggregates multiple core APIs via web API client | Web dashboard composition and core controllers | Tasks, events, habits, journal entries, life areas | Dashboard daily overview pipeline | Web smoke/unit evidence in planning/UX reports; API feature tests per module | `docs/ux/nest_canonical_view_architecture_2026-05-02.md`, `docs/planning/nest_317_canonical_state_responsive_qa_2026-05-02.md` |
| Planning tasks and lists | `apps/web/src/app/tasks/page.tsx`, mobile goals/tasks-related surfaces | `/api/v1/lists`, `/api/v1/tasks` | `TaskListController`, `TaskController`, policies | `TaskList`, `Task`, `AssignmentTimeline`, `SyncMapping` | Planning task capture pipeline; list/task sync pipeline | `TasksAndListsApiTest`, `ListTaskSyncPipelineTest`, `TenantIsolationVerificationTest` | `docs/engineering/contracts/openapi_tasks_lists_v1.yaml`, `docs/modules/shared_planning_assignment_handoff_reminder_ownership_v2.md` |
| Calendar events | `apps/web/src/app/calendar/page.tsx`, `apps/mobile/app/(tabs)/calendar.tsx` | `/api/v1/calendar-events` | `CalendarEventController`, `CalendarIntegrationSyncService` | `CalendarEvent`, `AssignmentTimeline`, `SyncMapping` | Calendar event management pipeline; calendar integration sync pipeline | `CalendarEventsApiTest`, `IntegrationCalendarSyncApiTest` | `docs/engineering/contracts/openapi_core_modules_v1.yaml`, `docs/modules/background_auto_sync_adaptive_retry_v2.md` |
| Journal entries | `apps/web/src/app/journal/page.tsx`, `apps/mobile/app/(tabs)/journal.tsx` | `/api/v1/journal-entries` | `JournalEntryController`, `JournalIntegrationSyncService` | `JournalEntry`, `LifeArea`, `SyncMapping` | Journal reflection pipeline; journal integration sync pipeline | `JournalAndLifeAreasApiTest`, `IntegrationJournalSyncApiTest` | `docs/engineering/contracts/openapi_core_modules_v1.yaml`, `docs/ux/nest_290_journal_canonical_material_finish_2026-05-02.md` |
| Habits and routines | `apps/web/src/app/habits/page.tsx`, `apps/web/src/app/routines/page.tsx`, mobile habits | `/api/v1/habits`, `/api/v1/habits/{id}/logs`, `/api/v1/routines` | `HabitController`, `RoutineController`, `HabitPolicy` | `Habit`, `HabitLog`, `Routine`, `RoutineStep` | Habit/routine consistency pipeline | `HabitsAndRoutinesApiTest` | `docs/engineering/contracts/openapi_core_modules_v1.yaml`, `docs/modules/manual_sync_retry_conflict_resolution_baseline_v1.md` |
| Goals and targets | `apps/web/src/app/goals/page.tsx`, `apps/web/src/app/targets/page.tsx`, mobile goals | `/api/v1/goals`, `/api/v1/targets` | `GoalController`, `TargetController`, `GoalPolicy` | `Goal`, `Target` | Goal/target planning pipeline | `GoalsAndTargetsApiTest` | `docs/engineering/contracts/openapi_core_modules_v1.yaml`, `docs/architecture/domain_model.md` |
| Life areas and balance | `apps/web/src/app/life-areas/page.tsx`, journal surfaces, mobile journal | `/api/v1/life-areas`, `/api/v1/insights/life-area-balance` | `LifeAreaController`, `LifeAreaBalanceScoreController`, `LifeAreaBalanceScoreService`, `LifeAreaPolicy` | `LifeArea`, tasks/goals/journal references | Life-area balance pipeline | `JournalAndLifeAreasApiTest`, `LifeAreaBalanceScoreApiTest`, `LifeAreaPolicyActorContextTest` | `docs/modules/life_area_balance_score_model.md` |
| Integrations and sync | Web integration/support cards | `/api/v1/integrations/*` | `IntegrationSyncController`, provider adapters, sync services, health/conflict/replay services | `IntegrationCredential`, `SyncMapping`, `IntegrationSyncAudit`, `IntegrationSyncConflict`, `IntegrationSyncFailure`, `IntegrationEventIngestion` | List/task, calendar, journal sync pipelines | `Integration*ApiTest`, `IntegrationProviderRegressionTest`, `ListTaskSyncPipelineTest`, adapter unit tests | `docs/modules/integrations.md`, `docs/engineering/integration_regression_suite.md` |
| Automation rules/runs | `apps/web/src/app/automations/page.tsx` | `/api/v1/automations/rules`, `/api/v1/automations/runs` | `AutomationRuleController`, `AutomationRunController`, `AutomationEngineService` | `AutomationRule`, `AutomationRun` | Automation execution pipeline | `AutomationEngineApiTest` | `docs/modules/automation_engine_v1.md`, `docs/engineering/contracts/openapi_automation_rules_v1.yaml` |
| Notifications | Web notification cards, mobile push registration surface | `/api/v1/notifications/*` | Notification controllers and services | `InAppNotification`, `NotificationPreference`, `NotificationChannelDelivery`, `MobilePushDevice`, `MobilePushDelivery` | Notification delivery pipeline | `InAppNotificationCenterApiTest`, `NotificationChannelMatrixApiTest`, `MobilePushDeviceApiTest`, command tests | `docs/modules/in_app_notification_center_actionable_events_v2.md`, `docs/modules/mobile_push_notifications_baseline.md` |
| Billing and entitlements | `apps/web/src/app/billing/page.tsx`, mobile billing | `/api/v1/billing/*`, public Stripe webhook | Billing controllers/services, `EnforceBillingEntitlements` middleware | Billing and tenant subscription models | Billing lifecycle pipeline | `Billing*ApiTest`, `EntitlementEnforcementApiTest` | `docs/modules/billing_subscription_lifecycle_backend.md`, `docs/modules/billing_self_serve_checkout_portal_dunning_v2.md` |
| AI copilot and actions | `apps/web/src/app/assistant/page.tsx`, `ai-copilot-card` | `/api/v1/ai/*` behind `ai.surface` | AI controllers and services, actor context, action proposal policy | AI models and actor audit | AI guarded action pipeline | `Ai*ApiTest`, `AiPolicyRegressionTest`, `MvpAiSurfaceGuardTest`, AI safety command test | `docs/modules/ai_layer.md`, `AI_TESTING_PROTOCOL.md` |
| Organizations/collaboration | Settings/admin-adjacent surfaces; some web entry is support-level | `/api/v1/orgs`, `/api/v1/workspaces`, `/api/v1/collaboration/*` | Organization and collaboration controllers/services | Organization, workspace, collaboration models | Collaboration workspace pipeline | `Organization*ApiTest`, `CollaborationSpacesApiTest` | `docs/modules/organization_workspace_domain_model.md`, `docs/modules/collaboration_spaces_v1.md` |
| Deployment/runtime | CI/Coolify/runbooks | Health checks, worker/scheduler, deploy workflows | Docker/Coolify/GitHub Actions/runtime configs | PostgreSQL/Redis runtime | Web-first release pipeline | CI workflows, post-deploy smoke, operations checklists | `docs/operations/nest_web_first_release_runbook_2026-05-02.md`, `DEPLOYMENT_GATE.md` |

## Known Traceability Gaps

- `GAP`: Several per-pipeline documents do not exist yet; the registry now
  names them as follow-up targets.
- `GAP`: Some module docs describe V2/planned capabilities, but the registry
  needs deeper code-level verification per file.
- `GAP`: Web and mobile tests are not all mapped one-to-one to feature rows in
  this matrix.
- `UNVERIFIED`: Some supporting web cards use integration/notification APIs,
  but this pass did not trace every prop and request path.
- `UNVERIFIED`: Some OpenAPI paths may lag route/controller reality; run
  Redocly lint and route-to-contract comparison before release sign-off.

## Maintenance Rule

Every new feature or significant behavior change must update its row. If no row
exists, add one before marking the task complete.
