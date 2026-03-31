<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Integrations\Services\IntegrationConflictQueueService;
use App\Models\IntegrationSyncConflict;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IntegrationConflictController extends Controller
{
    public function index(Request $request, IntegrationConflictQueueService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authorize('viewAny', IntegrationSyncConflict::class);

        $payload = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'provider' => ['sometimes', Rule::in(['trello', 'google_tasks', 'todoist', 'google_calendar', 'obsidian'])],
        ]);

        $perPage = min((int) ($payload['per_page'] ?? 20), 100);
        $page = max((int) ($payload['page'] ?? 1), 1);
        $provider = isset($payload['provider']) ? (string) $payload['provider'] : null;

        $conflicts = $service->listOpenForUser($user, $provider, $perPage, $page);
        $items = array_map(function (IntegrationSyncConflict $conflict): array {
            $conflictFields = is_array($conflict->conflict_fields) ? $conflict->conflict_fields : [];
            $payload = is_array($conflict->resolution_payload) ? $conflict->resolution_payload : [];
            $comparison = is_array($payload['comparison'] ?? null) ? $payload['comparison'] : [];
            $mergePolicy = is_array($payload['merge_policy'] ?? null) ? $payload['merge_policy'] : [];
            $manualQueueFields = is_array($mergePolicy['manual_queue_fields'] ?? null)
                ? $mergePolicy['manual_queue_fields']
                : $conflictFields;
            $autoMergeFields = is_array($mergePolicy['auto_merge_fields'] ?? null)
                ? $mergePolicy['auto_merge_fields']
                : [];
            $mergeState = is_string($payload['merge_state'] ?? null)
                ? $payload['merge_state']
                : ($manualQueueFields === [] ? 'auto_merged' : 'manual_required');

            foreach ($conflictFields as $field) {
                if (! isset($comparison[$field]) || ! is_array($comparison[$field])) {
                    $comparison[$field] = [
                        'base' => '(unavailable)',
                        'local' => '(unavailable)',
                        'remote' => '(unavailable)',
                    ];
                }
            }

            return array_merge($conflict->toArray(), [
                'comparison' => $comparison,
                'merge_state' => $mergeState,
                'merge_policy' => [
                    'manual_queue_fields' => array_values(array_unique($manualQueueFields)),
                    'auto_merge_fields' => array_values(array_unique($autoMergeFields)),
                ],
            ]);
        }, $conflicts->items());

        return response()->json([
            'data' => $items,
            'meta' => [
                'page' => $conflicts->currentPage(),
                'per_page' => $conflicts->perPage(),
                'total' => $conflicts->total(),
            ],
        ]);
    }

    public function resolve(
        Request $request,
        string $conflictId,
        IntegrationConflictQueueService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'action' => ['required', Rule::in(['accept', 'override'])],
            'resolution_payload' => ['sometimes', 'array'],
        ]);

        $conflict = IntegrationSyncConflict::query()->findOrFail($conflictId);
        $this->authorize('resolve', $conflict);

        $conflict = $service->resolveForUser(
            user: $user,
            conflictId: $conflictId,
            action: (string) $payload['action'],
            resolutionPayload: isset($payload['resolution_payload']) ? (array) $payload['resolution_payload'] : null
        );

        return response()->json([
            'data' => $conflict,
        ]);
    }
}
