<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\Task;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\Services\MobilePushDeviceService;
use App\Observability\MetricCounter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MobilePushReminderCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_command_sends_due_task_and_upcoming_calendar_mobile_push_reminders(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        app(MobilePushDeviceService::class)->registerForUser(
            user: $user,
            platform: 'android',
            deviceToken: 'expo-device-token-android-1234567890',
            deviceLabel: 'Pixel 8',
        );

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Submit weekly report',
            'status' => 'todo',
            'due_date' => now()->toDateString(),
        ]);

        CalendarEvent::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Weekly planning call',
            'start_at' => now()->addMinutes(30),
            'end_at' => now()->addMinutes(60),
        ]);

        $this->artisan('notifications:send-mobile-reminders --json')
            ->expectsOutputToContain('"processed_devices": 1')
            ->assertExitCode(0);

        $this->assertDatabaseHas('mobile_push_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'notification_type' => 'task_due_today',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('mobile_push_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'notification_type' => 'calendar_upcoming',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('in_app_notifications', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_type' => 'task_due_today',
        ]);
        $this->assertDatabaseHas('in_app_notifications', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_type' => 'calendar_upcoming',
        ]);
        $this->assertDatabaseHas('notification_channel_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'channel' => 'push',
            'event_type' => 'task_due_today',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('notification_channel_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'channel' => 'in_app',
            'event_type' => 'calendar_upcoming',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('notification_channel_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'channel' => 'email',
            'event_type' => 'task_due_today',
            'status' => 'suppressed',
            'failure_reason' => 'channel_disabled',
        ]);

        $metrics = app(MetricCounter::class);
        $this->assertSame(2, $metrics->getCurrentCount('notifications.push.sent'));
    }

    public function test_reminder_delivery_follows_explicit_reminder_owner_for_task_and_event(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id]);
        $teammate = User::factory()->create(['tenant_id' => $tenant->id]);

        app(MobilePushDeviceService::class)->registerForUser(
            user: $owner,
            platform: 'android',
            deviceToken: 'expo-owner-token-123',
            deviceLabel: 'Owner phone',
        );

        app(MobilePushDeviceService::class)->registerForUser(
            user: $teammate,
            platform: 'ios',
            deviceToken: 'expo-teammate-token-123',
            deviceLabel: 'Teammate phone',
        );

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'assignee_user_id' => $teammate->id,
            'reminder_owner_user_id' => $teammate->id,
            'title' => 'Shared task reminder',
            'status' => 'todo',
            'due_date' => now()->toDateString(),
        ]);

        CalendarEvent::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'assignee_user_id' => $teammate->id,
            'reminder_owner_user_id' => $teammate->id,
            'title' => 'Shared calendar reminder',
            'start_at' => now()->addMinutes(30),
            'end_at' => now()->addMinutes(60),
        ]);

        $this->artisan('notifications:send-mobile-reminders --json')
            ->expectsOutputToContain('"processed_devices": 2')
            ->assertExitCode(0);

        $this->assertDatabaseMissing('mobile_push_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'notification_type' => 'task_due_today',
        ]);

        $this->assertDatabaseHas('mobile_push_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $teammate->id,
            'notification_type' => 'task_due_today',
            'status' => 'sent',
        ]);

        $this->assertDatabaseHas('mobile_push_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $teammate->id,
            'notification_type' => 'calendar_upcoming',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('in_app_notifications', [
            'tenant_id' => $tenant->id,
            'user_id' => $teammate->id,
            'event_type' => 'task_due_today',
        ]);
        $this->assertDatabaseHas('in_app_notifications', [
            'tenant_id' => $tenant->id,
            'user_id' => $teammate->id,
            'event_type' => 'calendar_upcoming',
        ]);
        $this->assertDatabaseHas('notification_channel_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $teammate->id,
            'channel' => 'push',
            'event_type' => 'task_due_today',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('notification_channel_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $teammate->id,
            'channel' => 'email',
            'event_type' => 'calendar_upcoming',
            'status' => 'suppressed',
            'failure_reason' => 'channel_disabled',
        ]);
    }
}
