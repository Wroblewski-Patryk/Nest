<?php

namespace App\Analytics\Services;

use App\Models\LifeArea;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class LifeAreaBalanceScoreService
{
    /**
     * @return array<string, mixed>
     */
    public function scoreForUser(User $user, int $windowDays = 30): array
    {
        $windowDays = max(1, min($windowDays, 180));
        $windowStart = Carbon::now()->subDays($windowDays)->startOfDay();
        $windowEnd = Carbon::now();

        $lifeAreas = LifeArea::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('is_archived', false)
            ->orderByDesc('weight')
            ->orderBy('name')
            ->get();

        $totalWeight = max(1, (int) $lifeAreas->sum('weight'));
        $journalByArea = $this->journalCountsByArea($user, $windowStart, $windowEnd);
        $taskByArea = $this->completedTaskCountsByArea($user, $windowStart, $windowEnd);
        $habitByArea = $this->habitLogCountsByArea($user, $windowStart, $windowEnd);

        $rows = [];
        $totalActivity = 0;
        $totalJournal = array_sum($journalByArea);
        $totalTaskCompleted = array_sum($taskByArea);

        foreach ($lifeAreas as $lifeArea) {
            $lifeAreaId = (string) $lifeArea->id;
            $journalCount = (int) ($journalByArea[$lifeAreaId] ?? 0);
            $taskCompletedCount = (int) ($taskByArea[$lifeAreaId] ?? 0);
            $habitLogCount = (int) ($habitByArea[$lifeAreaId] ?? 0);
            $activityCount = $journalCount + $taskCompletedCount + $habitLogCount;
            $totalActivity += $activityCount;

            $rows[] = [
                'life_area_id' => $lifeAreaId,
                'name' => (string) $lifeArea->name,
                'weight' => (int) $lifeArea->weight,
                'target_share' => round(((int) $lifeArea->weight / $totalWeight), 4),
                'journal_entries' => $journalCount,
                'completed_tasks' => $taskCompletedCount,
                'habit_logs' => $habitLogCount,
                'activity_count' => $activityCount,
            ];
        }

        $scoreRows = array_map(function (array $row) use ($totalActivity, $totalJournal, $totalTaskCompleted): array {
            $targetShare = (float) $row['target_share'];
            $actualShare = $totalActivity > 0
                ? ((int) $row['activity_count'] / $totalActivity)
                : $targetShare;

            $alignmentScore = max(0.0, 1 - abs($actualShare - $targetShare));
            $journalScore = $totalJournal > 0 ? ((int) $row['journal_entries'] / $totalJournal) : 0.0;
            $taskScore = $totalTaskCompleted > 0 ? ((int) $row['completed_tasks'] / $totalTaskCompleted) : 0.0;

            $balanceScore = ((0.50 * $alignmentScore) + (0.30 * $journalScore) + (0.20 * $taskScore)) * 100;

            return [
                ...$row,
                'actual_share' => round($actualShare, 4),
                'alignment_score' => round($alignmentScore * 100, 2),
                'journal_score' => round($journalScore * 100, 2),
                'task_score' => round($taskScore * 100, 2),
                'balance_score' => round($balanceScore, 2),
            ];
        }, $rows);

        $global = 0.0;
        foreach ($scoreRows as $row) {
            $global += ((float) $row['balance_score']) * ((float) $row['target_share']);
        }

        return [
            'window_days' => $windowDays,
            'window_start' => $windowStart->toISOString(),
            'window_end' => $windowEnd->toISOString(),
            'global_balance_score' => round($global, 2),
            'data' => $scoreRows,
        ];
    }

    /**
     * @return array<string, int>
     */
    private function journalCountsByArea(User $user, Carbon $start, Carbon $end): array
    {
        return DB::table('journal_entry_life_area as jela')
            ->join('journal_entries as je', 'je.id', '=', 'jela.journal_entry_id')
            ->where('jela.tenant_id', $user->tenant_id)
            ->where('je.user_id', $user->id)
            ->whereBetween('je.entry_date', [$start->toDateString(), $end->toDateString()])
            ->groupBy('jela.life_area_id')
            ->select('jela.life_area_id', DB::raw('COUNT(*) as aggregate_count'))
            ->pluck('aggregate_count', 'jela.life_area_id')
            ->map(fn ($count) => (int) $count)
            ->toArray();
    }

    /**
     * @return array<string, int>
     */
    private function completedTaskCountsByArea(User $user, Carbon $start, Carbon $end): array
    {
        return Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->whereNotNull('life_area_id')
            ->where(function ($query) use ($start, $end): void {
                $query
                    ->where(function ($inner) use ($start, $end): void {
                        $inner->where('status', 'done')
                            ->whereBetween('updated_at', [$start, $end]);
                    })
                    ->orWhereBetween('completed_at', [$start, $end]);
            })
            ->groupBy('life_area_id')
            ->select('life_area_id', DB::raw('COUNT(*) as aggregate_count'))
            ->pluck('aggregate_count', 'life_area_id')
            ->map(fn ($count) => (int) $count)
            ->toArray();
    }

    /**
     * @return array<string, int>
     */
    private function habitLogCountsByArea(User $user, Carbon $start, Carbon $end): array
    {
        return DB::table('habit_logs as hl')
            ->join('habits as h', 'h.id', '=', 'hl.habit_id')
            ->where('hl.tenant_id', $user->tenant_id)
            ->where('hl.user_id', $user->id)
            ->whereNotNull('h.life_area_id')
            ->whereBetween('hl.logged_at', [$start, $end])
            ->groupBy('h.life_area_id')
            ->select('h.life_area_id', DB::raw('COUNT(*) as aggregate_count'))
            ->pluck('aggregate_count', 'h.life_area_id')
            ->map(fn ($count) => (int) $count)
            ->toArray();
    }
}
