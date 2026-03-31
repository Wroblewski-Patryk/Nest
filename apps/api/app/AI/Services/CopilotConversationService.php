<?php

namespace App\AI\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class CopilotConversationService
{
    public function __construct(
        private readonly AiContextGraphService $contextGraphService
    ) {
    }

    /**
     * @param  array<string, mixed>  $contextOptions
     * @return array<string, mixed>
     */
    public function respond(User $user, string $message, array $contextOptions = []): array
    {
        $contextResult = $this->contextGraphService->buildForUser($user, $contextOptions);
        /** @var array<string, mixed> $contextGraph */
        $contextGraph = $contextResult['data'];
        $intent = $this->detectIntent($message);
        $recommendation = $this->buildRecommendation($intent, $contextGraph);
        $sourceReferences = $this->buildSourceReferences($contextGraph);

        $providerMode = $this->providerAvailable() ? 'primary' : 'fallback';
        $providerReason = $providerMode === 'fallback'
            ? 'provider_unavailable'
            : 'primary_available';

        return [
            'data' => [
                'conversation_id' => (string) Str::uuid(),
                'intent' => $intent,
                'message' => $message,
                'answer' => $recommendation['answer'],
                'provider' => [
                    'mode' => $providerMode,
                    'reason' => $providerReason,
                ],
                'context_snapshot' => [
                    'schema_version' => (string) ($contextGraph['schema_version'] ?? 'unknown'),
                    'as_of' => (string) data_get($contextGraph, 'snapshot.as_of'),
                    'fingerprint' => (string) data_get($contextGraph, 'snapshot.fingerprint'),
                ],
                'explainability' => [
                    'strategy' => 'copilot-rule-based-context.v1',
                    'reason_codes' => $recommendation['reason_codes'],
                    'source_references' => $sourceReferences,
                ],
                'source_references' => $sourceReferences,
                'generated_at' => Carbon::now()->toISOString(),
            ],
        ];
    }

    private function providerAvailable(): bool
    {
        $apiKey = (string) config('services.openai.api_key', '');

        return trim($apiKey) !== '';
    }

    /**
     * @param  array<string, mixed>  $contextGraph
     * @return array{answer: string, reason_codes: list<string>}
     */
    private function buildRecommendation(string $intent, array $contextGraph): array
    {
        $overdueTasks = (int) data_get($contextGraph, 'signals.tasks.overdue', 0);
        $dueSoonTasks = (int) data_get($contextGraph, 'signals.tasks.due_in_3_days', 0);
        $upcomingEvents = (int) data_get($contextGraph, 'signals.calendar_events.upcoming_in_7_days', 0);
        $activeHabits = (int) data_get($contextGraph, 'signals.habits.active', 0);
        $activeGoals = (int) data_get($contextGraph, 'signals.goals.active', 0);
        $journalWindowEntries = (int) data_get($contextGraph, 'signals.journal_entries.entries_in_window', 0);

        $reasonCodes = [
            'context_tasks_overdue',
            'context_tasks_due_soon',
            'context_calendar_upcoming',
            'context_habits_active',
            'context_goals_active',
            'context_journal_recent',
            "intent_{$intent}",
        ];

        $summary = "You have {$overdueTasks} overdue tasks, {$dueSoonTasks} tasks due soon, and {$upcomingEvents} calendar events in the next week.";
        $focus = "Current consistency baseline: {$activeHabits} active habits, {$activeGoals} active goals, {$journalWindowEntries} recent journal entries.";
        $nextStep = match ($intent) {
            'planning' => 'Plan around your top 3 urgent tasks first, then reserve one focused block for a high-impact goal milestone.',
            'execution' => 'Start with one overdue item now, then complete one due-soon task before your next calendar event.',
            'reflection' => 'Use your latest journal trend to identify one friction point and schedule a concrete adjustment for tomorrow.',
            default => 'Use this as your baseline and choose one action for now, one for later today, and one for tomorrow morning.',
        };

        return [
            'answer' => "{$summary} {$focus} {$nextStep}",
            'reason_codes' => $reasonCodes,
        ];
    }

    private function detectIntent(string $message): string
    {
        $normalized = mb_strtolower($message);

        if ($this->containsAny($normalized, ['plan', 'schedule', 'week', 'tomorrow', 'priority'])) {
            return 'planning';
        }

        if ($this->containsAny($normalized, ['do now', 'execute', 'focus', 'next action', 'start'])) {
            return 'execution';
        }

        if ($this->containsAny($normalized, ['reflect', 'review', 'journal', 'why', 'improve'])) {
            return 'reflection';
        }

        return 'general';
    }

    /**
     * @param  array<string, mixed>  $contextGraph
     * @return list<array<string, string|null>>
     */
    private function buildSourceReferences(array $contextGraph): array
    {
        /** @var list<array<string, mixed>> $taskItems */
        $taskItems = data_get($contextGraph, 'entities.tasks', []);
        /** @var list<array<string, mixed>> $eventItems */
        $eventItems = data_get($contextGraph, 'entities.calendar_events', []);
        /** @var list<array<string, mixed>> $habitItems */
        $habitItems = data_get($contextGraph, 'entities.habits', []);
        /** @var list<array<string, mixed>> $goalItems */
        $goalItems = data_get($contextGraph, 'entities.goals', []);
        /** @var list<array<string, mixed>> $journalItems */
        $journalItems = data_get($contextGraph, 'entities.journal_entries', []);

        $references = [];

        foreach (array_slice($taskItems, 0, 2) as $item) {
            $references[] = [
                'module' => 'tasks',
                'entity_type' => 'task',
                'entity_id' => isset($item['id']) ? (string) $item['id'] : null,
                'title' => isset($item['title']) ? (string) $item['title'] : null,
            ];
        }

        foreach (array_slice($eventItems, 0, 1) as $item) {
            $references[] = [
                'module' => 'calendar',
                'entity_type' => 'calendar_event',
                'entity_id' => isset($item['id']) ? (string) $item['id'] : null,
                'title' => isset($item['title']) ? (string) $item['title'] : null,
            ];
        }

        foreach (array_slice($habitItems, 0, 1) as $item) {
            $references[] = [
                'module' => 'habits',
                'entity_type' => 'habit',
                'entity_id' => isset($item['id']) ? (string) $item['id'] : null,
                'title' => isset($item['title']) ? (string) $item['title'] : null,
            ];
        }

        foreach (array_slice($goalItems, 0, 1) as $item) {
            $references[] = [
                'module' => 'goals',
                'entity_type' => 'goal',
                'entity_id' => isset($item['id']) ? (string) $item['id'] : null,
                'title' => isset($item['title']) ? (string) $item['title'] : null,
            ];
        }

        foreach (array_slice($journalItems, 0, 1) as $item) {
            $references[] = [
                'module' => 'journal',
                'entity_type' => 'journal_entry',
                'entity_id' => isset($item['id']) ? (string) $item['id'] : null,
                'title' => isset($item['title']) ? (string) $item['title'] : null,
            ];
        }

        return $references;
    }

    /**
     * @param  list<string>  $phrases
     */
    private function containsAny(string $text, array $phrases): bool
    {
        foreach ($phrases as $phrase) {
            if (str_contains($text, $phrase)) {
                return true;
            }
        }

        return false;
    }
}
