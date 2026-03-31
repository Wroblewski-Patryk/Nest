<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\Services\NotificationPreferenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function show(Request $request, NotificationPreferenceService $preferences): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => $preferences->getForUser($user),
        ]);
    }

    public function update(Request $request, NotificationPreferenceService $preferences): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'channels' => ['sometimes', 'array'],
            'channels.push' => ['sometimes', 'boolean'],
            'channels.email' => ['sometimes', 'boolean'],
            'channels.in_app' => ['sometimes', 'boolean'],
            'event_channels' => ['sometimes', 'array'],
            'event_channels.*' => ['sometimes', 'array'],
            'event_channels.*.push' => ['sometimes', 'boolean'],
            'event_channels.*.email' => ['sometimes', 'boolean'],
            'event_channels.*.in_app' => ['sometimes', 'boolean'],
            'quiet_hours' => ['sometimes', 'array'],
            'quiet_hours.enabled' => ['sometimes', 'boolean'],
            'quiet_hours.start' => ['sometimes', 'date_format:H:i'],
            'quiet_hours.end' => ['sometimes', 'date_format:H:i'],
            'quiet_hours.timezone' => ['sometimes', 'timezone'],
            'locale' => ['sometimes', 'string', 'max:16'],
        ]);

        if (array_key_exists('event_channels', $payload) && is_array($payload['event_channels'])) {
            foreach (array_keys($payload['event_channels']) as $eventType) {
                if (! is_string($eventType) || strlen($eventType) > 64) {
                    return response()->json([
                        'message' => 'Invalid event type key in event_channels.',
                        'errors' => [
                            'event_channels' => ['Each event type key must be a non-empty string up to 64 characters.'],
                        ],
                    ], 422);
                }
            }
        }

        return response()->json([
            'data' => $preferences->updateForUser($user, $payload),
        ]);
    }
}
