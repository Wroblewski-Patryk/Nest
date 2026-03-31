<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use App\Observability\MetricCounter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationEventIngestionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_user_can_ingest_near_real_time_event_and_duplicate_replay_is_blocked(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);
        $task = Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/integrations/events/clickup/ingest', [
            'event_id' => 'evt-clickup-001',
            'event_type' => 'task.updated',
            'internal_entity_type' => 'task',
            'internal_entity_id' => $task->id,
            'event_occurred_at' => now()->subSeconds(30)->toISOString(),
            'entity_payload' => [
                'title' => 'Updated from webhook',
                'status' => 'in_progress',
            ],
        ])
            ->assertStatus(202)
            ->assertJsonPath('data.status', 'queued')
            ->assertJsonPath('data.replay_protected', true)
            ->assertJsonPath('data.queued', true);

        $this->assertDatabaseHas('integration_event_ingestions', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'clickup',
            'event_id' => 'evt-clickup-001',
            'status' => 'queued',
        ]);
        $this->assertDatabaseCount('jobs', 1);

        $this->postJson('/api/v1/integrations/events/clickup/ingest', [
            'event_id' => 'evt-clickup-001',
            'event_type' => 'task.updated',
            'internal_entity_type' => 'task',
            'internal_entity_id' => $task->id,
            'event_occurred_at' => now()->subSeconds(10)->toISOString(),
            'entity_payload' => [
                'title' => 'Replay payload should be blocked',
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'duplicate')
            ->assertJsonPath('data.replay_protected', true)
            ->assertJsonPath('data.queued', false);

        $this->assertDatabaseCount('integration_event_ingestions', 1);
        $this->assertDatabaseCount('jobs', 1);

        $this->getJson('/api/v1/integrations/events/ingestions')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.provider', 'clickup')
            ->assertJsonPath('data.0.status', 'queued');

        $metrics = app(MetricCounter::class);
        $this->assertSame(1, $metrics->getCurrentCount('integration.events.received'));
        $this->assertSame(1, $metrics->getCurrentCount('integration.events.duplicate'));
        $this->assertSame(1, $metrics->getCurrentCount('integration.events.dropped'));
    }

    public function test_guest_cannot_ingest_or_list_integration_events(): void
    {
        $this->postJson('/api/v1/integrations/events/clickup/ingest', [
            'event_id' => 'evt-guest-1',
            'event_type' => 'task.updated',
            'internal_entity_type' => 'task',
            'internal_entity_id' => (string) str()->uuid(),
            'event_occurred_at' => now()->toISOString(),
        ])->assertUnauthorized();

        $this->getJson('/api/v1/integrations/events/ingestions')->assertUnauthorized();
    }
}
