<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Integrations\Services\IntegrationHealthCenterService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationHealthCenterController extends Controller
{
    public function index(Request $request, IntegrationHealthCenterService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'window_hours' => ['sometimes', 'integer', 'min:1', 'max:168'],
        ]);

        $windowHours = (int) ($payload['window_hours'] ?? IntegrationHealthCenterService::DEFAULT_WINDOW_HOURS);
        $items = $service->listForUser($user, $windowHours);

        return response()->json([
            'data' => $items,
            'meta' => [
                'total' => count($items),
                'healthy' => count(array_filter($items, static fn (array $item): bool => (string) data_get($item, 'health.status') === 'healthy')),
                'degraded' => count(array_filter($items, static fn (array $item): bool => (string) data_get($item, 'health.status') === 'degraded')),
                'disconnected' => count(array_filter($items, static fn (array $item): bool => (string) data_get($item, 'health.status') === 'disconnected')),
                'window_hours' => $windowHours,
            ],
        ]);
    }

    public function remediate(
        Request $request,
        string $provider,
        IntegrationHealthCenterService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'action' => ['required', 'string', 'max:64'],
        ]);

        $result = $service->remediateForUser(
            user: $user,
            provider: $provider,
            action: (string) $payload['action'],
        );

        return response()->json([
            'data' => $result,
        ]);
    }
}
