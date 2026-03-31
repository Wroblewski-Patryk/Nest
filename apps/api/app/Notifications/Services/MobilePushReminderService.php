<?php

namespace App\Notifications\Services;

use App\Models\CalendarEvent;
use App\Models\MobilePushDelivery;
use App\Models\MobilePushDevice;
use App\Models\Task;
use App\Notifications\MobilePush\MobilePushGateway;
use App\Observability\MetricCounter;
use Illuminate\Support\Carbon;

class MobilePushReminderService
{
    public function __construct(
        private readonly MobilePushGateway $gateway,
        private readonly MetricCounter $metrics,
        private readonly InAppNotificationService $inAppNotifications,
    ) {}

    /**
     * @return array{processed_devices:int,notifications_sent:int,notifications_failed:int}
     */
    public function sendKeyReminders(?string $tenantId = null): array
    {
        $query = MobilePushDevice::query()
            ->whereNull('revoked_at');

        if ($tenantId !== null && $tenantId !== '') {
            $query->where('tenant_id', $tenantId);
        }

        $devices = $query->get();
        $processedDevices = 0;
        $sent = 0;
        $failed = 0;

        foreach ($devices as $device) {
            $processedDevices++;

            foreach ($this->buildReminderPayloads($device) as $reminder) {
                $result = $this->gateway->send(
                    token: (string) $device->device_token,
                    title: $reminder['title'],
                    body: $reminder['body'],
                    payload: $reminder['payload'],
                );

                $isSent = ($result['status'] ?? 'failed') === 'sent';

                MobilePushDelivery::query()->create([
                    'tenant_id' => $device->tenant_id,
                    'user_id' => $device->user_id,
                    'mobile_push_device_id' => $device->id,
                    'notification_type' => $reminder['notification_type'],
                    'status' => $isSent ? 'sent' : 'failed',
                    'title' => $reminder['title'],
                    'body' => $reminder['body'],
                    'payload' => $reminder['payload'],
                    'response_payload' => $result['response_payload'] ?? null,
                    'error_message' => $result['error_message'] ?? null,
                    'delivered_at' => now(),
                ]);

                if ($isSent) {
                    $sent++;
                    $this->metrics->increment('notifications.push.sent');

                    $entityType = isset($reminder['payload']['task_id'])
                        ? 'task'
                        : (isset($reminder['payload']['event_id']) ? 'calendar_event' : null);
                    $entityId = isset($reminder['payload']['task_id'])
                        ? (string) $reminder['payload']['task_id']
                        : (isset($reminder['payload']['event_id']) ? (string) $reminder['payload']['event_id'] : null);

                    $this->inAppNotifications->create(
                        tenantId: (string) $device->tenant_id,
                        userId: (string) $device->user_id,
                        eventType: (string) $reminder['notification_type'],
                        title: (string) $reminder['title'],
                        body: (string) $reminder['body'],
                        payload: [
                            'module' => isset($reminder['payload']['module']) ? (string) $reminder['payload']['module'] : null,
                            'entity_type' => $entityType,
                            'entity_id' => $entityId,
                            'deep_link' => isset($reminder['payload']['module']) ? '/'.(string) $reminder['payload']['module'] : null,
                            ...$reminder['payload'],
                        ],
                    );
                } else {
                    $failed++;
                    $this->metrics->increment('notifications.push.failed');
                }
            }
        }

        return [
            'processed_devices' => $processedDevices,
            'notifications_sent' => $sent,
            'notifications_failed' => $failed,
        ];
    }

    /**
     * @return list<array{notification_type:string,title:string,body:string,payload:array<string,mixed>}>
     */
    private function buildReminderPayloads(MobilePushDevice $device): array
    {
        $payloads = [];
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();
        $upcomingBoundary = $now->copy()->addHour();

        $dueTask = Task::query()
            ->where('tenant_id', $device->tenant_id)
            ->where(function ($query) use ($device): void {
                $query->where('reminder_owner_user_id', $device->user_id)
                    ->orWhere(function ($fallback) use ($device): void {
                        $fallback->whereNull('reminder_owner_user_id')
                            ->where(function ($legacy) use ($device): void {
                                $legacy->where('assignee_user_id', $device->user_id)
                                    ->orWhere(function ($ownerOnly) use ($device): void {
                                        $ownerOnly->whereNull('assignee_user_id')
                                            ->where('user_id', $device->user_id);
                                    });
                            });
                    });
            })
            ->whereDate('due_date', $today)
            ->whereNotIn('status', ['done', 'canceled'])
            ->orderBy('due_date')
            ->orderBy('created_at')
            ->first();

        if ($dueTask !== null) {
            $payloads[] = [
                'notification_type' => 'task_due_today',
                'title' => 'Task reminder',
                'body' => "Task due today: {$dueTask->title}",
                'payload' => [
                    'module' => 'tasks',
                    'task_id' => $dueTask->id,
                    'assignee_user_id' => $dueTask->assignee_user_id,
                    'reminder_owner_user_id' => $dueTask->reminder_owner_user_id,
                ],
            ];
        }

        $upcomingEvent = CalendarEvent::query()
            ->where('tenant_id', $device->tenant_id)
            ->where(function ($query) use ($device): void {
                $query->where('reminder_owner_user_id', $device->user_id)
                    ->orWhere(function ($fallback) use ($device): void {
                        $fallback->whereNull('reminder_owner_user_id')
                            ->where(function ($legacy) use ($device): void {
                                $legacy->where('assignee_user_id', $device->user_id)
                                    ->orWhere(function ($ownerOnly) use ($device): void {
                                        $ownerOnly->whereNull('assignee_user_id')
                                            ->where('user_id', $device->user_id);
                                    });
                            });
                    });
            })
            ->whereBetween('start_at', [$now, $upcomingBoundary])
            ->orderBy('start_at')
            ->first();

        if ($upcomingEvent !== null) {
            $payloads[] = [
                'notification_type' => 'calendar_upcoming',
                'title' => 'Upcoming calendar event',
                'body' => "{$upcomingEvent->title} starts at ".$upcomingEvent->start_at?->format('H:i'),
                'payload' => [
                    'module' => 'calendar',
                    'event_id' => $upcomingEvent->id,
                    'assignee_user_id' => $upcomingEvent->assignee_user_id,
                    'reminder_owner_user_id' => $upcomingEvent->reminder_owner_user_id,
                ],
            ];
        }

        return $payloads;
    }
}
