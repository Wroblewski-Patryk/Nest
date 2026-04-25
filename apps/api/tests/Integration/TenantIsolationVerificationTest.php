<?php

namespace Tests\Integration;

use App\Integrations\Services\IntegrationSyncService;
use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\AutomationRule;
use App\Models\IntegrationSyncFailure;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Throwable;

class TenantIsolationVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_resources_are_not_visible_across_tenants(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $listB = TaskList::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id]);
        $taskB = Task::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id, 'list_id' => $listB->id]);
        $ruleB = AutomationRule::query()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'name' => 'Tenant B automation',
            'status' => 'active',
            'trigger' => ['type' => 'event', 'event_name' => 'tasks.task.completed'],
            'conditions' => [],
            'actions' => [
                [
                    'type' => 'send_notification',
                    'payload' => ['message' => 'x'],
                ],
            ],
        ]);

        Sanctum::actingAs($userA);

        $this->getJson("/api/v1/lists/{$listB->id}")->assertNotFound();
        $this->getJson("/api/v1/tasks/{$taskB->id}")->assertNotFound();
        $this->getJson("/api/v1/automations/rules/{$ruleB->id}")->assertNotFound();
    }

    public function test_integration_sync_service_rejects_cross_tenant_internal_entity_payload(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $listB = TaskList::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id]);

        $payload = [
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'provider' => 'trello',
            'internal_entity_type' => 'task_list',
            'internal_entity_id' => $listB->id,
            'external_id' => "trello-task_list-{$listB->id}",
            'idempotency_key' => (string) Str::uuid(),
            'sync_hash' => hash('sha256', 'x'),
            'entity_payload' => ['name' => 'malicious'],
        ];

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Internal entity ownership verification failed.');

        app(IntegrationSyncService::class)->sync($payload);
    }

    public function test_integration_list_task_sync_maps_only_authenticated_tenant_entities(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $listA = TaskList::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id]);
        Task::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id, 'list_id' => $listA->id]);

        $listB = TaskList::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id]);
        Task::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id, 'list_id' => $listB->id]);

        Sanctum::actingAs($userA);

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => 'trello',
        ])->assertOk();

        $this->drainIntegrationQueue();

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenantA->id,
            'provider' => 'trello',
            'internal_entity_type' => 'task_list',
            'internal_entity_id' => $listA->id,
        ]);
        $this->assertDatabaseMissing('sync_mappings', [
            'tenant_id' => $tenantB->id,
            'provider' => 'trello',
            'internal_entity_type' => 'task_list',
            'internal_entity_id' => $listB->id,
        ]);
    }

    public function test_queue_job_rejects_cross_tenant_internal_entity_payload(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $listB = TaskList::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id]);

        $job = new ProcessIntegrationSyncJob([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'provider' => 'trello',
            'internal_entity_type' => 'task_list',
            'internal_entity_id' => $listB->id,
            'idempotency_key' => (string) Str::uuid(),
        ]);

        $service = app(IntegrationSyncService::class);

        try {
            $job->handle($service);
            $this->fail('Expected queued sync to fail ownership verification.');
        } catch (Throwable $exception) {
            $job->failed($exception);
        }

        $this->assertDatabaseHas('integration_sync_failures', [
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'provider' => 'trello',
            'error_message' => 'Internal entity ownership verification failed.',
        ]);
        $this->assertDatabaseMissing('sync_mappings', [
            'tenant_id' => $tenantA->id,
            'provider' => 'trello',
            'internal_entity_type' => 'task_list',
            'internal_entity_id' => $listB->id,
        ]);
        $this->assertSame(1, IntegrationSyncFailure::query()->count());
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
