<?php

namespace Tests\Unit;

use App\Observability\MetricCounter;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MetricCounterTest extends TestCase
{
    public function test_counter_increments_and_returns_current_bucket_value(): void
    {
        Cache::flush();
        $counter = app(MetricCounter::class);

        $this->assertSame(0, $counter->getCurrentCount('integration.sync.processed'));
        $this->assertSame(1, $counter->increment('integration.sync.processed'));
        $this->assertSame(2, $counter->increment('integration.sync.processed'));
        $this->assertSame(2, $counter->getCurrentCount('integration.sync.processed'));
    }
}
