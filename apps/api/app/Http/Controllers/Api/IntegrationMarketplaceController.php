<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Integrations\Services\IntegrationMarketplaceService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationMarketplaceController extends Controller
{
    public function index(Request $request, IntegrationMarketplaceService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $providers = $service->listCatalogForUser($user);

        return response()->json([
            'data' => $providers,
            'meta' => [
                'total' => count($providers),
                'installed' => count(array_filter(
                    $providers,
                    static fn (array $provider): bool => (bool) ($provider['is_installed'] ?? false)
                )),
            ],
        ]);
    }

    public function install(
        Request $request,
        string $provider,
        IntegrationMarketplaceService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'install_metadata' => ['sometimes', 'array'],
        ]);

        $item = $service->installForUser(
            user: $user,
            provider: $provider,
            metadata: (array) ($payload['install_metadata'] ?? [])
        );

        return response()->json([
            'data' => $item,
        ]);
    }

    public function uninstall(
        Request $request,
        string $provider,
        IntegrationMarketplaceService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $item = $service->uninstallForUser(
            user: $user,
            provider: $provider,
            reason: isset($payload['reason']) ? (string) $payload['reason'] : null
        );

        return response()->json([
            'data' => $item,
        ]);
    }

    public function audits(Request $request, IntegrationMarketplaceService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ]);

        $items = $service->listAuditsForUser(
            user: $user,
            limit: (int) ($payload['per_page'] ?? 50),
        );

        return response()->json([
            'data' => $items,
            'meta' => [
                'total' => count($items),
            ],
        ]);
    }
}
