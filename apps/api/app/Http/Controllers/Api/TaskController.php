<?php

namespace App\Http\Controllers\Api;

use App\Collaboration\Services\AssignmentTimelineService;
use App\Collaboration\Services\CollaborationAccessService;
use App\Http\Controllers\Controller;
use App\Models\CollaborationSpaceMember;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use App\Notifications\Services\InAppNotificationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'status' => ['sometimes', Rule::in(['todo', 'in_progress', 'done', 'canceled'])],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'list_id' => ['sometimes', 'uuid'],
            'q' => ['sometimes', 'string', 'max:255'],
            'due_from' => ['sometimes', 'date'],
            'due_to' => ['sometimes', 'date'],
            'sort' => ['sometimes', Rule::in(['created_at', '-created_at', 'due_date', '-due_date', 'priority', '-priority'])],
        ]);

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $page = max((int) $request->integer('page', 1), 1);

        $query = $this->accessibleTaskQuery($user, $spaceIds);

        $query
            ->when($request->filled('status'), fn (Builder $builder) => $builder->where('status', $request->string('status')))
            ->when($request->filled('priority'), fn (Builder $builder) => $builder->where('priority', $request->string('priority')))
            ->when($request->filled('list_id'), fn (Builder $builder) => $builder->where('list_id', $request->string('list_id')))
            ->when($request->filled('q'), fn (Builder $builder) => $builder->where('title', 'like', '%'.$request->string('q').'%'))
            ->when($request->filled('due_from'), fn (Builder $builder) => $builder->whereDate('due_date', '>=', $request->string('due_from')))
            ->when($request->filled('due_to'), fn (Builder $builder) => $builder->whereDate('due_date', '<=', $request->string('due_to')));

        $sort = (string) $request->string('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');

        $allowedSorts = ['created_at', 'due_date', 'priority'];
        if (! in_array($sortField, $allowedSorts, true)) {
            $sortField = 'created_at';
            $direction = 'desc';
        }

        $tasks = $query->orderBy($sortField, $direction)->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $tasks->items(),
            'meta' => [
                'page' => $tasks->currentPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    public function store(
        Request $request,
        AssignmentTimelineService $timeline,
        InAppNotificationService $inAppNotifications
    ): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $payload = $request->validate([
            'list_id' => ['required', 'uuid'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', Rule::in(['todo', 'in_progress', 'done', 'canceled'])],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'due_date' => ['nullable', 'date'],
            'starts_at' => ['nullable', 'date'],
            'assignee_user_id' => ['nullable', 'uuid'],
            'reminder_owner_user_id' => ['nullable', 'uuid'],
            'handoff_note' => ['nullable', 'string', 'max:500'],
        ]);

        $list = $this->findAccessibleList($user, $spaceIds, (string) $payload['list_id']);
        $this->authorize('update', $list);

        [$assigneeUserId, $reminderOwnerUserId] = $this->resolveTaskAssignmentTargets(
            $list,
            $payload['assignee_user_id'] ?? $user->id,
            $payload['reminder_owner_user_id'] ?? ($payload['assignee_user_id'] ?? $user->id)
        );

        $task = Task::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'assignee_user_id' => $assigneeUserId,
            'reminder_owner_user_id' => $reminderOwnerUserId,
            'list_id' => $list->id,
            'title' => $payload['title'],
            'description' => $payload['description'] ?? null,
            'status' => $payload['status'] ?? 'todo',
            'priority' => $payload['priority'] ?? 'medium',
            'due_date' => $payload['due_date'] ?? null,
            'starts_at' => $payload['starts_at'] ?? null,
            'source' => 'internal',
            'sort_order' => 0,
        ]);

        if ($assigneeUserId !== $user->id) {
            $timeline->record(
                tenantId: $user->tenant_id,
                entityType: 'task',
                entityId: (string) $task->id,
                action: 'assigned',
                fromUserId: $user->id,
                toUserId: $assigneeUserId,
                changedByUserId: $user->id,
                note: array_key_exists('handoff_note', $payload) ? (string) ($payload['handoff_note'] ?? '') : null,
            );

            $inAppNotifications->create(
                tenantId: $user->tenant_id,
                userId: $assigneeUserId,
                eventType: 'task_assigned',
                title: 'Task assigned',
                body: "You were assigned a task: {$task->title}",
                payload: [
                    'module' => 'tasks',
                    'entity_type' => 'task',
                    'entity_id' => (string) $task->id,
                    'deep_link' => '/tasks',
                ],
            );
        }

        if ($reminderOwnerUserId !== $assigneeUserId) {
            $timeline->record(
                tenantId: $user->tenant_id,
                entityType: 'task',
                entityId: (string) $task->id,
                action: 'reminder_owner_changed',
                fromUserId: $assigneeUserId,
                toUserId: $reminderOwnerUserId,
                changedByUserId: $user->id,
            );

            $inAppNotifications->create(
                tenantId: $user->tenant_id,
                userId: $reminderOwnerUserId,
                eventType: 'task_reminder_owner_changed',
                title: 'Task reminder ownership updated',
                body: "Reminder owner was set for task: {$task->title}",
                payload: [
                    'module' => 'tasks',
                    'entity_type' => 'task',
                    'entity_id' => (string) $task->id,
                    'deep_link' => '/tasks',
                ],
            );
        }

        return response()->json(['data' => $task], 201);
    }

    public function show(Request $request, string $taskId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $task = $this->accessibleTaskQuery($user, $spaceIds)->findOrFail($taskId);

        $this->authorize('view', $task);

        return response()->json(['data' => $task]);
    }

    public function update(
        Request $request,
        string $taskId,
        AssignmentTimelineService $timeline,
        InAppNotificationService $inAppNotifications
    ): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $payload = $request->validate([
            'list_id' => ['sometimes', 'uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'status' => ['sometimes', Rule::in(['todo', 'in_progress', 'done', 'canceled'])],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'starts_at' => ['sometimes', 'nullable', 'date'],
            'completed_at' => ['sometimes', 'nullable', 'date'],
            'assignee_user_id' => ['sometimes', 'nullable', 'uuid'],
            'reminder_owner_user_id' => ['sometimes', 'nullable', 'uuid'],
            'handoff_note' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $task = $this->accessibleTaskQuery($user, $spaceIds)->findOrFail($taskId);
        $this->authorize('update', $task);

        $effectiveList = $task->list()->first();
        if ($effectiveList === null) {
            abort(404);
        }

        if (array_key_exists('list_id', $payload)) {
            $effectiveList = $this->findAccessibleList($user, $spaceIds, (string) $payload['list_id']);
            $this->authorize('update', $effectiveList);
            $payload['list_id'] = $effectiveList->id;
        }

        $previousAssignee = $task->assignee_user_id ?? $task->user_id;
        $previousReminderOwner = $task->reminder_owner_user_id ?? $previousAssignee;
        $handoffNote = array_key_exists('handoff_note', $payload) ? (string) ($payload['handoff_note'] ?? '') : null;
        unset($payload['handoff_note']);

        if (array_key_exists('assignee_user_id', $payload) || array_key_exists('reminder_owner_user_id', $payload)) {
            $candidateAssignee = array_key_exists('assignee_user_id', $payload)
                ? $payload['assignee_user_id']
                : $previousAssignee;
            $candidateReminderOwner = array_key_exists('reminder_owner_user_id', $payload)
                ? $payload['reminder_owner_user_id']
                : $previousReminderOwner;

            [$payload['assignee_user_id'], $payload['reminder_owner_user_id']] = $this->resolveTaskAssignmentTargets(
                $effectiveList,
                $candidateAssignee,
                $candidateReminderOwner
            );
        }

        $task->fill($payload);
        $task->save();

        $currentAssignee = $task->assignee_user_id ?? $task->user_id;
        $currentReminderOwner = $task->reminder_owner_user_id ?? $currentAssignee;

        if ($previousAssignee !== $currentAssignee) {
            $action = $previousAssignee === $task->user_id ? 'assigned' : 'handoff';
            $timeline->record(
                tenantId: $user->tenant_id,
                entityType: 'task',
                entityId: (string) $task->id,
                action: $action,
                fromUserId: $previousAssignee,
                toUserId: $currentAssignee,
                changedByUserId: $user->id,
                note: $handoffNote,
            );

            $inAppNotifications->create(
                tenantId: $user->tenant_id,
                userId: $currentAssignee,
                eventType: $action === 'assigned' ? 'task_assigned' : 'task_handoff',
                title: $action === 'assigned' ? 'Task assigned' : 'Task handed off',
                body: "You are now responsible for task: {$task->title}",
                payload: [
                    'module' => 'tasks',
                    'entity_type' => 'task',
                    'entity_id' => (string) $task->id,
                    'deep_link' => '/tasks',
                ],
            );
        }

        if ($previousReminderOwner !== $currentReminderOwner) {
            $timeline->record(
                tenantId: $user->tenant_id,
                entityType: 'task',
                entityId: (string) $task->id,
                action: 'reminder_owner_changed',
                fromUserId: $previousReminderOwner,
                toUserId: $currentReminderOwner,
                changedByUserId: $user->id,
            );

            $inAppNotifications->create(
                tenantId: $user->tenant_id,
                userId: $currentReminderOwner,
                eventType: 'task_reminder_owner_changed',
                title: 'Task reminder ownership updated',
                body: "Reminder ownership changed for task: {$task->title}",
                payload: [
                    'module' => 'tasks',
                    'entity_type' => 'task',
                    'entity_id' => (string) $task->id,
                    'deep_link' => '/tasks',
                ],
            );
        }

        return response()->json(['data' => $task->fresh()]);
    }

    public function assignmentTimeline(
        Request $request,
        string $taskId,
        AssignmentTimelineService $timeline
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $task = $this->accessibleTaskQuery($user, $spaceIds)->findOrFail($taskId);
        $this->authorize('view', $task);

        $entries = $timeline->forEntity($user->tenant_id, 'task', (string) $task->id);

        return response()->json(['data' => $entries]);
    }

    public function destroy(Request $request, string $taskId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $task = $this->accessibleTaskQuery($user, $spaceIds)->findOrFail($taskId);
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json([], 204);
    }

    /**
     * @param list<string> $spaceIds
     */
    private function accessibleTaskQuery(User $user, array $spaceIds): Builder
    {
        return Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function (Builder $query) use ($user, $spaceIds): void {
                $query->where('user_id', $user->id)
                    ->orWhere('assignee_user_id', $user->id)
                    ->orWhere('reminder_owner_user_id', $user->id);

                if ($spaceIds !== []) {
                    $query->orWhereHas('list', function (Builder $listQuery) use ($spaceIds): void {
                        $listQuery->where('visibility', 'shared')
                            ->whereIn('collaboration_space_id', $spaceIds);
                    });
                }
            });
    }

    /**
     * @param list<string> $spaceIds
     */
    private function findAccessibleList(User $user, array $spaceIds, string $listId): TaskList
    {
        return TaskList::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function (Builder $query) use ($user, $spaceIds): void {
                $query->where('user_id', $user->id);
                if ($spaceIds !== []) {
                    $query->orWhere(function (Builder $shared) use ($spaceIds): void {
                        $shared->where('visibility', 'shared')
                            ->whereIn('collaboration_space_id', $spaceIds);
                    });
                }
            })
            ->findOrFail($listId);
    }

    /**
     * @return array{0:string,1:string}
     */
    private function resolveTaskAssignmentTargets(
        TaskList $list,
        ?string $assigneeUserId,
        ?string $reminderOwnerUserId
    ): array {
        $ownerUserId = (string) $list->user_id;
        $assignee = $assigneeUserId ?: $ownerUserId;
        $reminderOwner = $reminderOwnerUserId ?: $assignee;

        if ($list->visibility !== 'shared' || $list->collaboration_space_id === null) {
            if ($assignee !== $ownerUserId) {
                throw ValidationException::withMessages([
                    'assignee_user_id' => ['Private tasks can only be assigned to the owner.'],
                ]);
            }

            if ($reminderOwner !== $ownerUserId) {
                throw ValidationException::withMessages([
                    'reminder_owner_user_id' => ['Reminder owner for private tasks must be the owner.'],
                ]);
            }

            return [$ownerUserId, $ownerUserId];
        }

        $memberIds = CollaborationSpaceMember::query()
            ->where('tenant_id', $list->tenant_id)
            ->where('space_id', $list->collaboration_space_id)
            ->where('status', 'active')
            ->pluck('user_id')
            ->all();

        if (! in_array($assignee, $memberIds, true)) {
            throw ValidationException::withMessages([
                'assignee_user_id' => ['Assignee must be an active member of the collaboration space.'],
            ]);
        }

        if (! in_array($reminderOwner, $memberIds, true)) {
            throw ValidationException::withMessages([
                'reminder_owner_user_id' => ['Reminder owner must be an active member of the collaboration space.'],
            ]);
        }

        return [$assignee, $reminderOwner];
    }
}
