<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            'provider' => ['required', Rule::in(['trello', 'google_tasks'])],
        ]);

        $summary = $syncService->syncForUser($user, $payload['provider']);

        return response()->json([
            'data' => [
                'provider' => $payload['provider'],
                ...$summary,
            ],
        ]);
    }
}
