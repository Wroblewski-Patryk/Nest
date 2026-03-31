<?php

namespace App\Http\Controllers\Api;

use App\Actors\ActorContext;
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

        $actorContext = $request->attributes->get(ActorContext::REQUEST_ATTRIBUTE);

        $summary = $syncService->syncForUser(
            user: $user,
            provider: $payload['provider'],
            actorContext: $actorContext instanceof ActorContext ? $actorContext->toArray() : []
        );

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

        $actorContext = $request->attributes->get(ActorContext::REQUEST_ATTRIBUTE);

        $summary = $syncService->syncForUser(
            user: $user,
            provider: $payload['provider'],
            actorContext: $actorContext instanceof ActorContext ? $actorContext->toArray() : []
        );

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

        $actorContext = $request->attributes->get(ActorContext::REQUEST_ATTRIBUTE);

        $summary = $syncService->syncForUser(
            user: $user,
            provider: $payload['provider'],
            actorContext: $actorContext instanceof ActorContext ? $actorContext->toArray() : []
        );

        return response()->json([
            'data' => [
                'provider' => $payload['provider'],
                'mode' => 'async',
                ...$summary,
            ],
        ]);
    }
}
