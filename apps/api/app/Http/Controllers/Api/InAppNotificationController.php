<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InAppNotification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class InAppNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'unread_only' => ['sometimes', 'boolean'],
            'include_snoozed' => ['sometimes', 'boolean'],
            'module' => ['sometimes', 'string', 'max:64'],
        ]);

        $perPage = (int) ($payload['per_page'] ?? 25);
        $includeSnoozed = (bool) ($payload['include_snoozed'] ?? false);

        $query = InAppNotification::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id);

        if (! $includeSnoozed) {
            $query->where(function ($snooze): void {
                $snooze->whereNull('snoozed_until')
                    ->orWhere('snoozed_until', '<=', now());
            });
        }

        if ((bool) ($payload['unread_only'] ?? false)) {
            $query->where('is_read', false);
        }

        if (array_key_exists('module', $payload)) {
            $query->where('module', $payload['module']);
        }

        $notifications = $query
            ->orderByDesc('created_at')
            ->limit($perPage)
            ->get();

        $groups = $notifications
            ->groupBy(fn (InAppNotification $item): string => $item->module ?: 'general')
            ->map(function ($items, string $module): array {
                return [
                    'group' => $module,
                    'total' => $items->count(),
                    'unread' => $items->where('is_read', false)->count(),
                ];
            })
            ->values();

        return response()->json([
            'data' => $notifications,
            'meta' => [
                'total' => $notifications->count(),
                'unread' => $notifications->where('is_read', false)->count(),
            ],
            'groups' => $groups,
        ]);
    }

    public function markRead(Request $request, string $notificationId): JsonResponse
    {
        $notification = $this->findUserNotification($request, $notificationId);
        $notification->is_read = true;
        $notification->read_at = now();
        $notification->save();

        return response()->json(['data' => $notification->fresh()]);
    }

    public function markUnread(Request $request, string $notificationId): JsonResponse
    {
        $notification = $this->findUserNotification($request, $notificationId);
        $notification->is_read = false;
        $notification->read_at = null;
        $notification->save();

        return response()->json(['data' => $notification->fresh()]);
    }

    public function snooze(Request $request, string $notificationId): JsonResponse
    {
        $notification = $this->findUserNotification($request, $notificationId);

        $payload = $request->validate([
            'snoozed_until' => ['required', 'date'],
        ]);

        $snoozedUntil = Carbon::parse((string) $payload['snoozed_until']);
        if ($snoozedUntil->lessThanOrEqualTo(now())) {
            return response()->json([
                'message' => 'The snoozed_until field must be a future datetime.',
                'errors' => ['snoozed_until' => ['The snoozed_until field must be a future datetime.']],
            ], 422);
        }

        $notification->snoozed_until = $snoozedUntil;
        $notification->save();

        return response()->json(['data' => $notification->fresh()]);
    }

    private function findUserNotification(Request $request, string $notificationId): InAppNotification
    {
        /** @var User $user */
        $user = $request->user();

        return InAppNotification::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($notificationId);
    }
}
