<?php

namespace App\Notifications\Services;

use App\Models\InAppNotification;
use Illuminate\Support\Carbon;

class InAppNotificationService
{
    /**
     * @param array<string, mixed> $payload
     */
    public function create(
        string $tenantId,
        string $userId,
        string $eventType,
        string $title,
        string $body,
        array $payload = []
    ): InAppNotification {
        return InAppNotification::query()->create([
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'event_type' => $eventType,
            'title' => $title,
            'body' => $body,
            'module' => isset($payload['module']) ? (string) $payload['module'] : null,
            'entity_type' => isset($payload['entity_type']) ? (string) $payload['entity_type'] : null,
            'entity_id' => isset($payload['entity_id']) ? (string) $payload['entity_id'] : null,
            'deep_link' => isset($payload['deep_link']) ? (string) $payload['deep_link'] : null,
            'payload' => $payload !== [] ? $payload : null,
            'is_read' => false,
            'read_at' => null,
            'snoozed_until' => isset($payload['snoozed_until']) ? Carbon::parse((string) $payload['snoozed_until']) : null,
        ]);
    }
}
