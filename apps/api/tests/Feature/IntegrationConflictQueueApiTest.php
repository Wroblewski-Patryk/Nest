<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\IntegrationSyncConflict;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationConflictQueueApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_user_can_list_open_conflicts_from_queue(): void
    {
        [$tenant, $user] = $this->seedCalendarConflict();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/integrations/conflicts?provider=google_calendar')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.provider', 'google_calendar')
            ->assertJsonPath('data.0.status', 'open')
            ->assertJsonPath('data.0.internal_entity_type', 'calendar_event');

        $conflictId = $response->json('data.0.id');
        $this->assertNotEmpty($conflictId);

        $this->assertDatabaseHas('integration_sync_conflicts', [
            'id' => $conflictId,
            'tenant_id' => $tenant->id,
            'status' => 'open',
        ]);
    }

    public function test_user_can_resolve_conflict_with_accept_or_override_action(): void
    {
        [, $user] = $this->seedCalendarConflict();
        Sanctum::actingAs($user);

        /** @var IntegrationSyncConflict $conflict */
        $conflict = IntegrationSyncConflict::query()->where('status', 'open')->firstOrFail();

        $this->postJson("/api/v1/integrations/conflicts/{$conflict->id}/resolve", [
            'action' => 'override',
            'resolution_payload' => [
                'strategy' => 'keep_internal',
            ],
        ])->assertOk()
            ->assertJsonPath('data.status', 'resolved')
            ->assertJsonPath('data.resolution_action', 'override')
            ->assertJsonPath('data.resolution_payload.strategy', 'keep_internal');

        $this->assertDatabaseHas('integration_sync_conflicts', [
            'id' => $conflict->id,
            'status' => 'resolved',
            'resolution_action' => 'override',
        ]);

        $this->getJson('/api/v1/integrations/conflicts')->assertOk()->assertJsonPath('meta.total', 0);
    }

    public function test_conflict_queue_is_tenant_and_user_scoped(): void
    {
        [, $userA] = $this->seedCalendarConflict();
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);
        Sanctum::actingAs($userB);

        $this->getJson('/api/v1/integrations/conflicts')->assertOk()->assertJsonPath('meta.total', 0);
    }

    public function test_guest_cannot_access_conflict_queue_routes(): void
    {
        $this->getJson('/api/v1/integrations/conflicts')->assertUnauthorized();
        $this->postJson('/api/v1/integrations/conflicts/fake-id/resolve', [
            'action' => 'accept',
        ])->assertUnauthorized();
    }

    /**
     * @return array{Tenant, User}
     */
    private function seedCalendarConflict(): array
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $event = CalendarEvent::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Conflict Source Event',
        ]);

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk();

        $event->update([
            'title' => 'Conflict Source Event Updated',
            'all_day' => true,
        ]);

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk()->assertJsonPath('data.conflicts', 1);

        return [$tenant, $user];
    }
}
