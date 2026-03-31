<?php

namespace Tests\Feature;

use App\Models\InAppNotification;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InAppNotificationCenterApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_mark_read_unread_and_snooze_in_app_notifications(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $notification = InAppNotification::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_type' => 'task_assigned',
            'module' => 'tasks',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/notifications/in-app')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $notification->id)
            ->assertJsonPath('data.0.is_read', false);

        $this->postJson("/api/v1/notifications/in-app/{$notification->id}/read")
            ->assertOk()
            ->assertJsonPath('data.is_read', true);

        $this->postJson("/api/v1/notifications/in-app/{$notification->id}/unread")
            ->assertOk()
            ->assertJsonPath('data.is_read', false);

        $this->postJson("/api/v1/notifications/in-app/{$notification->id}/snooze", [
            'snoozed_until' => now()->addHour()->toDateTimeString(),
        ])->assertOk()
            ->assertJsonPath('data.snoozed_until', fn (mixed $value): bool => is_string($value) && $value !== '');
    }

    public function test_in_app_notifications_are_tenant_and_user_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $notification = InAppNotification::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        Sanctum::actingAs($userA);
        $this->getJson('/api/v1/notifications/in-app')
            ->assertOk()
            ->assertJsonPath('meta.total', 0);

        $this->postJson("/api/v1/notifications/in-app/{$notification->id}/read")
            ->assertNotFound();
    }
}
