<?php

namespace Tests\Feature;

use App\Observability\MetricCounter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class IntegrationEventIngestionStatsCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_command_returns_success_when_event_ingestion_window_is_healthy(): void
    {
        $this->artisan('integrations:event-ingestion-stats --json')
            ->expectsOutputToContain('"severity": "ok"')
            ->assertExitCode(0);
    }

    public function test_warning_threshold_fails_in_strict_mode_only(): void
    {
        $metrics = app(MetricCounter::class);
        $metrics->increment('integration.events.received', 100);
        $metrics->increment('integration.events.dropped', 6);
        $metrics->increment('integration.events.lag.count', 100);
        $metrics->increment('integration.events.lag.sum_ms', 500000);

        $this->artisan('integrations:event-ingestion-stats --json')
            ->expectsOutputToContain('"severity": "warning"')
            ->assertExitCode(0);

        $this->artisan('integrations:event-ingestion-stats --json --strict')
            ->expectsOutputToContain('"severity": "warning"')
            ->assertExitCode(1);
    }

    public function test_critical_threshold_returns_failure(): void
    {
        $metrics = app(MetricCounter::class);
        $metrics->increment('integration.events.received', 10);
        $metrics->increment('integration.events.dropped', 2);
        $metrics->increment('integration.events.lag.count', 10);
        $metrics->increment('integration.events.lag.sum_ms', 3000000);

        $this->artisan('integrations:event-ingestion-stats --json')
            ->expectsOutputToContain('"severity": "critical"')
            ->assertExitCode(1);
    }
}
