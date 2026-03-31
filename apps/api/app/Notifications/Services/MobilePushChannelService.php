<?php

namespace App\Notifications\Services;

use App\Models\MobilePushDelivery;
use App\Models\MobilePushDevice;
use App\Models\User;
use App\Notifications\MobilePush\MobilePushGateway;
use App\Observability\MetricCounter;

class MobilePushChannelService
{
    public function __construct(
        private readonly MobilePushGateway $gateway,
        private readonly MetricCounter $metrics,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array{status:string,sent:int,failed:int,failure_reason:string|null,metadata:array<string, mixed>}
     */
    public function send(User $user, string $eventType, string $title, string $body, array $payload = []): array
    {
        $devices = MobilePushDevice::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->get();

        if ($devices->isEmpty()) {
            return [
                'status' => 'failed',
                'sent' => 0,
                'failed' => 0,
                'failure_reason' => 'no_active_device',
                'metadata' => [
                    'devices' => 0,
                ],
            ];
        }

        $sent = 0;
        $failed = 0;
        $lastError = null;

        foreach ($devices as $device) {
            $result = $this->gateway->send(
                token: (string) $device->device_token,
                title: $title,
                body: $body,
                payload: $payload,
            );

            $isSent = ($result['status'] ?? 'failed') === 'sent';

            MobilePushDelivery::query()->create([
                'tenant_id' => $device->tenant_id,
                'user_id' => $device->user_id,
                'mobile_push_device_id' => $device->id,
                'notification_type' => $eventType,
                'status' => $isSent ? 'sent' : 'failed',
                'title' => $title,
                'body' => $body,
                'payload' => $payload !== [] ? $payload : null,
                'response_payload' => $result['response_payload'] ?? null,
                'error_message' => $result['error_message'] ?? null,
                'delivered_at' => now(),
            ]);

            if ($isSent) {
                $sent++;
                $this->metrics->increment('notifications.push.sent');
            } else {
                $failed++;
                $this->metrics->increment('notifications.push.failed');
                $lastError = isset($result['error_message']) ? (string) $result['error_message'] : 'push_delivery_failed';
            }
        }

        if ($sent > 0) {
            return [
                'status' => 'sent',
                'sent' => $sent,
                'failed' => $failed,
                'failure_reason' => null,
                'metadata' => [
                    'devices' => $devices->count(),
                    'failed_devices' => $failed,
                ],
            ];
        }

        return [
            'status' => 'failed',
            'sent' => 0,
            'failed' => $failed,
            'failure_reason' => $lastError ?? 'push_delivery_failed',
            'metadata' => [
                'devices' => $devices->count(),
                'failed_devices' => $failed,
            ],
        ];
    }
}
