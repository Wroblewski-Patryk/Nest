<?php

use App\Http\Controllers\Api\AiRecommendationFeedbackController;
use App\Http\Controllers\Api\AiWeeklyPlanController;
use App\Http\Controllers\Api\AnalyticsIngestionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AutomationRuleController;
use App\Http\Controllers\Api\AutomationRunController;
use App\Http\Controllers\Api\CalendarEventController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\HabitController;
use App\Http\Controllers\Api\InsightsTrendController;
use App\Http\Controllers\Api\IntegrationConflictController;
use App\Http\Controllers\Api\IntegrationConnectionController;
use App\Http\Controllers\Api\IntegrationSyncController;
use App\Http\Controllers\Api\IntegrationSyncReplayController;
use App\Http\Controllers\Api\JournalEntryController;
use App\Http\Controllers\Api\LifeAreaBalanceScoreController;
use App\Http\Controllers\Api\LifeAreaController;
use App\Http\Controllers\Api\MobilePushDeviceController;
use App\Http\Controllers\Api\RoutineController;
use App\Http\Controllers\Api\TargetController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskListController;
use App\Http\Controllers\Api\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'tenant.usage'])->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [UserSettingsController::class, 'me']);
        Route::patch('/auth/settings', [UserSettingsController::class, 'update']);
        Route::post('/analytics/events', [AnalyticsIngestionController::class, 'ingest']);
        Route::middleware('ai.surface')->group(function (): void {
            Route::post('/ai/weekly-plan/propose', [AiWeeklyPlanController::class, 'propose']);
            Route::post('/ai/feedback', [AiRecommendationFeedbackController::class, 'store']);
        });
        Route::get('/insights/life-area-balance', [LifeAreaBalanceScoreController::class, 'show']);
        Route::get('/insights/trends/tasks', [InsightsTrendController::class, 'tasks']);
        Route::get('/insights/trends/habits', [InsightsTrendController::class, 'habits']);
        Route::get('/insights/trends/goals', [InsightsTrendController::class, 'goals']);
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
    });
});
