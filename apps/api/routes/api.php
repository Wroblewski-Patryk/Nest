<?php

use App\Http\Controllers\Api\AiRecommendationFeedbackController;
use App\Http\Controllers\Api\AiContextGraphController;
use App\Http\Controllers\Api\AiWeeklyPlanController;
use App\Http\Controllers\Api\AnalyticsIngestionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AutomationRuleController;
use App\Http\Controllers\Api\AutomationRunController;
use App\Http\Controllers\Api\BillingEventController;
use App\Http\Controllers\Api\BillingSubscriptionController;
use App\Http\Controllers\Api\BillingWebhookController;
use App\Http\Controllers\Api\CalendarEventController;
use App\Http\Controllers\Api\CollaborationInviteController;
use App\Http\Controllers\Api\CollaborationSpaceController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\HabitController;
use App\Http\Controllers\Api\InsightsTrendController;
use App\Http\Controllers\Api\IntegrationConflictController;
use App\Http\Controllers\Api\IntegrationConnectionController;
use App\Http\Controllers\Api\IntegrationSyncController;
use App\Http\Controllers\Api\IntegrationSyncReplayController;
use App\Http\Controllers\Api\InAppNotificationController;
use App\Http\Controllers\Api\JournalEntryController;
use App\Http\Controllers\Api\LifeAreaBalanceScoreController;
use App\Http\Controllers\Api\LifeAreaController;
use App\Http\Controllers\Api\MobilePushDeviceController;
use App\Http\Controllers\Api\NotificationDeliveryController;
use App\Http\Controllers\Api\NotificationPreferenceController;
use App\Http\Controllers\Api\OrganizationAuditExportController;
use App\Http\Controllers\Api\OrganizationSsoController;
use App\Http\Controllers\Api\OrganizationWorkspaceController;
use App\Http\Controllers\Api\RoutineController;
use App\Http\Controllers\Api\TargetController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskListController;
use App\Http\Controllers\Api\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/auth/localization/options', [AuthController::class, 'localizationOptions']);
    Route::post('/auth/oauth/{provider}/exchange', [AuthController::class, 'oauthExchange']);
    Route::post('/auth/orgs/{organizationSlug}/sso/{providerSlug}/exchange', [OrganizationSsoController::class, 'exchange']);
    Route::post('/billing/providers/stripe/webhook', [BillingWebhookController::class, 'stripe']);

    Route::middleware(['auth:sanctum', 'tenant.usage', 'entitlements'])->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [UserSettingsController::class, 'me']);
        Route::patch('/auth/settings', [UserSettingsController::class, 'update']);
        Route::post('/auth/onboarding', [UserSettingsController::class, 'completeOnboarding']);
        Route::get('/billing/subscription', [BillingSubscriptionController::class, 'show']);
        Route::get('/billing/events', [BillingEventController::class, 'index']);
        Route::post('/billing/subscription/start-trial', [BillingSubscriptionController::class, 'startTrial']);
        Route::post('/billing/subscription/activate', [BillingSubscriptionController::class, 'activate']);
        Route::post('/billing/subscription/past-due', [BillingSubscriptionController::class, 'markPastDue']);
        Route::post('/billing/subscription/cancel', [BillingSubscriptionController::class, 'cancel']);
        Route::post('/analytics/events', [AnalyticsIngestionController::class, 'ingest']);
        Route::middleware('ai.surface')->group(function (): void {
            Route::get('/ai/context-graph', [AiContextGraphController::class, 'show']);
            Route::post('/ai/weekly-plan/propose', [AiWeeklyPlanController::class, 'propose']);
            Route::post('/ai/feedback', [AiRecommendationFeedbackController::class, 'store']);
        });
        Route::get('/insights/life-area-balance', [LifeAreaBalanceScoreController::class, 'show']);
        Route::get('/insights/trends/tasks', [InsightsTrendController::class, 'tasks']);
        Route::get('/insights/trends/habits', [InsightsTrendController::class, 'habits']);
        Route::get('/insights/trends/goals', [InsightsTrendController::class, 'goals']);
        Route::get('/orgs', [OrganizationWorkspaceController::class, 'listOrganizations']);
        Route::post('/orgs', [OrganizationWorkspaceController::class, 'createOrganization']);
        Route::post('/orgs/{organizationId}/members', [OrganizationWorkspaceController::class, 'addOrganizationMember']);
        Route::patch('/orgs/{organizationId}/members/{memberUserId}', [OrganizationWorkspaceController::class, 'updateOrganizationMemberRole']);
        Route::get('/orgs/{organizationId}/sso/providers', [OrganizationSsoController::class, 'index']);
        Route::post('/orgs/{organizationId}/sso/providers', [OrganizationSsoController::class, 'store']);
        Route::patch('/orgs/{organizationId}/sso/providers/{providerId}', [OrganizationSsoController::class, 'update']);
        Route::get('/orgs/{organizationId}/audit-exports', [OrganizationAuditExportController::class, 'export']);
        Route::get('/workspaces', [OrganizationWorkspaceController::class, 'listWorkspaces']);
        Route::post('/workspaces', [OrganizationWorkspaceController::class, 'createWorkspace']);
        Route::get('/collaboration/spaces', [CollaborationSpaceController::class, 'index']);
        Route::post('/collaboration/spaces', [CollaborationSpaceController::class, 'store']);
        Route::post('/collaboration/spaces/{spaceId}/invites', [CollaborationSpaceController::class, 'invite']);
        Route::get('/collaboration/spaces/{spaceId}/members', [CollaborationSpaceController::class, 'members']);
        Route::patch('/collaboration/spaces/{spaceId}/members/{memberUserId}', [CollaborationSpaceController::class, 'updateMemberRole']);
        Route::delete('/collaboration/spaces/{spaceId}/members/{memberUserId}', [CollaborationSpaceController::class, 'removeMember']);
        Route::post('/collaboration/invites/{token}/accept', [CollaborationInviteController::class, 'accept']);
        Route::post('/collaboration/spaces/{spaceId}/share/lists/{listId}', [CollaborationSpaceController::class, 'shareList']);
        Route::post('/collaboration/spaces/{spaceId}/share/goals/{goalId}', [CollaborationSpaceController::class, 'shareGoal']);
        Route::get('/automations/rules', [AutomationRuleController::class, 'index']);
        Route::post('/automations/rules', [AutomationRuleController::class, 'store']);
        Route::get('/automations/rules/{ruleId}', [AutomationRuleController::class, 'show']);
        Route::patch('/automations/rules/{ruleId}', [AutomationRuleController::class, 'update']);
        Route::delete('/automations/rules/{ruleId}', [AutomationRuleController::class, 'destroy']);
        Route::post('/automations/rules/{ruleId}/execute', [AutomationRuleController::class, 'execute']);
        Route::get('/automations/runs', [AutomationRunController::class, 'index']);
        Route::get('/automations/runs/{runId}', [AutomationRunController::class, 'show']);
        Route::post('/automations/runs/{runId}/replay', [AutomationRunController::class, 'replay']);

        Route::get('/lists', [TaskListController::class, 'index']);
        Route::post('/lists', [TaskListController::class, 'store']);
        Route::get('/lists/{listId}', [TaskListController::class, 'show']);
        Route::patch('/lists/{listId}', [TaskListController::class, 'update']);
        Route::delete('/lists/{listId}', [TaskListController::class, 'destroy']);

        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::get('/tasks/{taskId}', [TaskController::class, 'show']);
        Route::patch('/tasks/{taskId}', [TaskController::class, 'update']);
        Route::get('/tasks/{taskId}/assignment-timeline', [TaskController::class, 'assignmentTimeline']);
        Route::delete('/tasks/{taskId}', [TaskController::class, 'destroy']);

        Route::get('/habits', [HabitController::class, 'index']);
        Route::post('/habits', [HabitController::class, 'store']);
        Route::get('/habits/{habitId}', [HabitController::class, 'show']);
        Route::patch('/habits/{habitId}', [HabitController::class, 'update']);
        Route::delete('/habits/{habitId}', [HabitController::class, 'destroy']);
        Route::post('/habits/{habitId}/logs', [HabitController::class, 'log']);

        Route::get('/routines', [RoutineController::class, 'index']);
        Route::post('/routines', [RoutineController::class, 'store']);
        Route::get('/routines/{routineId}', [RoutineController::class, 'show']);
        Route::patch('/routines/{routineId}', [RoutineController::class, 'update']);
        Route::delete('/routines/{routineId}', [RoutineController::class, 'destroy']);

        Route::get('/goals', [GoalController::class, 'index']);
        Route::post('/goals', [GoalController::class, 'store']);
        Route::get('/goals/{goalId}', [GoalController::class, 'show']);
        Route::patch('/goals/{goalId}', [GoalController::class, 'update']);
        Route::delete('/goals/{goalId}', [GoalController::class, 'destroy']);

        Route::get('/targets', [TargetController::class, 'index']);
        Route::post('/targets', [TargetController::class, 'store']);
        Route::get('/targets/{targetId}', [TargetController::class, 'show']);
        Route::patch('/targets/{targetId}', [TargetController::class, 'update']);
        Route::delete('/targets/{targetId}', [TargetController::class, 'destroy']);

        Route::get('/life-areas', [LifeAreaController::class, 'index']);
        Route::post('/life-areas', [LifeAreaController::class, 'store']);
        Route::get('/life-areas/{lifeAreaId}', [LifeAreaController::class, 'show']);
        Route::patch('/life-areas/{lifeAreaId}', [LifeAreaController::class, 'update']);
        Route::delete('/life-areas/{lifeAreaId}', [LifeAreaController::class, 'destroy']);

        Route::get('/journal-entries', [JournalEntryController::class, 'index']);
        Route::post('/journal-entries', [JournalEntryController::class, 'store']);
        Route::get('/journal-entries/{journalEntryId}', [JournalEntryController::class, 'show']);
        Route::patch('/journal-entries/{journalEntryId}', [JournalEntryController::class, 'update']);
        Route::delete('/journal-entries/{journalEntryId}', [JournalEntryController::class, 'destroy']);

        Route::get('/calendar-events', [CalendarEventController::class, 'index']);
        Route::post('/calendar-events', [CalendarEventController::class, 'store']);
        Route::get('/calendar-events/{eventId}', [CalendarEventController::class, 'show']);
        Route::patch('/calendar-events/{eventId}', [CalendarEventController::class, 'update']);
        Route::get('/calendar-events/{eventId}/assignment-timeline', [CalendarEventController::class, 'assignmentTimeline']);
        Route::delete('/calendar-events/{eventId}', [CalendarEventController::class, 'destroy']);

        Route::post('/integrations/list-task-sync', [IntegrationSyncController::class, 'syncListsAndTasks']);
        Route::post('/integrations/calendar-sync', [IntegrationSyncController::class, 'syncCalendar']);
        Route::post('/integrations/journal-sync', [IntegrationSyncController::class, 'syncJournal']);
        Route::get('/integrations/connections', [IntegrationConnectionController::class, 'index']);
        Route::put('/integrations/connections/{provider}', [IntegrationConnectionController::class, 'upsert']);
        Route::delete('/integrations/connections/{provider}', [IntegrationConnectionController::class, 'revoke']);
        Route::get('/integrations/conflicts', [IntegrationConflictController::class, 'index']);
        Route::post('/integrations/conflicts/{conflictId}/resolve', [IntegrationConflictController::class, 'resolve']);
        Route::get('/integrations/failures', [IntegrationSyncReplayController::class, 'index']);
        Route::post('/integrations/failures/{failureId}/replay', [IntegrationSyncReplayController::class, 'replay']);

        Route::get('/notifications/mobile/devices', [MobilePushDeviceController::class, 'index']);
        Route::post('/notifications/mobile/devices', [MobilePushDeviceController::class, 'store']);
        Route::delete('/notifications/mobile/devices/{deviceId}', [MobilePushDeviceController::class, 'destroy']);
        Route::get('/notifications/in-app', [InAppNotificationController::class, 'index']);
        Route::post('/notifications/in-app/{notificationId}/read', [InAppNotificationController::class, 'markRead']);
        Route::post('/notifications/in-app/{notificationId}/unread', [InAppNotificationController::class, 'markUnread']);
        Route::post('/notifications/in-app/{notificationId}/snooze', [InAppNotificationController::class, 'snooze']);
        Route::get('/notifications/preferences', [NotificationPreferenceController::class, 'show']);
        Route::patch('/notifications/preferences', [NotificationPreferenceController::class, 'update']);
        Route::get('/notifications/deliveries', [NotificationDeliveryController::class, 'index']);
    });
});
