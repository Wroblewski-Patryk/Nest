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

        $metrics = app(MetricCounter::class);
        $this->assertSame(2, $metrics->getCurrentCount('notifications.push.sent'));
    }
}
