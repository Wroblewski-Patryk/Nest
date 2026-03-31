<?php

namespace App\AI\Services;

use App\Models\AiActionProposal;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class AiActionProposalService
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function propose(User $user, string $actionType, array $payload, ?string $note = null): AiActionProposal
    {
        $normalizedPayload = match ($actionType) {
            'create_task' => $this->normalizeCreateTaskPayload($user, $payload),
            'update_task_status' => $this->normalizeUpdateTaskStatusPayload($user, $payload),
            default => throw ValidationException::withMessages([
                'action_type' => ['Unsupported AI action type.'],
            ]),
        };

        return AiActionProposal::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'action_type' => $actionType,
            'proposal_payload' => $normalizedPayload,
            'requires_approval' => true,
            'status' => 'pending',
            'note' => $note,
        ]);
    }

    public function approve(User $approver, AiActionProposal $proposal): AiActionProposal
    {
        if ($proposal->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Only pending proposals can be approved.'],
            ]);
        }

        $proposal->approved_by_user_id = $approver->id;
        $proposal->approved_at = now();
        $proposal->status = 'approved';
        $proposal->save();

        try {
            $executionResult = $this->executeProposal($proposal);
            $proposal->status = 'executed';
            $proposal->executed_at = now();
            $proposal->execution_result = $executionResult;
            $proposal->failure_reason = null;
            $proposal->save();
        } catch (\Throwable $exception) {
            $proposal->status = 'failed';
            $proposal->failure_reason = $exception->getMessage();
            $proposal->save();

            throw ValidationException::withMessages([
                'execution' => [$exception->getMessage()],
            ]);
        }

        return $proposal->fresh() ?? $proposal;
    }

    public function reject(AiActionProposal $proposal, ?string $reason = null): AiActionProposal
    {
        if ($proposal->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Only pending proposals can be rejected.'],
            ]);
        }

        $proposal->status = 'rejected';
        $proposal->rejection_reason = $reason;
        $proposal->rejected_at = now();
        $proposal->save();

        return $proposal->fresh() ?? $proposal;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeCreateTaskPayload(User $user, array $payload): array
    {
        $validator = Validator::make($payload, [
            'title' => ['required', 'string', 'max:255'],
            'list_id' => ['required', 'string', 'uuid'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high,urgent'],
            'due_date' => ['sometimes', 'date'],
            'description' => ['sometimes', 'string', 'max:2000'],
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        /** @var array<string, mixed> $validated */
        $validated = $validator->validated();
        $list = TaskList::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->find($validated['list_id']);

        if (! $list) {
            throw ValidationException::withMessages([
                'proposal_payload.list_id' => ['The selected list_id is invalid.'],
            ]);
        }

        return [
            'title' => (string) $validated['title'],
            'list_id' => (string) $validated['list_id'],
            'priority' => (string) ($validated['priority'] ?? 'medium'),
            'due_date' => isset($validated['due_date']) ? Carbon::parse((string) $validated['due_date'])->toDateString() : null,
            'description' => isset($validated['description']) ? (string) $validated['description'] : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeUpdateTaskStatusPayload(User $user, array $payload): array
    {
        $validator = Validator::make($payload, [
            'task_id' => ['required', 'string', 'uuid'],
            'status' => ['required', 'string', 'in:todo,in_progress,done,canceled'],
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        /** @var array<string, mixed> $validated */
        $validated = $validator->validated();
        $task = Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->find($validated['task_id']);

        if (! $task) {
            throw ValidationException::withMessages([
                'proposal_payload.task_id' => ['The selected task_id is invalid.'],
            ]);
        }

        return [
            'task_id' => (string) $validated['task_id'],
            'status' => (string) $validated['status'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function executeProposal(AiActionProposal $proposal): array
    {
        /** @var array<string, mixed> $payload */
        $payload = $proposal->proposal_payload ?? [];

        if ($proposal->action_type === 'create_task') {
            $task = Task::query()->create([
                'tenant_id' => $proposal->tenant_id,
                'user_id' => $proposal->user_id,
                'list_id' => (string) $payload['list_id'],
                'title' => (string) $payload['title'],
                'description' => $payload['description'] ?? null,
                'priority' => (string) ($payload['priority'] ?? 'medium'),
                'status' => 'todo',
                'due_date' => $payload['due_date'] ?? null,
                'source' => 'ai_copilot',
            ]);

            return [
                'entity_type' => 'task',
                'entity_id' => (string) $task->id,
                'action' => 'created',
                'status' => (string) $task->status,
                'title' => (string) $task->title,
            ];
        }

        if ($proposal->action_type === 'update_task_status') {
            $task = Task::query()
                ->where('tenant_id', $proposal->tenant_id)
                ->where('user_id', $proposal->user_id)
                ->findOrFail((string) $payload['task_id']);

            $nextStatus = (string) $payload['status'];
            $task->status = $nextStatus;
            $task->completed_at = $nextStatus === 'done' ? now() : null;
            $task->save();

            return [
                'entity_type' => 'task',
                'entity_id' => (string) $task->id,
                'action' => 'updated',
                'status' => (string) $task->status,
                'title' => (string) $task->title,
            ];
        }

        throw ValidationException::withMessages([
            'action_type' => ['Unsupported AI action type.'],
        ]);
    }
}
