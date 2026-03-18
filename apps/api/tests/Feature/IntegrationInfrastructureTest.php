<?php

namespace Tests\Feature;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\IntegrationAdapterRegistry;
use App\Integrations\Services\IntegrationSyncService;
use App\Integrations\Support\IntegrationSyncResult;
use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Tests\TestCase;
use Throwable;

class IntegrationInfrastructureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_sync_service_upserts_mapping_and_enforces_idempotency(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        $task = Task::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'list_id' => $list->id]);

        $adapter = new class implements IntegrationAdapter
        {
            public int $calls = 0;

            public function provider(): string
            {
                return 'fake_provider';
            }

            public function sync(array $payload): IntegrationSyncResult
            {
                $this->calls++;

                return new IntegrationSyncResult(
                    externalId: 'ext-task-1',
                    status: 'success',
                    syncHash: 'hash-123'
                );
            }
        };

        $this->app->instance(
            IntegrationAdapterRegistry::class,
            new IntegrationAdapterRegistry([$adapter])
        );

        $service = $this->app->make(IntegrationSyncService::class);

        $payload = [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'fake_provider',
            'internal_entity_type' => 'task',
            'internal_entity_id' => $task->id,
            'external_id' => 'ext-task-1',
            'idempotency_key' => 'idem-001',
        ];

        $first = $service->sync($payload);
        $second = $service->sync($payload);

        $this->assertSame('success', $first['status']);
        $this->assertSame('duplicate_skipped', $second['status']);
        $this->assertSame(1, $adapter->calls);

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'fake_provider',
            'external_id' => 'ext-task-1',
            'internal_entity_type' => 'task',
            'internal_entity_id' => $task->id,
            'last_sync_status' => 'success',
            'sync_hash' => 'hash-123',
        ]);
        $this->assertDatabaseHas('integration_sync_audits', [
            'tenant_id' => $tenant->id,
            'provider' => 'fake_provider',
            'idempotency_key' => 'idem-001',
            'status' => 'success',
        ]);
        $this->assertDatabaseHas('integration_sync_audits', [
            'tenant_id' => $tenant->id,
            'provider' => 'fake_provider',
            'idempotency_key' => 'idem-001',
            'status' => 'duplicate_skipped',
        ]);
    }

    public function test_failed_sync_job_is_persisted_in_dead_letter_table(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        $task = Task::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'list_id' => $list->id]);

        $failingAdapter = new class implements IntegrationAdapter
        {
            public function provider(): string
            {
                return 'broken_provider';
            }

            public function sync(array $payload): IntegrationSyncResult
            {
                throw new RuntimeException('Provider API unavailable');
            }
        };

        $this->app->instance(
            IntegrationAdapterRegistry::class,
            new IntegrationAdapterRegistry([$failingAdapter])
        );

        $job = new ProcessIntegrationSyncJob([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'broken_provider',
            'internal_entity_type' => 'task',
            'internal_entity_id' => $task->id,
            'idempotency_key' => 'idem-002',
        ]);

        $service = $this->app->make(IntegrationSyncService::class);

        try {
            $job->handle($service);
            $this->fail('Expected sync to throw.');
        } catch (Throwable $exception) {
            $job->failed($exception);
        }

        $this->assertDatabaseHas('integration_sync_failures', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'broken_provider',
            'idempotency_key' => 'idem-002',
            'error_message' => 'Provider API unavailable',
        ]);
        $this->assertDatabaseHas('integration_sync_audits', [
            'tenant_id' => $tenant->id,
            'provider' => 'broken_provider',
            'idempotency_key' => 'idem-002',
            'status' => 'failed',
        ]);
    }

    public function test_sync_service_blocks_external_mapping_reassignment(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        $taskA = Task::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'list_id' => $list->id]);
        $taskB = Task::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'list_id' => $list->id]);

        $adapter = new class implements IntegrationAdapter
        {
            public function provider(): string
            {
                return 'fake_provider_conflict';
            }

            public function sync(array $payload): IntegrationSyncResult
            {
                return new IntegrationSyncResult(
                    externalId: 'ext-shared-1',
                    status: 'success',
                    syncHash: 'hash-abc'
                );
            }
        };

        $this->app->instance(
            IntegrationAdapterRegistry::class,
            new IntegrationAdapterRegistry([$adapter])
        );

        $service = $this->app->make(IntegrationSyncService::class);

        $service->sync([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'fake_provider_conflict',
            'internal_entity_type' => 'task',
            'internal_entity_id' => $taskA->id,
            'idempotency_key' => 'idem-conflict-1',
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Sync mapping integrity violation for external entity.');

        $service->sync([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'fake_provider_conflict',
            'internal_entity_type' => 'task',
            'internal_entity_id' => $taskB->id,
            'idempotency_key' => 'idem-conflict-2',
        ]);
    }

    public function test_google_tasks_sync_job_uses_retry_backoff_profile(): void
    {
        $job = new ProcessIntegrationSyncJob([
            'provider' => 'google_tasks',
            'tenant_id' => 'tenant-1',
            'user_id' => 'user-1',
            'internal_entity_type' => 'task',
            'internal_entity_id' => 'task-1',
            'idempotency_key' => 'idem-google-1',
        ]);

        $this->assertSame(5, $job->tries);
        $this->assertSame([15, 60, 300, 900], $job->backoff);
    }
}
