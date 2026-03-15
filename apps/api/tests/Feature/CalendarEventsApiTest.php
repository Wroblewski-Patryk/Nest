<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\Goal;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CalendarEventsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_crud_calendar_events(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $goal = Goal::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        $create = $this->postJson('/api/v1/calendar-events', [
            'title' => 'Weekly review',
            'description' => 'Review goals and next week priorities',
            'start_at' => '2026-03-16 09:00:00',
            'end_at' => '2026-03-16 10:00:00',
            'timezone' => 'Europe/Berlin',
            'all_day' => false,
            'linked_entity_type' => 'goal',
            'linked_entity_id' => $goal->id,
        ])->assertCreated();

        $eventId = $create->json('data.id');

        $this->getJson('/api/v1/calendar-events?start_from=2026-03-16 00:00:00&start_to=2026-03-16 23:59:59')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $eventId);

        $this->patchJson("/api/v1/calendar-events/{$eventId}", [
            'title' => 'Updated weekly review',
            'all_day' => true,
        ])->assertOk()
            ->assertJsonPath('data.title', 'Updated weekly review')
            ->assertJsonPath('data.all_day', true);

        $this->deleteJson("/api/v1/calendar-events/{$eventId}")->assertNoContent();
        $this->assertSoftDeleted('calendar_events', ['id' => $eventId]);
    }

    public function test_calendar_event_link_must_reference_user_owned_entity(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $goalB = Goal::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        Sanctum::actingAs($userA);

        $this->postJson('/api/v1/calendar-events', [
            'title' => 'Cross-tenant link attempt',
            'start_at' => '2026-03-20 09:00:00',
            'end_at' => '2026-03-20 10:00:00',
            'linked_entity_type' => 'goal',
            'linked_entity_id' => $goalB->id,
        ])->assertNotFound();
    }

    public function test_calendar_events_are_tenant_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $eventB = CalendarEvent::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson("/api/v1/calendar-events/{$eventB->id}")->assertNotFound();
    }

    public function test_guest_cannot_access_calendar_events_routes(): void
    {
        $this->getJson('/api/v1/calendar-events')->assertUnauthorized();
        $this->postJson('/api/v1/calendar-events', ['title' => 'x'])->assertUnauthorized();
    }
}
