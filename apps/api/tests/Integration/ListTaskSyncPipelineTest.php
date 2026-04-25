<?php

namespace Tests\Integration;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ListTaskSyncPipelineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_list_and_task_created_via_api_can_be_synced_to_provider(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $listResponse = $this->postJson('/api/v1/lists', [
            'name' => 'Integration List',
            'color' => '#0ea5e9',
        ])->assertCreated();

        $listId = $listResponse->json('data.id');

        $this->postJson('/api/v1/tasks', [
            'list_id' => $listId,
            'title' => 'Integration Task',
            'priority' => 'high',
        ])->assertCreated();

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk()
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 2)
            ->assertJsonPath('data.skipped', 0)
            ->assertJsonPath('data.mode', 'async');

        $this->drainIntegrationQueue();

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => 'trello',
            'internal_entity_type' => 'task_list',
        ]);
        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => 'trello',
            'internal_entity_type' => 'task',
        ]);
    }

    public function test_repeated_sync_without_changes_is_skipped_by_idempotency(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $listResponse = $this->postJson('/api/v1/lists', [
            'name' => 'Idempotency List',
            'color' => '#22c55e',
        ])->assertCreated();

        $listId = $listResponse->json('data.id');

        $this->postJson('/api/v1/tasks', [
            'list_id' => $listId,
            'title' => 'Idempotency Task',
            'priority' => 'medium',
        ])->assertCreated();

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'google_tasks',
        ])->assertOk();

        $this->drainIntegrationQueue();

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'google_tasks',
        ])->assertOk()
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 0)
            ->assertJsonPath('data.skipped', 2);
    }

    private function drainIntegrationQueue(): void
    {
        while ((int) DB::table('jobs')->count() > 0) {
            Artisan::call('queue:work', [
                'connection' => 'database',
                '--queue' => 'integrations',
                '--once' => true,
            ]);
        }
    }
}
