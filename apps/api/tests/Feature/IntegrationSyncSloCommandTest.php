<?php

namespace Tests\Feature;

use App\Observability\MetricCounter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class IntegrationSyncSloCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_command_returns_success_when_slo_is_healthy(): void
    {
        $metrics = app(MetricCounter::class);
        $metrics->increment('integration.sync.processed', 10);
        $metrics->increment('integration.sync.latency.count', 10);
        $metrics->increment('integration.sync.latency.sum_ms', 1000);
        $metrics->increment('integration.sync.latency.bucket_250', 10);

        $this->artisan('integrations:sync-slo-check --json')
            ->expectsOutputToContain('"severity": "ok"')
            ->assertExitCode(0);
    }

    public function test_command_returns_failure_when_critical_threshold_is_breached(): void
    {
        $metrics = app(MetricCounter::class);
        $metrics->increment('integration.sync.processed', 80);
        $metrics->increment('integration.sync.failed', 20);
        $metrics->increment('integration.sync.latency.count', 100);
        $metrics->increment('integration.sync.latency.sum_ms', 400000);
        $metrics->increment('integration.sync.latency.bucket_5000', 100);

        $this->artisan('integrations:sync-slo-check --json')
            ->expectsOutputToContain('"severity": "critical"')
            ->assertExitCode(1);
    }
}
