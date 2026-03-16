<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Integrations\Services\IntegrationSyncReplayService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IntegrationSyncReplayController extends Controller
{
    public function index(Request $request, IntegrationSyncReplayService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'provider' => ['sometimes', Rule::in(['trello', 'google_tasks', 'todoist', 'google_calendar', 'obsidian'])],
        ]);

        $perPage = min((int) ($payload['per_page'] ?? 20), 100);
        $page = max((int) ($payload['page'] ?? 1), 1);
        $provider = isset($payload['provider']) ? (string) $payload['provider'] : null;

        $failures = $service->listFailuresForUser($user, $provider, $perPage, $page);

        return response()->json([
            'data' => $failures->items(),
            'meta' => [
                'page' => $failures->currentPage(),
                'per_page' => $failures->perPage(),
                'total' => $failures->total(),
            ],
        ]);
    }

    public function replay(
        Request $request,
        string $failureId,
        IntegrationSyncReplayService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $result = $service->replayFailureForUser($user, $failureId);

        return response()->json([
            'data' => [
                'failure' => $result['failure'],
                'replay' => $result['replay'],
            ],
        ]);
    }
}
