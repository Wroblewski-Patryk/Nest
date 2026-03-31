<?php

namespace App\AI\Services;

use App\Models\AiBriefing;
use App\Models\AiBriefingPreference;
use App\Models\User;
use App\Notifications\Services\InAppNotificationService;
use Illuminate\Validation\ValidationException;

class AiBriefingService
{
    /**
     * @var list<string>
     */
    private const DEFAULT_SCOPE = ['tasks', 'calendar', 'habits', 'goals', 'journal'];

    /**
     * @var list<string>
     */
    private const ALLOWED_SCOPE_MODULES = ['tasks', 'calendar', 'habits', 'goals', 'journal', 'insights'];

    public function __construct(
        private readonly AiContextGraphService $contextGraphService,
        private readonly InAppNotificationService $inAppNotificationService
    ) {
    }

    public function getPreferences(User $user): AiBriefingPreference
    {
        return AiBriefingPreference::query()->firstOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
            ],
            [
                'daily_enabled' => true,
                'weekly_enabled' => true,
                'scope_modules' => self::DEFAULT_SCOPE,
                'timezone' => $user->timezone ?? 'UTC',
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updatePreferences(User $user, array $payload): AiBriefingPreference
    {
        $preferences = $this->getPreferences($user);

        if (array_key_exists('daily_enabled', $payload)) {
            $preferences->daily_enabled = (bool) $payload['daily_enabled'];
        }

        if (array_key_exists('weekly_enabled', $payload)) {
            $preferences->weekly_enabled = (bool) $payload['weekly_enabled'];
        }

        if (array_key_exists('scope_modules', $payload) && is_array($payload['scope_modules'])) {
            $preferences->scope_modules = $this->normalizeScopeModules($payload['scope_modules']);
        }

        if (array_key_exists('timezone', $payload)) {
            $preferences->timezone = (string) $payload['timezone'];
        }

        $preferences->save();

        return $preferences->fresh() ?? $preferences;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function generateBriefing(User $user, string $cadence, array $payload = []): AiBriefing
    {
        $preferences = $this->getPreferences($user);

        if ($cadence === 'daily' && ! $preferences->daily_enabled) {
            throw ValidationException::withMessages([
                'cadence' => ['Daily briefing is disabled in preferences.'],
            ]);
        }

        if ($cadence === 'weekly' && ! $preferences->weekly_enabled) {
            throw ValidationException::withMessages([
                'cadence' => ['Weekly briefing is disabled in preferences.'],
            ]);
        }

        $scopeModules = array_key_exists('scope_modules', $payload) && is_array($payload['scope_modules'])
            ? $this->normalizeScopeModules($payload['scope_modules'])
            : $this->normalizeScopeModules($preferences->scope_modules ?? self::DEFAULT_SCOPE);

        $windowDays = isset($payload['window_days'])
            ? (int) $payload['window_days']
            : ($cadence === 'daily' ? 2 : 7);

        $contextOptions = [
            'window_days' => $windowDays,
            'entity_limit' => 20,
        ];
        if (isset($payload['as_of'])) {
            $contextOptions['as_of'] = (string) $payload['as_of'];
        }

        $context = $this->contextGraphService->buildForUser($user, $contextOptions);

        /** @var array<string, mixed> $graph */
        $graph = $context['data'];
        $content = $this->composeBriefingContent($cadence, $scopeModules, $graph);

        $briefing = AiBriefing::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'cadence' => $cadence,
            'scope_modules' => $scopeModules,
            'summary' => $content['summary'],
            'sections' => $content['sections'],
            'context_fingerprint' => (string) data_get($graph, 'snapshot.fingerprint'),
            'generated_at' => now(),
        ]);

        $title = $cadence === 'daily' ? 'Daily briefing is ready' : 'Weekly briefing is ready';
        $this->inAppNotificationService->create(
            tenantId: $user->tenant_id,
            userId: (string) $user->id,
            eventType: 'ai_briefing_generated',
            title: $title,
            body: 'Open insights to review your latest AI briefing summary.',
            payload: [
                'module' => 'insights',
                'entity_type' => 'ai_briefing',
                'entity_id' => (string) $briefing->id,
                'briefing_id' => (string) $briefing->id,
                'cadence' => $cadence,
                'deep_link' => '/insights',
            ]
        );

        return $briefing->fresh() ?? $briefing;
    }

    /**
     * @param  array<int, mixed>  $modules
     * @return list<string>
     */
    private function normalizeScopeModules(array $modules): array
    {
        $normalized = collect($modules)
            ->map(fn (mixed $value): string => strtolower(trim((string) $value)))
            ->filter(fn (string $module): bool => in_array($module, self::ALLOWED_SCOPE_MODULES, true))
            ->values()
            ->all();

        if ($normalized === []) {
            return self::DEFAULT_SCOPE;
        }

        return array_values(array_unique($normalized));
    }

    /**
     * @param  list<string>  $scopeModules
     * @param  array<string, mixed>  $graph
     * @return array{summary: string, sections: list<array<string, mixed>>}
     */
    private function composeBriefingContent(string $cadence, array $scopeModules, array $graph): array
    {
        $taskOverdue = (int) data_get($graph, 'signals.tasks.overdue', 0);
        $taskDueSoon = (int) data_get($graph, 'signals.tasks.due_in_3_days', 0);
        $upcomingEvents = (int) data_get($graph, 'signals.calendar_events.upcoming_in_7_days', 0);
        $habitActive = (int) data_get($graph, 'signals.habits.active', 0);
        $goalActive = (int) data_get($graph, 'signals.goals.active', 0);
        $journalRecent = (int) data_get($graph, 'signals.journal_entries.entries_in_window', 0);

        $summary = $cadence === 'daily'
            ? "Today: {$taskOverdue} overdue tasks, {$taskDueSoon} due soon, {$upcomingEvents} upcoming events."
            : "This week: {$taskOverdue} overdue tasks, {$upcomingEvents} upcoming events, {$goalActive} active goals.";

        $sections = [
            [
                'title' => 'Planning Focus',
                'items' => [
                    "Overdue tasks: {$taskOverdue}",
                    "Due soon tasks: {$taskDueSoon}",
                    "Upcoming events: {$upcomingEvents}",
                ],
            ],
            [
                'title' => 'Consistency Signals',
                'items' => [
                    "Active habits: {$habitActive}",
                    "Active goals: {$goalActive}",
                    "Recent journal entries: {$journalRecent}",
                ],
            ],
            [
                'title' => 'Scope Modules',
                'items' => $scopeModules,
            ],
        ];

        return [
            'summary' => $summary,
            'sections' => $sections,
        ];
    }
}
