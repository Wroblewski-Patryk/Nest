<?php

namespace App\AI\Services;

use App\Models\CalendarEvent;
use App\Models\Goal;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\JournalEntry;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class AiContextGraphService
{
    private const SCHEMA_VERSION = 'ai-context.v1';

    private const REDACTION_POLICY_VERSION = 'ai-context-redaction.v1';

    /**
     * @var array<string, list<string>>
     */
    private const REDACTED_FIELDS = [
        'tasks' => ['description'],
        'calendar_events' => ['description'],
        'habits' => ['description'],
        'goals' => ['description'],
        'journal_entries' => ['body'],
    ];

    /**
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    public function buildForUser(User $user, array $options = []): array
    {
        $windowDays = max(1, (int) ($options['window_days'] ?? 14));
        $entityLimit = max(1, (int) ($options['entity_limit'] ?? 20));
        $asOf = array_key_exists('as_of', $options)
            ? Carbon::parse((string) $options['as_of'])->utc()->startOfMinute()
            : Carbon::now('UTC')->startOfMinute();
        $windowStart = $asOf->copy()->subDays($windowDays);
        $windowEnd = $asOf->copy()->endOfMinute();

        $tasks = $this->buildTaskContext($user, $asOf, $windowStart, $windowEnd, $entityLimit);
        $calendarEvents = $this->buildCalendarContext($user, $asOf, $entityLimit);
        $habits = $this->buildHabitContext($user, $windowStart, $windowEnd, $entityLimit);
        $goals = $this->buildGoalContext($user, $asOf, $entityLimit);
        $journalEntries = $this->buildJournalContext($user, $windowStart, $windowEnd, $entityLimit);

        $graph = [
            'schema_version' => self::SCHEMA_VERSION,
            'snapshot' => [
                'as_of' => $asOf->toISOString(),
                'window_days' => $windowDays,
                'window_start' => $windowStart->toISOString(),
                'window_end' => $windowEnd->toISOString(),
            ],
            'privacy' => [
                'redaction_policy_version' => self::REDACTION_POLICY_VERSION,
                'mode' => 'strict',
                'redacted_fields' => self::REDACTED_FIELDS,
            ],
            'signals' => [
                'tasks' => $tasks['signals'],
                'calendar_events' => $calendarEvents['signals'],
                'habits' => $habits['signals'],
                'goals' => $goals['signals'],
                'journal_entries' => $journalEntries['signals'],
            ],
            'entities' => [
                'tasks' => $tasks['entities'],
                'calendar_events' => $calendarEvents['entities'],
                'habits' => $habits['entities'],
                'goals' => $goals['entities'],
                'journal_entries' => $journalEntries['entities'],
            ],
        ];

        $graph['snapshot']['fingerprint'] = hash('sha256', $this->canonicalJson($graph));

        return ['data' => $graph];
    }

    /**
     * @return array{signals: array<string, mixed>, entities: list<array<string, mixed>>}
     */
    private function buildTaskContext(
        User $user,
        Carbon $asOf,
        Carbon $windowStart,
        Carbon $windowEnd,
        int $entityLimit
    ): array {
        $baseQuery = Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id);

        $entities = (clone $baseQuery)
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->orderBy('id')
            ->limit($entityLimit)
            ->get()
            ->map(function (Task $task): array {
                return [
                    'id' => (string) $task->id,
                    'title' => (string) $task->title,
                    'status' => (string) $task->status,
                    'priority' => (string) $task->priority,
                    'due_date' => $task->due_date?->toDateString(),
                    'starts_at' => $task->starts_at?->toISOString(),
                    'assignee_user_id' => $task->assignee_user_id !== null ? (string) $task->assignee_user_id : null,
                    'reminder_owner_user_id' => $task->reminder_owner_user_id !== null ? (string) $task->reminder_owner_user_id : null,
                    'has_description' => $task->description !== null && trim((string) $task->description) !== '',
                ];
            })
            ->all();

        /** @var array<string, int|string> $statusBreakdown */
        $statusBreakdown = (clone $baseQuery)
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status')
            ->map(fn (mixed $count): int => (int) $count)
            ->all();

        return [
            'signals' => [
                'total' => (clone $baseQuery)->count(),
                'open' => (clone $baseQuery)->whereIn('status', ['todo', 'in_progress'])->count(),
                'overdue' => (clone $baseQuery)
                    ->whereIn('status', ['todo', 'in_progress'])
                    ->whereDate('due_date', '<', $asOf->toDateString())
                    ->count(),
                'due_in_3_days' => (clone $baseQuery)
                    ->whereIn('status', ['todo', 'in_progress'])
                    ->whereBetween('due_date', [$asOf->toDateString(), $asOf->copy()->addDays(3)->toDateString()])
                    ->count(),
                'completed_in_window' => (clone $baseQuery)
                    ->whereNotNull('completed_at')
                    ->whereBetween('completed_at', [$windowStart, $windowEnd])
                    ->count(),
                'status_breakdown' => $statusBreakdown,
            ],
            'entities' => $entities,
        ];
    }

    /**
     * @return array{signals: array<string, mixed>, entities: list<array<string, mixed>>}
     */
    private function buildCalendarContext(User $user, Carbon $asOf, int $entityLimit): array
    {
        $baseQuery = CalendarEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id);

        $entities = (clone $baseQuery)
            ->orderBy('start_at')
            ->orderBy('id')
            ->limit($entityLimit)
            ->get()
            ->map(function (CalendarEvent $event): array {
                return [
                    'id' => (string) $event->id,
                    'title' => (string) $event->title,
                    'start_at' => $event->start_at?->toISOString(),
                    'end_at' => $event->end_at?->toISOString(),
                    'timezone' => (string) $event->timezone,
                    'all_day' => (bool) $event->all_day,
                    'linked_entity_type' => $event->linked_entity_type !== null ? (string) $event->linked_entity_type : null,
                    'linked_entity_id' => $event->linked_entity_id !== null ? (string) $event->linked_entity_id : null,
                    'assignee_user_id' => $event->assignee_user_id !== null ? (string) $event->assignee_user_id : null,
                    'reminder_owner_user_id' => $event->reminder_owner_user_id !== null ? (string) $event->reminder_owner_user_id : null,
                    'has_description' => $event->description !== null && trim((string) $event->description) !== '',
                ];
            })
            ->all();

        /** @var array<string, int|string> $linkedBreakdown */
        $linkedBreakdown = (clone $baseQuery)
            ->whereNotNull('linked_entity_type')
            ->selectRaw('linked_entity_type, count(*) as aggregate')
            ->groupBy('linked_entity_type')
            ->pluck('aggregate', 'linked_entity_type')
            ->map(fn (mixed $count): int => (int) $count)
            ->all();

        return [
            'signals' => [
                'total' => (clone $baseQuery)->count(),
                'upcoming_in_7_days' => (clone $baseQuery)
                    ->whereBetween('start_at', [$asOf, $asOf->copy()->addDays(7)])
                    ->count(),
                'all_day_total' => (clone $baseQuery)->where('all_day', true)->count(),
                'linked_entity_breakdown' => $linkedBreakdown,
            ],
            'entities' => $entities,
        ];
    }

    /**
     * @return array{signals: array<string, mixed>, entities: list<array<string, mixed>>}
     */
    private function buildHabitContext(User $user, Carbon $windowStart, Carbon $windowEnd, int $entityLimit): array
    {
        $baseQuery = Habit::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id);

        /** @var Collection<string, object{habit_id: string, log_count: int, last_logged_at: string}> $habitLogWindow */
        $habitLogWindow = HabitLog::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->whereBetween('logged_at', [$windowStart, $windowEnd])
            ->selectRaw('habit_id, count(*) as log_count, max(logged_at) as last_logged_at')
            ->groupBy('habit_id')
            ->get()
            ->keyBy('habit_id');

        $entities = (clone $baseQuery)
            ->orderByDesc('is_active')
            ->orderBy('title')
            ->orderBy('id')
            ->limit($entityLimit)
            ->get()
            ->map(function (Habit $habit) use ($habitLogWindow): array {
                $summary = $habitLogWindow->get((string) $habit->id);
                $cadenceType = is_array($habit->cadence) ? (string) ($habit->cadence['type'] ?? 'custom') : 'custom';

                return [
                    'id' => (string) $habit->id,
                    'title' => (string) $habit->title,
                    'type' => (string) $habit->type,
                    'is_active' => (bool) $habit->is_active,
                    'cadence_type' => $cadenceType,
                    'window_log_count' => $summary !== null ? (int) $summary->log_count : 0,
                    'last_logged_at' => $summary !== null && $summary->last_logged_at !== null
                        ? Carbon::parse((string) $summary->last_logged_at)->toISOString()
                        : null,
                    'has_description' => $habit->description !== null && trim((string) $habit->description) !== '',
                ];
            })
            ->all();

        /** @var array<string, int> $cadenceBreakdown */
        $cadenceBreakdown = (clone $baseQuery)
            ->where('is_active', true)
            ->get()
            ->groupBy(function (Habit $habit): string {
                return is_array($habit->cadence) ? (string) ($habit->cadence['type'] ?? 'custom') : 'custom';
            })
            ->map(fn (Collection $items): int => $items->count())
            ->all();

        return [
            'signals' => [
                'total' => (clone $baseQuery)->count(),
                'active' => (clone $baseQuery)->where('is_active', true)->count(),
                'inactive' => (clone $baseQuery)->where('is_active', false)->count(),
                'logs_in_window' => HabitLog::query()
                    ->where('tenant_id', $user->tenant_id)
                    ->where('user_id', $user->id)
                    ->whereBetween('logged_at', [$windowStart, $windowEnd])
                    ->count(),
                'active_cadence_breakdown' => $cadenceBreakdown,
            ],
            'entities' => $entities,
        ];
    }

    /**
     * @return array{signals: array<string, mixed>, entities: list<array<string, mixed>>}
     */
    private function buildGoalContext(User $user, Carbon $asOf, int $entityLimit): array
    {
        $baseQuery = Goal::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id);

        $entities = (clone $baseQuery)
            ->orderByRaw('CASE WHEN target_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('target_date')
            ->orderBy('id')
            ->limit($entityLimit)
            ->get()
            ->map(function (Goal $goal): array {
                return [
                    'id' => (string) $goal->id,
                    'title' => (string) $goal->title,
                    'status' => (string) $goal->status,
                    'target_date' => $goal->target_date?->toDateString(),
                    'has_description' => $goal->description !== null && trim((string) $goal->description) !== '',
                ];
            })
            ->all();

        /** @var array<string, int|string> $statusBreakdown */
        $statusBreakdown = (clone $baseQuery)
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status')
            ->map(fn (mixed $count): int => (int) $count)
            ->all();

        return [
            'signals' => [
                'total' => (clone $baseQuery)->count(),
                'active' => (clone $baseQuery)->where('status', 'active')->count(),
                'target_due_in_30_days' => (clone $baseQuery)
                    ->where('status', 'active')
                    ->whereBetween('target_date', [$asOf->toDateString(), $asOf->copy()->addDays(30)->toDateString()])
                    ->count(),
                'status_breakdown' => $statusBreakdown,
            ],
            'entities' => $entities,
        ];
    }

    /**
     * @return array{signals: array<string, mixed>, entities: list<array<string, mixed>>}
     */
    private function buildJournalContext(User $user, Carbon $windowStart, Carbon $windowEnd, int $entityLimit): array
    {
        $baseQuery = JournalEntry::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id);

        $entities = (clone $baseQuery)
            ->with(['lifeAreas:id'])
            ->orderByDesc('entry_date')
            ->orderByDesc('id')
            ->limit($entityLimit)
            ->get()
            ->map(function (JournalEntry $entry): array {
                return [
                    'id' => (string) $entry->id,
                    'title' => (string) $entry->title,
                    'mood' => $entry->mood !== null ? (string) $entry->mood : null,
                    'entry_date' => $entry->entry_date?->toDateString(),
                    'life_area_ids' => $entry->lifeAreas
                        ->pluck('id')
                        ->map(fn ($id): string => (string) $id)
                        ->sort()
                        ->values()
                        ->all(),
                    'has_body' => trim((string) $entry->body) !== '',
                ];
            })
            ->all();

        /** @var array<string, int|string> $moodBreakdown */
        $moodBreakdown = (clone $baseQuery)
            ->whereNotNull('mood')
            ->selectRaw('mood, count(*) as aggregate')
            ->groupBy('mood')
            ->pluck('aggregate', 'mood')
            ->map(fn (mixed $count): int => (int) $count)
            ->all();

        return [
            'signals' => [
                'total' => (clone $baseQuery)->count(),
                'entries_in_window' => (clone $baseQuery)
                    ->whereBetween('entry_date', [$windowStart->toDateString(), $windowEnd->toDateString()])
                    ->count(),
                'mood_breakdown' => $moodBreakdown,
            ],
            'entities' => $entities,
        ];
    }

    private function canonicalJson(array $payload): string
    {
        /** @var array<string, mixed> $normalized */
        $normalized = $this->normalizeForHash($payload);

        return (string) json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * @param  mixed  $value
     * @return mixed
     */
    private function normalizeForHash($value)
    {
        if (! is_array($value)) {
            return $value;
        }

        if ($this->isAssociative($value)) {
            ksort($value);
        }

        foreach ($value as $key => $child) {
            $value[$key] = $this->normalizeForHash($child);
        }

        return $value;
    }

    /**
     * @param  array<mixed>  $value
     */
    private function isAssociative(array $value): bool
    {
        if ($value === []) {
            return false;
        }

        return array_keys($value) !== range(0, count($value) - 1);
    }
}
