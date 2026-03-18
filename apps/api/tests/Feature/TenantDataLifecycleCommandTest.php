<?php

namespace Tests\Feature;

use App\Jobs\DeleteTenantDataJob;
use App\Models\AnalyticsEvent;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TenantDataLifecycleCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_retention_prune_is_tenant_scoped_and_audited(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        AnalyticsEvent::query()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'event_name' => 'tasks.task.created',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'tasks',
            'session_id' => 'tenant-a-old',
            'trace_id' => 'trace-a-old',
            'properties' => [],
            'occurred_at' => now()->subDays(200),
            'received_at' => now()->subDays(200),
        ]);

        AnalyticsEvent::query()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'event_name' => 'tasks.task.created',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'tasks',
            'session_id' => 'tenant-b-old',
            'trace_id' => 'trace-b-old',
            'properties' => [],
            'occurred_at' => now()->subDays(200),
            'received_at' => now()->subDays(200),
        ]);

        $this->artisan("tenants:retention-prune --tenant={$tenantA->id}")
            ->expectsOutputToContain('Rows affected: 1')
            ->assertExitCode(0);

        $this->assertDatabaseMissing('analytics_events', [
            'tenant_id' => $tenantA->id,
            'session_id' => 'tenant-a-old',
        ]);
        $this->assertDatabaseHas('analytics_events', [
            'tenant_id' => $tenantB->id,
            'session_id' => 'tenant-b-old',
        ]);
        $this->assertDatabaseHas('tenant_data_lifecycle_audits', [
            'tenant_id' => $tenantA->id,
            'workflow' => 'retention',
            'status' => 'completed',
            'target' => 'analytics_events',
            'rows_affected' => 1,
        ]);
    }

    public function test_tenant_delete_data_removes_records_and_audits(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'tenant-delete@example.com']);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        $task = Task::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'list_id' => $list->id]);

        DB::table('sessions')->insert([
            'id' => 'tenant-delete-session',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'payload' => 'payload',
            'last_activity' => now()->timestamp,
        ]);

        DB::table('personal_access_tokens')->insert([
            'tokenable_type' => User::class,
            'tokenable_id' => $user->id,
            'name' => 'test-token',
            'token' => str_repeat('a', 64),
            'abilities' => json_encode(['*'], JSON_THROW_ON_ERROR),
            'last_used_at' => null,
            'expires_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => 'reset-token',
            'created_at' => now(),
        ]);

        $this->artisan("tenants:delete-data {$tenant->id}")
            ->expectsOutputToContain('Rows affected:')
            ->assertExitCode(0);

        $this->assertDatabaseMissing('tenants', ['id' => $tenant->id]);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
        $this->assertDatabaseMissing('sessions', ['id' => 'tenant-delete-session']);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
        $this->assertDatabaseHas('tenant_data_lifecycle_audits', [
            'tenant_id' => $tenant->id,
            'workflow' => 'deletion',
            'status' => 'completed',
            'target' => 'tenant',
        ]);
    }

    public function test_tenant_delete_data_can_be_queued(): void
    {
        $tenant = Tenant::factory()->create();

        Bus::fake();

        $this->artisan("tenants:delete-data {$tenant->id} --queue")
            ->expectsOutputToContain('Queued: yes')
            ->assertExitCode(0);

        Bus::assertDispatched(DeleteTenantDataJob::class, function (DeleteTenantDataJob $job) use ($tenant): bool {
            return $job->tenantId === $tenant->id && $job->dryRun === false;
        });
    }
}
