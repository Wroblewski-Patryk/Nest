<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationChannelMatrixApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_read_and_update_notification_preferences(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'timezone' => 'Europe/Warsaw',
            'settings' => ['language' => 'pl', 'locale' => 'pl-PL'],
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/notifications/preferences')
            ->assertOk()
            ->assertJsonPath('data.channels.in_app', true)
            ->assertJsonPath('data.channels.push', true)
            ->assertJsonPath('data.channels.email', false)
            ->assertJsonPath('data.locale', 'pl-PL')
            ->assertJsonPath('data.supported_event_types.0', fn (mixed $value): bool => is_string($value));

        $this->patchJson('/api/v1/notifications/preferences', [
            'channels' => [
                'push' => false,
                'email' => true,
                'in_app' => true,
            ],
            'event_channels' => [
                'calendar_event_assigned' => [
                    'push' => false,
                    'email' => false,
                    'in_app' => true,
                ],
            ],
            'quiet_hours' => [
                'enabled' => true,
                'start' => '23:00',
                'end' => '06:00',
                'timezone' => 'Europe/Warsaw',
            ],
            'locale' => 'pl-PL',
        ])->assertOk()
            ->assertJsonPath('data.channels.push', false)
            ->assertJsonPath('data.channels.email', true)
            ->assertJsonPath('data.quiet_hours.enabled', true)
            ->assertJsonPath('data.quiet_hours.start', '23:00')
            ->assertJsonPath('data.quiet_hours.end', '06:00')
            ->assertJsonPath('data.event_channels.calendar_event_assigned.email', false);

        $this->getJson('/api/v1/notifications/deliveries')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 30);
    }

    public function test_channel_disabled_event_preference_suppresses_all_channels_and_logs_reasons(): void
    {
        [$owner, $assignee, $tenant] = $this->createOwnerAndAssignee();

        Sanctum::actingAs($assignee);
        $this->patchJson('/api/v1/notifications/preferences', [
            'event_channels' => [
                'calendar_event_assigned' => [
                    'push' => false,
                    'email' => false,
                    'in_app' => false,
                ],
            ],
            'quiet_hours' => [
                'enabled' => false,
                'start' => '22:00',
                'end' => '07:00',
                'timezone' => 'UTC',
            ],
        ])->assertOk();

        Sanctum::actingAs($owner);
        $this->postJson('/api/v1/calendar-events', [
            'title' => 'Kitchen planning handoff',
            'start_at' => now()->addHour()->toIso8601String(),
            'end_at' => now()->addHours(2)->toIso8601String(),
            'timezone' => 'UTC',
            'assignee_user_id' => $assignee->id,
        ])->assertCreated();

        $this->assertDatabaseMissing('in_app_notifications', [
            'tenant_id' => $tenant->id,
            'user_id' => $assignee->id,
            'event_type' => 'calendar_event_assigned',
        ]);

        foreach (['in_app', 'push', 'email'] as $channel) {
            $this->assertDatabaseHas('notification_channel_deliveries', [
                'tenant_id' => $tenant->id,
                'user_id' => $assignee->id,
                'channel' => $channel,
                'event_type' => 'calendar_event_assigned',
                'status' => 'suppressed',
                'failure_reason' => 'channel_disabled',
            ]);
        }
    }

    public function test_quiet_hours_suppress_push_email_but_keep_in_app_delivery(): void
    {
        [$owner, $assignee, $tenant] = $this->createOwnerAndAssignee();

        Sanctum::actingAs($assignee);
        $this->patchJson('/api/v1/notifications/preferences', [
            'channels' => [
                'push' => true,
                'email' => true,
                'in_app' => true,
            ],
            'event_channels' => [
                'calendar_event_assigned' => [
                    'push' => true,
                    'email' => true,
                    'in_app' => true,
                ],
            ],
            'quiet_hours' => [
                'enabled' => true,
                'start' => '00:00',
                'end' => '23:59',
                'timezone' => 'UTC',
            ],
        ])->assertOk();

        Sanctum::actingAs($owner);
        $this->postJson('/api/v1/calendar-events', [
            'title' => 'Quiet-hours assignment',
            'start_at' => now()->addHour()->toIso8601String(),
            'end_at' => now()->addHours(2)->toIso8601String(),
            'timezone' => 'UTC',
            'assignee_user_id' => $assignee->id,
        ])->assertCreated();

        $this->assertDatabaseHas('in_app_notifications', [
            'tenant_id' => $tenant->id,
            'user_id' => $assignee->id,
            'event_type' => 'calendar_event_assigned',
        ]);
        $this->assertDatabaseHas('notification_channel_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $assignee->id,
            'channel' => 'in_app',
            'event_type' => 'calendar_event_assigned',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('notification_channel_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $assignee->id,
            'channel' => 'push',
            'event_type' => 'calendar_event_assigned',
            'status' => 'suppressed',
            'failure_reason' => 'quiet_hours_window',
        ]);
        $this->assertDatabaseHas('notification_channel_deliveries', [
            'tenant_id' => $tenant->id,
            'user_id' => $assignee->id,
            'channel' => 'email',
            'event_type' => 'calendar_event_assigned',
            'status' => 'suppressed',
            'failure_reason' => 'quiet_hours_window',
        ]);

        Sanctum::actingAs($assignee);
        $this->getJson('/api/v1/notifications/deliveries?channel=push&status=suppressed')
            ->assertOk()
            ->assertJsonPath('meta.total', fn (mixed $value): bool => is_int($value) && $value >= 1);
    }

    /**
     * @return array{0:User,1:User,2:Tenant}
     */
    private function createOwnerAndAssignee(): array
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id]);
        $assignee = User::factory()->create(['tenant_id' => $tenant->id]);

        return [$owner, $assignee, $tenant];
    }
}
