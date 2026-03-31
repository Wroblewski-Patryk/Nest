<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationChannelDelivery;
use App\Models\User;
use App\Notifications\Services\NotificationPreferenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationDeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'channel' => ['sometimes', Rule::in(NotificationPreferenceService::CHANNELS)],
            'event_type' => ['sometimes', 'string', 'max:64'],
            'status' => ['sometimes', Rule::in(['sent', 'suppressed', 'failed'])],
        ]);

        $query = NotificationChannelDelivery::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id);

        if (array_key_exists('channel', $payload)) {
            $query->where('channel', $payload['channel']);
        }

        if (array_key_exists('event_type', $payload)) {
            $query->where('event_type', $payload['event_type']);
        }

        if (array_key_exists('status', $payload)) {
            $query->where('status', $payload['status']);
        }

        $perPage = (int) ($payload['per_page'] ?? 30);
        $rows = $query->orderByDesc('created_at')->limit($perPage)->get();

        return response()->json([
            'data' => $rows,
            'meta' => [
                'total' => $rows->count(),
                'per_page' => $perPage,
            ],
        ]);
    }
}
