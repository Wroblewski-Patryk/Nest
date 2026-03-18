<?php

namespace App\AI\Services;

use App\Models\Goal;
use App\Models\Habit;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class WeeklyPlanningAssistantService
{
    /**
     * @param  array<string, mixed>  $constraints
     * @return array<string, mixed>
     */
    public function proposeWeeklyPlan(User $user, array $constraints): array
    {
        $availableHours = (int) ($constraints['available_hours'] ?? 10);
        $maxItems = (int) ($constraints['max_items'] ?? 10);
        $includeWeekend = (bool) ($constraints['include_weekend'] ?? false);
        $minConfidence = (float) ($constraints['min_confidence'] ?? 0.55);
        /** @var list<string> $prioritize */
        $prioritize = $constraints['prioritize'] ?? ['tasks', 'habits', 'goals'];

        $availableMinutes = $availableHours * 60;
        $planningDays = $this->planningDays($includeWeekend);
        $candidates = $this->candidateItems($user, $prioritize);

        $scheduled = [];
        $needsReview = [];
        $usedMinutes = 0;
        $dayIndex = 0;

        foreach ($candidates as $candidate) {
            if (count($scheduled) >= $maxItems) {
                break;
            }

            if ((float) $candidate['confidence_score'] < $minConfidence) {
                $needsReview[] = [
                    ...$candidate,
                    'guardrail_status' => 'needs_review',
                ];

                continue;
            }

            if (($usedMinutes + $candidate['estimated_minutes']) > $availableMinutes) {
                continue;
            }

            $assignedDay = $planningDays[$dayIndex % count($planningDays)];
            $dayIndex++;
            $usedMinutes += $candidate['estimated_minutes'];

            $scheduled[] = [
                ...$candidate,
                'scheduled_for' => $assignedDay->toDateString(),
                'guardrail_status' => 'accepted',
            ];
        }

        $reasonCodeCounts = collect($scheduled)
            ->flatMap(fn (array $item): array => $item['reason_codes'])
            ->countBy()
            ->sortDesc()
            ->all();

        return [
            'data' => [
                'constraints' => [
                    'available_hours' => $availableHours,
                    'max_items' => $maxItems,
                    'include_weekend' => $includeWeekend,
                    'min_confidence' => $minConfidence,
                    'prioritize' => $prioritize,
                ],
                'summary' => [
                    'planned_items' => count($scheduled),
                    'needs_review_items' => count($needsReview),
                    'used_minutes' => $usedMinutes,
                    'remaining_minutes' => max(0, $availableMinutes - $usedMinutes),
                ],
                'explainability' => [
                    'model_version' => 'weekly-plan.v2',
                    'reason_code_counts' => $reasonCodeCounts,
                    'generated_at' => Carbon::now()->toISOString(),
                    'guardrails' => [
                        'min_confidence_applied' => $minConfidence,
                        'low_confidence_policy' => 'needs_review',
                    ],
                ],
                'items' => $scheduled,
                'review_items' => $needsReview,
            ],
        ];
    }

    /**
     * @return list<Carbon>
     */
    private function planningDays(bool $includeWeekend): array
    {
        $days = [];
        $targetCount = $includeWeekend ? 7 : 5;
        $cursor = Carbon::now()->startOfDay();
        while (count($days) < $targetCount) {
            if ($includeWeekend || ! in_array($cursor->dayOfWeekIso, [6, 7], true)) {
                $days[] = $cursor->copy();
            }
            $cursor->addDay();
        }

        return $days;
    }

    /**
     * @param  list<string>  $prioritize
     * @return Collection<int, array<string, mixed>>
     */
    private function candidateItems(User $user, array $prioritize): Collection
    {
        $items = collect();

        if (in_array('tasks', $prioritize, true)) {
            $taskPriorityWeight = [
                'urgent' => 4,
                'high' => 3,
                'medium' => 2,
                'low' => 1,
            ];

            $tasks = Task::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('user_id', $user->id)
                ->whereIn('status', ['todo', 'in_progress'])
                ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
                ->orderBy('due_date')
                ->limit(8)
                ->get();

            $items = $items->concat($tasks->map(function (Task $task) use ($taskPriorityWeight): array {
                $priority = (string) $task->priority;
                $weight = $taskPriorityWeight[$priority] ?? 1;
                $dueLabel = $task->due_date?->toDateString() ?? 'no due date';

                return [
                    'type' => 'task',
                    'source_id' => (string) $task->id,
                    'title' => (string) $task->title,
                    'estimated_minutes' => 90,
                    'rationale' => "Prioritized {$priority} task with due {$dueLabel}.",
                    'confidence_score' => $this->taskConfidenceScore($priority, $task->due_date?->toDateString()),
                    'reason_codes' => [
                        "task_priority_{$priority}",
                        $task->due_date ? 'task_due_scheduled' : 'task_due_unspecified',
                    ],
                    'source_entities' => [
                        [
                            'entity_type' => 'task',
                            'entity_id' => (string) $task->id,
                            'signals' => [
                                'priority' => $priority,
                                'due_date' => $task->due_date?->toDateString(),
                            ],
                        ],
                    ],
                    'priority_weight' => 100 + ($weight * 10),
                ];
            }));
        }

        if (in_array('habits', $prioritize, true)) {
            $habits = Habit::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->orderBy('updated_at', 'desc')
                ->limit(6)
                ->get();

            $items = $items->concat($habits->map(function (Habit $habit): array {
                $cadenceType = (string) ($habit->cadence['type'] ?? 'custom');

                return [
                    'type' => 'habit',
                    'source_id' => (string) $habit->id,
                    'title' => (string) $habit->title,
                    'estimated_minutes' => 30,
                    'rationale' => "Active {$cadenceType} habit to preserve consistency.",
                    'confidence_score' => $this->habitConfidenceScore($cadenceType),
                    'reason_codes' => ['habit_consistency', "habit_cadence_{$cadenceType}"],
                    'source_entities' => [
                        [
                            'entity_type' => 'habit',
                            'entity_id' => (string) $habit->id,
                            'signals' => [
                                'cadence_type' => $cadenceType,
                                'is_active' => true,
                            ],
                        ],
                    ],
                    'priority_weight' => 70,
                ];
            }));
        }

        if (in_array('goals', $prioritize, true)) {
            $goals = Goal::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->orderBy('target_date')
                ->limit(6)
                ->get();

            $items = $items->concat($goals->map(function (Goal $goal): array {
                $targetDate = $goal->target_date?->toDateString() ?? 'no target date';

                return [
                    'type' => 'goal',
                    'source_id' => (string) $goal->id,
                    'title' => (string) $goal->title,
                    'estimated_minutes' => 45,
                    'rationale' => "Active goal milestone with target {$targetDate}.",
                    'confidence_score' => $this->goalConfidenceScore($goal->target_date?->toDateString()),
                    'reason_codes' => [
                        'goal_active_milestone',
                        $goal->target_date ? 'goal_target_scheduled' : 'goal_target_unspecified',
                    ],
                    'source_entities' => [
                        [
                            'entity_type' => 'goal',
                            'entity_id' => (string) $goal->id,
                            'signals' => [
                                'status' => (string) $goal->status,
                                'target_date' => $goal->target_date?->toDateString(),
                            ],
                        ],
                    ],
                    'priority_weight' => 80,
                ];
            }));
        }

        return $items
            ->sortByDesc('priority_weight')
            ->values();
    }

    private function taskConfidenceScore(string $priority, ?string $dueDate): float
    {
        $base = match ($priority) {
            'urgent' => 0.92,
            'high' => 0.84,
            'medium' => 0.68,
            default => 0.46,
        };

        if ($dueDate === null) {
            $base -= 0.10;
        }

        return round(max(0.10, min($base, 0.99)), 2);
    }

    private function habitConfidenceScore(string $cadenceType): float
    {
        $base = match ($cadenceType) {
            'daily' => 0.72,
            'weekly' => 0.65,
            default => 0.58,
        };

        return round($base, 2);
    }

    private function goalConfidenceScore(?string $targetDate): float
    {
        if ($targetDate === null) {
            return 0.55;
        }

        return 0.74;
    }
}
