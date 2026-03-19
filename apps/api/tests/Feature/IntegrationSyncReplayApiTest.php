<?php

namespace Tests\Feature;

use App\Models\IntegrationSyncFailure;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationSyncReplayApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_user_can_list_and_replay_failed_sync_job(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        $task = Task::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'list_id' => $list->id]);
        Sanctum::actingAs($user);

        $failure = IntegrationSyncFailure::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'trello',
            'idempotency_key' => 'trello:task:task-1',
            'payload' => [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'provider' => 'trello',
                'internal_entity_type' => 'task',
                'internal_entity_id' => $task->id,
                'external_id' => 'trello-task-1',
                'sync_hash' => 'hash-1',
                'idempotency_key' => 'trello:task:task-1',
            ],
            'error_message' => 'Provider timeout',
            'attempts' => 5,
            'failed_at' => now()->subMinute(),
        ]);

        $this->getJson('/api/v1/integrations/failures')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $failure->id)
            ->assertJsonPath('data.0.provider', 'trello');

        $this->postJson("/api/v1/integrations/failures/{$failure->id}/replay")
            ->assertOk()
            ->assertJsonPath('data.replay.status', 'success')
            ->assertJsonPath('data.failure.replay_count', 1);

        $this->assertDatabaseHas('integration_sync_failures', [
            'id' => $failure->id,
            'replay_count' => 1,
            'last_replay_status' => 'success',
            'last_replay_idempotency_key' => 'trello:task:task-1:replay:1',
        ]);

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => 'trello',
            'internal_entity_type' => 'task',
            'internal_entity_id' => $task->id,
        ]);
    }

    public function test_replay_failure_is_tenant_and_user_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $listA = TaskList::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id]);
        $taskA = Task::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id, 'list_id' => $listA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $failure = IntegrationSyncFailure::query()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'provider' => 'trello',
            'idempotency_key' => 'trello:task:task-2',
            'payload' => [
                'tenant_id' => $tenantA->id,
                'user_id' => $userA->id,
                'provider' => 'trello',
                'internal_entity_type' => 'task',
                'internal_entity_id' => $taskA->id,
                'external_id' => 'trello-task-2',
                'sync_hash' => 'hash-2',
                'idempotency_key' => 'trello:task:task-2',
            ],
            'error_message' => 'Provider timeout',
            'attempts' => 5,
            'failed_at' => now()->subMinute(),
        ]);

        Sanctum::actingAs($userB);
        $this->postJson("/api/v1/integrations/failures/{$failure->id}/replay")->assertForbidden();
    }

    public function test_guest_cannot_access_replay_tooling_routes(): void
    {
        $this->getJson('/api/v1/integrations/failures')->assertUnauthorized();
        $this->postJson('/api/v1/integrations/failures/fake-id/replay')->assertUnauthorized();
    }
}
