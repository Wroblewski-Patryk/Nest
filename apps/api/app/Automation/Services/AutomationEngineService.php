<?php

namespace App\Automation\Services;

use App\Models\AutomationRule;
use App\Models\AutomationRun;
use App\Models\CalendarEvent;
use App\Models\HabitLog;
use App\Models\JournalEntry;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AutomationEngineService
{
    /**
     * @param  array<string, mixed>  $triggerPayload
     */
    public function executeRule(AutomationRule $rule, User $user, array $triggerPayload = []): AutomationRun
    {
        $run = AutomationRun::query()->create([
            'tenant_id' => $rule->tenant_id,
            'user_id' => $rule->user_id,
            'rule_id' => $rule->id,
            'status' => 'running',
            'trigger_payload' => $triggerPayload,
            'started_at' => Carbon::now(),
        ]);

        if ($rule->status !== 'active') {
            return $this->finishRun($run, 'skipped', [], 'rule_paused', 'Automation rule is paused.');
        }

        if (! $this->conditionsPass($rule->conditions ?? [], $triggerPayload)) {
            return $this->finishRun($run, 'skipped', [], 'conditions_not_met', 'Rule conditions not met.');
        }

        $actionResults = [];
        $errorCode = null;
        $errorMessage = null;
        $status = 'success';

        DB::beginTransaction();

        try {
            foreach (($rule->actions ?? []) as $index => $action) {
                $actionType = (string) ($action['type'] ?? '');
                /** @var array<string, mixed> $payload */
                $payload = $this->interpolatePayload($action['payload'] ?? [], $triggerPayload);
                $result = $this->executeAction($rule, $user, $actionType, $payload);
                $actionResults[] = [
                    'index' => $index,
                    'type' => $actionType,
                    'status' => 'success',
                    'details' => $result,
                ];
            }

            DB::commit();
        } catch (\Throwable $exception) {
            DB::rollBack();
            $status = 'failed';
            $errorCode = 'action_failed';
            $errorMessage = $exception->getMessage();
            $actionResults[] = [
                'status' => 'failed',
                'error' => $errorMessage,
            ];
        }

        return $this->finishRun($run, $status, $actionResults, $errorCode, $errorMessage);
    }

    /**
     * @param  array<int, array<string, mixed>>  $conditions
     * @param  array<string, mixed>  $triggerPayload
     */
    private function conditionsPass(array $conditions, array $triggerPayload): bool
    {
        foreach ($conditions as $condition) {
            $field = (string) ($condition['field'] ?? '');
            $operator = (string) ($condition['operator'] ?? 'equals');
            $expected = $condition['value'] ?? null;
            $actual = data_get($triggerPayload, $field);

            $matches = match ($operator) {
                'equals' => $actual === $expected,
                'not_equals' => $actual !== $expected,
                'contains' => is_string($actual) && is_string($expected) && str_contains($actual, $expected),
                'greater_than' => is_numeric($actual) && is_numeric($expected) && $actual > $expected,
                'less_than' => is_numeric($actual) && is_numeric($expected) && $actual < $expected,
                'in' => is_array($expected) && in_array($actual, $expected, true),
                default => false,
            };

            if (! $matches) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $triggerPayload
     * @return array<string, mixed>
     */
    private function interpolatePayload(array $payload, array $triggerPayload): array
    {
        $replaceTokens = function ($value) use (&$replaceTokens, $triggerPayload) {
            if (is_array($value)) {
                return array_map($replaceTokens, $value);
            }

            if (! is_string($value)) {
                return $value;
            }

            return preg_replace_callback('/\{\{([^}]+)\}\}/', function (array $matches) use ($triggerPayload): string {
                $path = trim($matches[1] ?? '');
                $resolved = data_get($triggerPayload, $path);

                return is_scalar($resolved) ? (string) $resolved : '';
            }, $value) ?? $value;
        };

        return array_map($replaceTokens, $payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function executeAction(AutomationRule $rule, User $user, string $actionType, array $payload): array
    {
        return match ($actionType) {
            'create_task' => $this->createTaskAction($rule, $user, $payload),
            'update_task' => $this->updateTaskAction($rule, $user, $payload),
            'schedule_event' => $this->scheduleEventAction($rule, $user, $payload),
            'log_habit' => $this->logHabitAction($rule, $user, $payload),
            'create_journal_entry' => $this->createJournalEntryAction($rule, $user, $payload),
            'send_notification' => [
                'simulated' => true,
                'channel' => (string) ($payload['channel'] ?? 'in_app'),
                'message' => (string) ($payload['message'] ?? ''),
            ],
            default => throw new RuntimeException("Unsupported automation action type [{$actionType}]."),
        };
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function createTaskAction(AutomationRule $rule, User $user, array $payload): array
    {
        $listId = (string) ($payload['list_id'] ?? '');
        $title = trim((string) ($payload['title'] ?? ''));
        if ($listId === '' || $title === '') {
            throw new RuntimeException('create_task requires list_id and title.');
        }

        $task = Task::query()->create([
            'tenant_id' => $rule->tenant_id,
            'user_id' => $rule->user_id,
            'list_id' => $listId,
            'title' => $title,
            'description' => $payload['description'] ?? null,
            'status' => 'todo',
            'priority' => $payload['priority'] ?? 'medium',
            'due_date' => $payload['due_date'] ?? null,
            'source' => 'automation',
            'sort_order' => 0,
        ]);

        return ['task_id' => $task->id];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function updateTaskAction(AutomationRule $rule, User $user, array $payload): array
    {
        $taskId = (string) ($payload['task_id'] ?? '');
        if ($taskId === '') {
            throw new RuntimeException('update_task requires task_id.');
        }

        $task = Task::query()
            ->where('tenant_id', $rule->tenant_id)
            ->where('user_id', $rule->user_id)
            ->findOrFail($taskId);

        $task->fill(array_filter([
            'title' => $payload['title'] ?? null,
            'description' => $payload['description'] ?? null,
            'priority' => $payload['priority'] ?? null,
            'status' => $payload['status'] ?? null,
            'due_date' => $payload['due_date'] ?? null,
        ], fn ($value) => $value !== null));
        $task->save();

        return ['task_id' => $task->id];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function scheduleEventAction(AutomationRule $rule, User $user, array $payload): array
    {
        $startAt = Carbon::parse($payload['start_at'] ?? Carbon::now());
        $endAt = Carbon::parse($payload['end_at'] ?? $startAt->copy()->addHour());

        $event = CalendarEvent::query()->create([
            'tenant_id' => $rule->tenant_id,
            'user_id' => $rule->user_id,
            'title' => (string) ($payload['title'] ?? 'Automation event'),
            'description' => $payload['description'] ?? null,
            'start_at' => $startAt,
            'end_at' => $endAt,
            'timezone' => (string) ($payload['timezone'] ?? 'UTC'),
            'all_day' => (bool) ($payload['all_day'] ?? false),
            'source' => 'automation',
        ]);

        return ['calendar_event_id' => $event->id];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function logHabitAction(AutomationRule $rule, User $user, array $payload): array
    {
        $habitId = (string) ($payload['habit_id'] ?? '');
        if ($habitId === '') {
            throw new RuntimeException('log_habit requires habit_id.');
        }

        $log = HabitLog::query()->create([
            'tenant_id' => $rule->tenant_id,
            'user_id' => $rule->user_id,
            'habit_id' => $habitId,
            'logged_at' => Carbon::parse($payload['logged_at'] ?? Carbon::now()),
            'value_numeric' => $payload['value_numeric'] ?? null,
            'value_seconds' => $payload['value_seconds'] ?? null,
            'note' => $payload['note'] ?? null,
        ]);

        return ['habit_log_id' => $log->id];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function createJournalEntryAction(AutomationRule $rule, User $user, array $payload): array
    {
        $title = trim((string) ($payload['title'] ?? 'Automation note'));
        $body = trim((string) ($payload['body'] ?? 'Generated by automation.'));

        $entry = JournalEntry::query()->create([
            'tenant_id' => $rule->tenant_id,
            'user_id' => $rule->user_id,
            'title' => $title,
            'body' => $body,
            'mood' => $payload['mood'] ?? null,
            'entry_date' => Carbon::parse($payload['entry_date'] ?? Carbon::today())->toDateString(),
        ]);

        return ['journal_entry_id' => $entry->id];
    }

    /**
     * @param  list<array<string, mixed>>  $actionResults
     */
    private function finishRun(
        AutomationRun $run,
        string $status,
        array $actionResults,
        ?string $errorCode,
        ?string $errorMessage
    ): AutomationRun {
        $run->update([
            'status' => $status,
            'action_results' => $actionResults,
            'error_code' => $errorCode,
            'error_message' => $errorMessage,
            'finished_at' => Carbon::now(),
        ]);

        return $run->fresh() ?? $run;
    }
}
