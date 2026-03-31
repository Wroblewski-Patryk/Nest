<?php

namespace App\Notifications\Services;

use App\Models\CalendarEvent;
use App\Models\MobilePushDevice;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Carbon;

class MobilePushReminderService
{
    public function __construct(
        private readonly NotificationChannelMatrixDispatcher $notifications,
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

        $devices = $query->get(['id', 'tenant_id', 'user_id']);
        $processedDevices = $devices->count();
        $sent = 0;
        $failed = 0;

        $recipientMap = [];
        foreach ($devices as $device) {
            $mapKey = (string) $device->tenant_id.'|'.(string) $device->user_id;
            $recipientMap[$mapKey] = [
                'tenant_id' => (string) $device->tenant_id,
                'user_id' => (string) $device->user_id,
            ];
        }

        foreach ($recipientMap as $recipientKey) {
            $user = User::query()
                ->where('tenant_id', $recipientKey['tenant_id'])
                ->find($recipientKey['user_id']);

            if (! $user instanceof User) {
                continue;
            }

            foreach ($this->buildReminderPayloads($user) as $reminder) {
                $dispatch = $this->notifications->dispatch(
                    user: $user,
                    eventType: (string) $reminder['notification_type'],
                    title: (string) $reminder['title'],
                    body: (string) $reminder['body'],
                    payload: $reminder['payload'],
                );
                $sent += (int) $dispatch['push_sent'];
                $failed += (int) $dispatch['push_failed'];
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
    private function buildReminderPayloads(User $user): array
    {
        $payloads = [];
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();
        $upcomingBoundary = $now->copy()->addHour();

        $dueTask = Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function ($query) use ($user): void {
                $query->where('reminder_owner_user_id', $user->id)
                    ->orWhere(function ($fallback) use ($user): void {
                        $fallback->whereNull('reminder_owner_user_id')
                            ->where(function ($legacy) use ($user): void {
                                $legacy->where('assignee_user_id', $user->id)
                                    ->orWhere(function ($ownerOnly) use ($user): void {
                                        $ownerOnly->whereNull('assignee_user_id')
                                            ->where('user_id', $user->id);
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
            ->where('tenant_id', $user->tenant_id)
            ->where(function ($query) use ($user): void {
                $query->where('reminder_owner_user_id', $user->id)
                    ->orWhere(function ($fallback) use ($user): void {
                        $fallback->whereNull('reminder_owner_user_id')
                            ->where(function ($legacy) use ($user): void {
                                $legacy->where('assignee_user_id', $user->id)
                                    ->orWhere(function ($ownerOnly) use ($user): void {
                                        $ownerOnly->whereNull('assignee_user_id')
                                            ->where('user_id', $user->id);
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
