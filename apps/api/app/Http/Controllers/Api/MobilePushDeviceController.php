<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\Services\MobilePushDeviceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MobilePushDeviceController extends Controller
{
    public function index(Request $request, MobilePushDeviceService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => $service->listForUser($user),
        ]);
    }

    public function store(Request $request, MobilePushDeviceService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'platform' => ['required', Rule::in(['ios', 'android', 'web'])],
            'device_token' => ['required', 'string', 'min:16', 'max:4096'],
            'device_label' => ['nullable', 'string', 'max:120'],
        ]);

        $device = $service->registerForUser(
            user: $user,
            platform: (string) $payload['platform'],
            deviceToken: (string) $payload['device_token'],
            deviceLabel: isset($payload['device_label']) ? (string) $payload['device_label'] : null,
        );

        return response()->json([
            'data' => $device,
        ], 201);
    }

    public function destroy(
        Request $request,
        string $deviceId,
        MobilePushDeviceService $service
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $service->revokeForUser($user, $deviceId);

        return response()->json([
            'data' => [
                'device_id' => $deviceId,
                'status' => 'revoked',
            ],
        ]);
    }
}
