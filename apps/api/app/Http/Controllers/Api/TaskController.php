<?php

namespace App\Http\Controllers\Api;

use App\Collaboration\Services\CollaborationAccessService;
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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

        $query = Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function (Builder $builder) use ($user, $spaceIds): void {
                $builder->where('user_id', $user->id);
                if ($spaceIds !== []) {
                    $builder->orWhereHas('list', function (Builder $listQuery) use ($spaceIds): void {
                        $listQuery->where('visibility', 'shared')
                            ->whereIn('collaboration_space_id', $spaceIds);
                    });
                }
            });

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

    public function store(Request $request): JsonResponse
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
        ]);

        $list = TaskList::query()
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
            ->findOrFail($payload['list_id']);

        $task = Task::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
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

        return response()->json(['data' => $task], 201);
    }

    public function show(Request $request, string $taskId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $task = Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function (Builder $query) use ($user, $spaceIds): void {
                $query->where('user_id', $user->id);
                if ($spaceIds !== []) {
                    $query->orWhereHas('list', function (Builder $listQuery) use ($spaceIds): void {
                        $listQuery->where('visibility', 'shared')
                            ->whereIn('collaboration_space_id', $spaceIds);
                    });
                }
            })
            ->findOrFail($taskId);

        return response()->json(['data' => $task]);
    }

    public function update(Request $request, string $taskId): JsonResponse
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
        ]);

        $task = Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function (Builder $query) use ($user, $spaceIds): void {
                $query->where('user_id', $user->id);
                if ($spaceIds !== []) {
                    $query->orWhereHas('list', function (Builder $listQuery) use ($spaceIds): void {
                        $listQuery->where('visibility', 'shared')
                            ->whereIn('collaboration_space_id', $spaceIds);
                    });
                }
            })
            ->findOrFail($taskId);

        if (array_key_exists('list_id', $payload)) {
            $list = TaskList::query()
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
                ->findOrFail($payload['list_id']);

            $payload['list_id'] = $list->id;
        }

        $task->fill($payload);
        $task->save();

        return response()->json(['data' => $task->fresh()]);
    }

    public function destroy(Request $request, string $taskId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $task = Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function (Builder $query) use ($user, $spaceIds): void {
                $query->where('user_id', $user->id);
                if ($spaceIds !== []) {
                    $query->orWhereHas('list', function (Builder $listQuery) use ($spaceIds): void {
                        $listQuery->where('visibility', 'shared')
                            ->whereIn('collaboration_space_id', $spaceIds);
                    });
                }
            })
            ->findOrFail($taskId);

        $task->delete();

        return response()->json([], 204);
    }
}
