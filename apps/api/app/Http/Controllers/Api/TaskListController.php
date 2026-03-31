<?php

namespace App\Http\Controllers\Api;

use App\Collaboration\Services\CollaborationAccessService;
use App\Http\Controllers\Controller;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskListController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $page = max((int) $request->integer('page', 1), 1);

        $lists = TaskList::query()
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
            ->orderBy('position')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $lists->items(),
            'meta' => [
                'page' => $lists->currentPage(),
                'per_page' => $lists->perPage(),
                'total' => $lists->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('task_lists', 'name')
                    ->where('tenant_id', $user->tenant_id)
                    ->where('user_id', $user->id)
                    ->whereNull('deleted_at'),
            ],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);

        $list = TaskList::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'name' => $payload['name'],
            'color' => $payload['color'] ?? '#4F46E5',
            'position' => $payload['position'] ?? 0,
            'is_archived' => false,
            'visibility' => 'private',
            'collaboration_space_id' => null,
        ]);

        return response()->json(['data' => $list], 201);
    }

    public function show(Request $request, string $listId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

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
            ->findOrFail($listId);

        $this->authorize('view', $list);

        return response()->json(['data' => $list]);
    }

    public function update(Request $request, string $listId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

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
            ->findOrFail($listId);

        $this->authorize('update', $list);

        $payload = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:120',
                Rule::unique('task_lists', 'name')
                    ->where('tenant_id', $user->tenant_id)
                    ->where('user_id', $list->user_id)
                    ->whereNull('deleted_at')
                    ->ignore($list->id),
            ],
            'color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'position' => ['sometimes', 'integer', 'min:0'],
            'is_archived' => ['sometimes', 'boolean'],
        ]);

        $list->fill($payload);
        $list->save();

        return response()->json(['data' => $list->fresh()]);
    }

    public function destroy(Request $request, string $listId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

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
            ->findOrFail($listId);

        $this->authorize('delete', $list);

        $list->is_archived = true;
        $list->save();
        $list->delete();

        return response()->json([], 204);
    }
}
