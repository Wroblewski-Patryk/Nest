<?php

namespace Tests\Feature;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\IntegrationAdapterRegistry;
use App\Integrations\Services\IntegrationSyncService;
use App\Integrations\Support\IntegrationSyncResult;
use App\Models\Tenant;
use App\Models\User;
use App\Observability\MetricCounter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ObservabilityBaselineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_api_responses_include_trace_id_header_and_increment_api_metric(): void
    {
        $metrics = app(MetricCounter::class);
        $before = $metrics->getCurrentCount('api.requests.total');

        $response = $this->getJson('/api/v1/lists');

        $response->assertUnauthorized();
        $response->assertHeader('X-Trace-Id');
        $this->assertNotSame('', (string) $response->headers->get('X-Trace-Id'));
        $this->assertSame($before + 1, $metrics->getCurrentCount('api.requests.total'));
    }

    public function test_request_trace_id_is_propagated_to_response(): void
    {
        $response = $this->withHeaders([
            'X-Trace-Id' => 'trace-test-123',
        ])->getJson('/api/v1/lists');

        $response->assertUnauthorized();
        $response->assertHeader('X-Trace-Id', 'trace-test-123');
    }

    public function test_sync_metrics_track_processed_and_duplicate_events(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $adapter = new class implements IntegrationAdapter
        {
            public function provider(): string
            {
                return 'metrics_provider';
            }

            public function sync(array $payload): IntegrationSyncResult
            {
                return new IntegrationSyncResult(
                    externalId: 'metrics-ext-1',
                    status: 'success',
                    syncHash: 'metrics-hash'
                );
            }
        };

        $this->app->instance(
            IntegrationAdapterRegistry::class,
            new IntegrationAdapterRegistry([$adapter])
        );

        $service = $this->app->make(IntegrationSyncService::class);
        $metrics = $this->app->make(MetricCounter::class);

        $payload = [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'metrics_provider',
            'internal_entity_type' => 'task',
            'internal_entity_id' => '019cf39d-8460-73ed-84fe-3aa85847e58e',
            'idempotency_key' => 'metrics-idem-1',
        ];

        $service->sync($payload);
        $service->sync($payload);

        $this->assertSame(1, $metrics->getCurrentCount('integration.sync.processed'));
        $this->assertSame(1, $metrics->getCurrentCount('integration.sync.duplicate'));
    }
}
