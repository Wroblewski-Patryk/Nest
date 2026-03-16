<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Observability\MetricCounter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsIngestionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_user_can_ingest_valid_analytics_events_batch(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/analytics/events', [
            'events' => [
                [
                    'event_name' => 'tasks.task.created',
                    'event_version' => '1.0',
                    'occurred_at' => now()->subMinute()->toISOString(),
                    'platform' => 'web',
                    'module' => 'tasks',
                    'session_id' => 'session-1',
                    'properties' => ['task_id' => 'task-1'],
                ],
                [
                    'event_name' => 'integrations.sync.completed',
                    'event_version' => '1.0',
                    'occurred_at' => now()->toISOString(),
                    'platform' => 'api',
                    'module' => 'integrations',
                    'properties' => ['provider' => 'trello'],
                ],
            ],
        ])
            ->assertStatus(202)
            ->assertJsonPath('data.accepted', 2)
            ->assertJsonPath('data.rejected', 0);

        $this->assertDatabaseHas('analytics_events', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'tasks.task.created',
            'module' => 'tasks',
        ]);
        $this->assertDatabaseHas('analytics_events', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'integrations.sync.completed',
            'module' => 'integrations',
        ]);

        $metrics = app(MetricCounter::class);
        $this->assertSame(2, $metrics->getCurrentCount('analytics.events.ingested'));
    }

    public function test_ingestion_rejects_events_outside_taxonomy(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/analytics/events', [
            'events' => [
                [
                    'event_name' => 'unknown.event.name',
                    'event_version' => '1.0',
                    'occurred_at' => now()->toISOString(),
                    'platform' => 'web',
                    'module' => 'tasks',
                ],
            ],
        ])->assertStatus(422);
    }

    public function test_guest_cannot_ingest_analytics_events(): void
    {
        $this->postJson('/api/v1/analytics/events', [
            'events' => [
                [
                    'event_name' => 'tasks.task.created',
                    'event_version' => '1.0',
                    'occurred_at' => now()->toISOString(),
                    'platform' => 'web',
                    'module' => 'tasks',
                ],
            ],
        ])->assertUnauthorized();
    }
}
