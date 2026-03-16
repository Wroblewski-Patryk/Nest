<?php

namespace Tests\Unit;

use App\Observability\IntegrationSyncSloService;
use App\Observability\MetricCounter;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class IntegrationSyncSloServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_service_reports_ok_when_window_is_healthy(): void
    {
        $metrics = app(MetricCounter::class);
        $metrics->increment('integration.sync.processed', 100);
        $metrics->increment('integration.sync.latency.count', 100);
        $metrics->increment('integration.sync.latency.sum_ms', 12000);
        $metrics->increment('integration.sync.latency.bucket_250', 96);
        $metrics->increment('integration.sync.latency.bucket_500', 4);

        $snapshot = app(IntegrationSyncSloService::class)->evaluateCurrentWindow();

        $this->assertSame('ok', $snapshot['alert']['severity']);
        $this->assertSame(100.0, $snapshot['current']['success_rate_percent']);
        $this->assertSame(250, $snapshot['current']['p95_latency_ms']);
    }

    public function test_service_reports_critical_when_error_budget_and_latency_are_breached(): void
    {
        $metrics = app(MetricCounter::class);
        $metrics->increment('integration.sync.processed', 90);
        $metrics->increment('integration.sync.failed', 10);
        $metrics->increment('integration.sync.latency.count', 100);
        $metrics->increment('integration.sync.latency.sum_ms', 300000);
        $metrics->increment('integration.sync.latency.bucket_5000', 100);

        $snapshot = app(IntegrationSyncSloService::class)->evaluateCurrentWindow();

        $this->assertSame('critical', $snapshot['alert']['severity']);
        $this->assertContains('success_rate_below_threshold', $snapshot['alert']['reasons']);
        $this->assertContains('p95_latency_above_threshold', $snapshot['alert']['reasons']);
        $this->assertContains('error_budget_burn_above_threshold', $snapshot['alert']['reasons']);
    }
}
