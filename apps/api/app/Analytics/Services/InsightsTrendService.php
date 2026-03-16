<?php

namespace App\Analytics\Services;

use App\Models\AnalyticsEvent;
use App\Models\Task;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InsightsTrendService
{
    /**
     * @return array<string, mixed>
     */
    public function trendForUser(
        User $user,
        string $module,
        string $period = 'weekly',
        ?int $points = null
    ): array {
        $period = in_array($period, ['weekly', 'monthly'], true) ? $period : 'weekly';
        $points = $this->normalizePoints($period, $points);
        $buckets = $this->buildBuckets($period, $points);
        $windowStart = CarbonImmutable::parse($buckets[0]['bucket_start'])->startOfDay();
        $windowEnd = CarbonImmutable::parse($buckets[count($buckets) - 1]['bucket_end'])->endOfDay();
        $timestamps = $this->activityTimestampsForModule($user, $module, $windowStart, $windowEnd);

        foreach ($timestamps as $timestamp) {
            foreach ($buckets as $index => $bucket) {
                $bucketStart = CarbonImmutable::parse($bucket['bucket_start'])->startOfDay();
                $bucketEnd = CarbonImmutable::parse($bucket['bucket_end'])->endOfDay();

                if ($timestamp->betweenIncluded($bucketStart, $bucketEnd)) {
                    $buckets[$index]['value']++;
                    break;
                }
            }
        }

        return [
            'data' => $buckets,
            'meta' => [
                'module' => $module,
                'period' => $period,
                'points' => $points,
                'window_start' => $windowStart->toISOString(),
                'window_end' => $windowEnd->toISOString(),
                'total' => array_sum(array_column($buckets, 'value')),
            ],
        ];
    }

    private function normalizePoints(string $period, ?int $points): int
    {
        $default = $period === 'weekly' ? 8 : 6;
        $value = $points ?? $default;

        return max(1, min($value, 52));
    }

    /**
     * @return list<array{bucket_start: string, bucket_end: string, value: int}>
     */
    private function buildBuckets(string $period, int $points): array
    {
        $now = CarbonImmutable::now();
        $anchor = $period === 'weekly'
            ? $now->startOfWeek(CarbonImmutable::MONDAY)
            : $now->startOfMonth();

        $buckets = [];
        for ($offset = $points - 1; $offset >= 0; $offset--) {
            $start = $period === 'weekly'
                ? $anchor->subWeeks($offset)
                : $anchor->subMonths($offset);
            $end = $period === 'weekly' ? $start->endOfWeek(CarbonImmutable::SUNDAY) : $start->endOfMonth();

            $buckets[] = [
                'bucket_start' => $start->toDateString(),
                'bucket_end' => $end->toDateString(),
                'value' => 0,
            ];
        }

        return $buckets;
    }

    /**
     * @return Collection<int, CarbonImmutable>
     */
    private function activityTimestampsForModule(
        User $user,
        string $module,
        CarbonImmutable $windowStart,
        CarbonImmutable $windowEnd
    ): Collection {
        return match ($module) {
            'tasks' => $this->taskCompletionTimestamps($user, $windowStart, $windowEnd),
            'habits' => $this->habitLogTimestamps($user, $windowStart, $windowEnd),
            'goals' => $this->goalEventTimestamps($user, $windowStart, $windowEnd),
            default => collect(),
        };
    }

    /**
     * @return Collection<int, CarbonImmutable>
     */
    private function taskCompletionTimestamps(
        User $user,
        CarbonImmutable $windowStart,
        CarbonImmutable $windowEnd
    ): Collection {
        return Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where(function ($query) use ($windowStart, $windowEnd): void {
                $query
                    ->whereBetween('completed_at', [$windowStart, $windowEnd])
                    ->orWhere(function ($inner) use ($windowStart, $windowEnd): void {
                        $inner
                            ->where('status', 'done')
                            ->whereBetween('updated_at', [$windowStart, $windowEnd]);
                    });
            })
            ->get(['completed_at', 'updated_at'])
            ->map(function (Task $task): CarbonImmutable {
                $timestamp = $task->completed_at ?? $task->updated_at;

                return CarbonImmutable::parse($timestamp);
            });
    }

    /**
     * @return Collection<int, CarbonImmutable>
     */
    private function habitLogTimestamps(
        User $user,
        CarbonImmutable $windowStart,
        CarbonImmutable $windowEnd
    ): Collection {
        return DB::table('habit_logs')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->whereBetween('logged_at', [$windowStart, $windowEnd])
            ->pluck('logged_at')
            ->map(fn ($timestamp) => CarbonImmutable::parse($timestamp))
            ->values();
    }

    /**
     * @return Collection<int, CarbonImmutable>
     */
    private function goalEventTimestamps(
        User $user,
        CarbonImmutable $windowStart,
        CarbonImmutable $windowEnd
    ): Collection {
        return AnalyticsEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('module', 'goals')
            ->whereBetween('occurred_at', [$windowStart, $windowEnd])
            ->pluck('occurred_at')
            ->map(fn ($timestamp) => CarbonImmutable::parse($timestamp))
            ->values();
    }
}
