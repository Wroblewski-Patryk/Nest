<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Integrations\Services\IntegrationEventIngestionService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationEventIngestionController extends Controller
{
    public function ingest(
        Request $request,
        string $provider,
        IntegrationEventIngestionService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'event_id' => ['required', 'string', 'max:128'],
            'event_type' => ['required', 'string', 'max:128'],
            'internal_entity_type' => ['required', 'string', 'max:64'],
            'internal_entity_id' => ['required', 'string', 'uuid'],
            'external_id' => ['nullable', 'string', 'max:255'],
            'event_occurred_at' => ['required', 'date'],
            'entity_payload' => ['sometimes', 'array'],
        ]);

        $result = $service->ingestForUser($user, $provider, $payload);

        return response()->json([
            'data' => $result,
        ], $result['status'] === 'duplicate' ? 200 : 202);
    }

    public function index(Request $request, IntegrationEventIngestionService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'provider' => ['sometimes', 'string', 'max:64'],
            'status' => ['sometimes', 'string', 'max:32'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ]);

        $items = $service->listIngestionsForUser(
            user: $user,
            provider: isset($payload['provider']) ? (string) $payload['provider'] : null,
            status: isset($payload['status']) ? (string) $payload['status'] : null,
            perPage: (int) ($payload['per_page'] ?? 50),
        );

        return response()->json([
            'data' => $items,
            'meta' => [
                'total' => count($items),
            ],
        ]);
    }
}
