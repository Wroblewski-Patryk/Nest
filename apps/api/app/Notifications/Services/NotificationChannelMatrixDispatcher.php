<?php

namespace App\Notifications\Services;

use App\Models\User;

class NotificationChannelMatrixDispatcher
{
    public function __construct(
        private readonly NotificationPreferenceService $preferences,
        private readonly NotificationChannelTelemetryService $telemetry,
        private readonly InAppNotificationService $inAppNotifications,
        private readonly MobilePushChannelService $mobilePush,
        private readonly EmailNotificationService $emailNotifications,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array{push_sent:int,push_failed:int}
     */
    public function dispatch(
        User $user,
        string $eventType,
        string $title,
        string $body,
        array $payload = []
    ): array {
        $pushSent = 0;
        $pushFailed = 0;

        foreach (NotificationPreferenceService::CHANNELS as $channel) {
            $decision = $this->preferences->evaluateChannel($user, $eventType, $channel);
            if (! $decision['deliver']) {
                $this->telemetry->log(
                    tenantId: (string) $user->tenant_id,
                    userId: (string) $user->id,
                    channel: $channel,
                    eventType: $eventType,
                    status: 'suppressed',
                    title: $title,
                    payload: $payload,
                    failureReason: $decision['failure_reason'],
                );

                continue;
            }

            if ($channel === 'in_app') {
                try {
                    $this->inAppNotifications->create(
                        tenantId: (string) $user->tenant_id,
                        userId: (string) $user->id,
                        eventType: $eventType,
                        title: $title,
                        body: $body,
                        payload: $payload,
                    );

                    $this->telemetry->log(
                        tenantId: (string) $user->tenant_id,
                        userId: (string) $user->id,
                        channel: $channel,
                        eventType: $eventType,
                        status: 'sent',
                        title: $title,
                        payload: $payload,
                    );
                } catch (\Throwable $exception) {
                    $this->telemetry->log(
                        tenantId: (string) $user->tenant_id,
                        userId: (string) $user->id,
                        channel: $channel,
                        eventType: $eventType,
                        status: 'failed',
                        title: $title,
                        payload: $payload,
                        failureReason: 'in_app_write_error',
                        metadata: ['error_message' => $exception->getMessage()],
                    );
                }

                continue;
            }

            if ($channel === 'push') {
                $result = $this->mobilePush->send(
                    user: $user,
                    eventType: $eventType,
                    title: $title,
                    body: $body,
                    payload: $payload,
                );

                $pushSent += (int) $result['sent'];
                $pushFailed += (int) $result['failed'];
                if ($result['status'] === 'failed' && $result['failure_reason'] !== null) {
                    $pushFailed += $result['failure_reason'] === 'no_active_device' ? 1 : 0;
                }

                $this->telemetry->log(
                    tenantId: (string) $user->tenant_id,
                    userId: (string) $user->id,
                    channel: $channel,
                    eventType: $eventType,
                    status: (string) $result['status'],
                    title: $title,
                    payload: $payload,
                    failureReason: $result['failure_reason'] !== null ? (string) $result['failure_reason'] : null,
                    metadata: is_array($result['metadata']) ? $result['metadata'] : [],
                );

                continue;
            }

            $emailResult = $this->emailNotifications->send(
                user: $user,
                eventType: $eventType,
                title: $title,
                body: $body,
                payload: $payload,
            );

            $this->telemetry->log(
                tenantId: (string) $user->tenant_id,
                userId: (string) $user->id,
                channel: $channel,
                eventType: $eventType,
                status: (string) $emailResult['status'],
                title: $title,
                payload: $payload,
                failureReason: $emailResult['failure_reason'] !== null ? (string) $emailResult['failure_reason'] : null,
                metadata: is_array($emailResult['metadata']) ? $emailResult['metadata'] : [],
            );
        }

        return [
            'push_sent' => $pushSent,
            'push_failed' => $pushFailed,
        ];
    }
}
