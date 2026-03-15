<?php

namespace App\Observability;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class MetricCounter
{
    public function increment(string $metric, int $value = 1): int
    {
        $key = $this->key($metric);

        if (! Cache::has($key)) {
            Cache::put($key, 0, now()->addDay());
        }

        return (int) Cache::increment($key, $value);
    }

    public function getCurrentCount(string $metric): int
    {
        return (int) Cache::get($this->key($metric), 0);
    }

    private function key(string $metric): string
    {
        $bucket = Carbon::now()->format('YmdH');

        return "metrics:{$bucket}:{$metric}";
    }
}
