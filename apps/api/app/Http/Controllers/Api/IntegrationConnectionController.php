<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Integrations\Services\IntegrationConnectionService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IntegrationConnectionController extends Controller
{
    public function index(Request $request, IntegrationConnectionService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => $service->listForUser($user),
        ]);
    }

    public function upsert(
        Request $request,
        string $provider,
        IntegrationConnectionService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $provider = $this->validateProvider($provider);
        $payload = $request->validate([
            'access_token' => ['required', 'string', 'min:6', 'max:4096'],
            'refresh_token' => ['nullable', 'string', 'max:4096'],
            'scopes' => ['sometimes', 'array'],
            'scopes.*' => ['string', 'max:255'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $connection = $service->connectForUser(
            user: $user,
            provider: $provider,
            accessToken: (string) $payload['access_token'],
            refreshToken: isset($payload['refresh_token']) ? (string) $payload['refresh_token'] : null,
            scopes: array_values($payload['scopes'] ?? []),
            expiresAt: isset($payload['expires_at']) ? (string) $payload['expires_at'] : null,
        );

        return response()->json([
            'data' => $connection,
        ]);
    }

    public function revoke(
        Request $request,
        string $provider,
        IntegrationConnectionService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $provider = $this->validateProvider($provider);
        $connection = $service->revokeForUser($user, $provider);

        return response()->json([
            'data' => $connection,
        ]);
    }

    private function validateProvider(string $provider): string
    {
        validator(
            ['provider' => $provider],
            ['provider' => ['required', Rule::in(IntegrationConnectionService::SUPPORTED_PROVIDERS)]]
        )->validate();

        return $provider;
    }
}
