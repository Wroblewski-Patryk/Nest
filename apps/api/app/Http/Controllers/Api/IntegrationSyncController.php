<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Integrations\Services\CalendarIntegrationSyncService;
use App\Integrations\Services\JournalIntegrationSyncService;
use App\Integrations\Services\ListTaskIntegrationSyncService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IntegrationSyncController extends Controller
{
    public function syncListsAndTasks(
        Request $request,
        ListTaskIntegrationSyncService $syncService
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'provider' => ['required', Rule::in(['trello', 'google_tasks', 'todoist', 'clickup', 'microsoft_todo'])],
        ]);

        $summary = $syncService->syncForUser($user, $payload['provider']);

        return response()->json([
            'data' => [
                'provider' => $payload['provider'],
                'mode' => 'async',
                ...$summary,
            ],
        ]);
    }

    public function syncCalendar(
        Request $request,
        CalendarIntegrationSyncService $syncService
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'provider' => ['required', Rule::in(['google_calendar'])],
        ]);

        $summary = $syncService->syncForUser($user, $payload['provider']);

        return response()->json([
            'data' => [
                'provider' => $payload['provider'],
                'mode' => 'async',
                ...$summary,
            ],
        ]);
    }

    public function syncJournal(
        Request $request,
        JournalIntegrationSyncService $syncService
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'provider' => ['required', Rule::in(['obsidian'])],
        ]);

        $summary = $syncService->syncForUser($user, $payload['provider']);

        return response()->json([
            'data' => [
                'provider' => $payload['provider'],
                'mode' => 'async',
                ...$summary,
            ],
        ]);
    }
}
