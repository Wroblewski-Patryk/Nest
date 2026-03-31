<?php

namespace App\Notifications\Services;

use App\Models\NotificationChannelDelivery;

class NotificationChannelTelemetryService
{
    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $metadata
     */
    public function log(
        string $tenantId,
        string $userId,
        string $channel,
        string $eventType,
        string $status,
        string $title,
        array $payload = [],
        ?string $failureReason = null,
        array $metadata = []
    ): NotificationChannelDelivery {
        return NotificationChannelDelivery::query()->create([
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'channel' => $channel,
            'event_type' => $eventType,
            'status' => $status,
            'failure_reason' => $failureReason,
            'title' => $title,
            'payload' => $payload !== [] ? $payload : null,
            'metadata' => $metadata !== [] ? $metadata : null,
            'delivered_at' => now(),
        ]);
    }
}
