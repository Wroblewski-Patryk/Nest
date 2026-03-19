<?php

namespace Tests\Feature;

use App\Models\IntegrationSyncAudit;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationListTaskSyncApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_user_can_sync_lists_and_tasks_to_trello_with_idempotency(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $list = TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'name' => 'Personal',
        ]);

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'title' => 'Pay bills',
        ]);

        $first = $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk();

        $first->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 2)
            ->assertJsonPath('data.skipped', 0)
            ->assertJsonPath('data.mode', 'async');

        $this->assertCount(2, $first->json('data.job_references', []));
        $this->drainIntegrationQueue();

        $this->assertDatabaseCount('sync_mappings', 2);
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
        $this->assertDatabaseCount('integration_sync_audits', 2);
        $this->assertDatabaseHas('integration_sync_audits', [
            'tenant_id' => $tenant->id,
            'provider' => 'trello',
            'status' => 'success',
            'internal_entity_type' => 'task_list',
        ]);
        $this->assertDatabaseHas('integration_sync_audits', [
            'tenant_id' => $tenant->id,
            'provider' => 'trello',
            'status' => 'success',
            'internal_entity_type' => 'task',
        ]);

        $second = $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk();

        $second->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 0)
            ->assertJsonPath('data.skipped', 2);

        $this->assertDatabaseCount('integration_sync_audits', 2);
    }

    public function test_user_can_sync_lists_and_tasks_to_google_tasks(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $list = TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
        ]);

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'google_tasks',
        ])->assertOk()
            ->assertJsonPath('data.provider', 'google_tasks')
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 2)
            ->assertJsonPath('data.mode', 'async');

        $this->drainIntegrationQueue();

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => 'google_tasks',
            'internal_entity_type' => 'task',
        ]);
        $this->assertDatabaseCount('integration_sync_audits', 2);

        $googleTaskAudit = IntegrationSyncAudit::query()
            ->where('tenant_id', $tenant->id)
            ->where('provider', 'google_tasks')
            ->where('internal_entity_type', 'task')
            ->first();

        $this->assertNotNull($googleTaskAudit);
        $this->assertSame('success', $googleTaskAudit->status);
        $this->assertIsArray($googleTaskAudit->metadata);
        $this->assertSame('google_tasks.v1', $googleTaskAudit->metadata['mapping_version'] ?? null);
        $this->assertSame([15, 60, 300, 900], $googleTaskAudit->metadata['retry_profile'] ?? null);
    }

    public function test_user_can_sync_lists_and_tasks_to_todoist(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $list = TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
        ]);

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'todoist',
        ])->assertOk()
            ->assertJsonPath('data.provider', 'todoist')
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 2)
            ->assertJsonPath('data.mode', 'async');

        $this->drainIntegrationQueue();

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => 'todoist',
            'internal_entity_type' => 'task',
        ]);

        $todoistAudit = IntegrationSyncAudit::query()
            ->where('tenant_id', $tenant->id)
            ->where('provider', 'todoist')
            ->where('internal_entity_type', 'task')
            ->first();

        $this->assertNotNull($todoistAudit);
        $this->assertSame('todoist.v1', $todoistAudit->metadata['mapping_version'] ?? null);
        $this->assertSame([15, 60, 300, 900], $todoistAudit->metadata['retry_profile'] ?? null);
    }

    public function test_sync_scope_is_limited_to_authenticated_user_tenant_data(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $listA = TaskList::factory()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
        ]);
        Task::factory()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'list_id' => $listA->id,
        ]);

        $listB = TaskList::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);
        Task::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'list_id' => $listB->id,
        ]);

        Sanctum::actingAs($userA);

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk()
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 2);

        $this->drainIntegrationQueue();

        $this->assertDatabaseMissing('sync_mappings', [
            'tenant_id' => $tenantB->id,
            'provider' => 'trello',
        ]);
    }

    public function test_guest_cannot_trigger_integration_sync(): void
    {
        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertUnauthorized();
    }

    public function test_changed_task_payload_is_synced_while_exact_replay_is_skipped(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $list = TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        $task = Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'title' => 'Original title',
        ]);

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk()
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 2)
            ->assertJsonPath('data.skipped', 0);

        $this->drainIntegrationQueue();

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk()
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 0)
            ->assertJsonPath('data.skipped', 2);

        $task->forceFill(['title' => 'Updated title'])->save();

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk()
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.enqueued', 1)
            ->assertJsonPath('data.skipped', 1);

        $this->drainIntegrationQueue();
    }

    public function test_sync_processes_list_and_task_records_across_chunk_boundary(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $lists = TaskList::factory()->count(101)->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'is_archived' => false,
        ]);

        Task::factory()->count(101)->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $lists->first()->id,
            'status' => 'todo',
        ]);

        $response = $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk();

        $response->assertJsonPath('data.processed', 202)
            ->assertJsonPath('data.enqueued', 202)
            ->assertJsonPath('data.skipped', 0);

        $this->assertCount(202, $response->json('data.job_references', []));
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
