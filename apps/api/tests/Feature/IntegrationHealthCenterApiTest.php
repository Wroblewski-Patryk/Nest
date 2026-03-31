<?php

namespace Tests\Feature;

use App\Integrations\Services\IntegrationSyncService;
use App\Models\IntegrationEventIngestion;
use App\Models\IntegrationSyncAudit;
use App\Models\IntegrationSyncFailure;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class IntegrationHealthCenterApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_provider_health_and_run_one_click_replay_remediation(): void
    {
        $syncServiceMock = Mockery::mock(IntegrationSyncService::class);
        $syncServiceMock->shouldReceive('sync')
            ->once()
            ->andReturn(['status' => 'success']);
        $this->app->instance(IntegrationSyncService::class, $syncServiceMock);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/integrations/connections/trello', [
            'access_token' => 'trello-token',
            'scopes' => ['read', 'write'],
        ])->assertOk();

        $failure = IntegrationSyncFailure::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'trello',
            'idempotency_key' => 'fail-trello-1',
            'payload' => [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'provider' => 'trello',
                'idempotency_key' => 'fail-trello-1',
                'internal_entity_type' => 'task',
                'internal_entity_id' => (string) Str::uuid(),
                'external_id' => 'trello-card-1',
                'entity_payload' => ['title' => 'Retry me'],
                'sync_hash' => hash('sha256', 'fail-trello-1'),
                'sync_request_id' => (string) Str::uuid(),
                'job_reference' => (string) Str::ulid(),
                'trace_id' => (string) Str::uuid(),
            ],
            'error_message' => 'Provider timeout',
            'attempts' => 3,
            'replay_count' => 0,
            'failed_at' => now()->subMinutes(10),
        ]);

        IntegrationSyncAudit::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'trello',
            'idempotency_key' => 'audit-success-1',
            'status' => 'success',
            'occurred_at' => now()->subMinutes(8),
        ]);

        IntegrationSyncAudit::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'trello',
            'idempotency_key' => 'audit-failure-1',
            'status' => 'failed',
            'occurred_at' => now()->subMinutes(6),
            'metadata' => ['error_message' => 'Provider timeout'],
        ]);

        IntegrationEventIngestion::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'trello',
            'event_id' => 'evt-trello-dropped-1',
            'event_type' => 'card.updated',
            'internal_entity_type' => 'task',
            'internal_entity_id' => (string) Str::uuid(),
            'status' => 'dropped',
            'lag_ms' => 1200,
            'drop_reason' => 'queue_job_failed',
            'replay_count' => 0,
            'event_occurred_at' => now()->subMinutes(5),
            'received_at' => now()->subMinutes(5),
            'queued_at' => now()->subMinutes(5),
            'processed_at' => now()->subMinutes(4),
            'payload' => ['title' => 'Dropped'],
            'queue_job_id' => 'job-1',
        ]);

        $this->getJson('/api/v1/integrations/health?window_hours=24')
            ->assertOk()
            ->assertJsonPath('meta.total', 7)
            ->assertJsonPath('meta.degraded', 1)
            ->assertJsonPath('data.0.provider', 'trello')
            ->assertJsonPath('data.0.health.status', 'degraded')
            ->assertJsonPath('data.0.failures.open_count', 1)
            ->assertJsonPath('data.0.remediation.one_click_actions.0.action', 'replay_latest_failure')
            ->assertJsonPath('data.0.remediation.one_click_actions.0.enabled', true);

        $this->postJson('/api/v1/integrations/health/trello/remediate', [
            'action' => 'replay_latest_failure',
        ])
            ->assertOk()
            ->assertJsonPath('data.provider', 'trello')
            ->assertJsonPath('data.action', 'replay_latest_failure')
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.result.replay.status', 'success');

        $this->assertDatabaseHas('integration_sync_failures', [
            'id' => $failure->id,
            'replay_count' => 1,
            'last_replay_status' => 'success',
        ]);
    }

    public function test_guest_cannot_access_health_center_endpoints(): void
    {
        $this->getJson('/api/v1/integrations/health')->assertUnauthorized();
        $this->postJson('/api/v1/integrations/health/trello/remediate', [
            'action' => 'replay_latest_failure',
        ])->assertUnauthorized();
    }
}
