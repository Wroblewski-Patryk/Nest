<?php

namespace App\Http\Controllers\Api;

use App\Collaboration\Services\CollaborationAccessService;
use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Models\LifeArea;
use App\Models\TaskList;
use App\Models\Target;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

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
            'goal_id' => ['nullable', 'uuid'],
            'target_id' => ['nullable', 'uuid'],
            'life_area_id' => ['nullable', 'uuid'],
        ]);
        $payload = array_merge(
            $payload,
            $this->normalizePlanningContextReferences($user, $payload)
        );

        $list = TaskList::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'goal_id' => $payload['goal_id'],
            'target_id' => $payload['target_id'],
            'life_area_id' => $payload['life_area_id'],
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
            'goal_id' => ['sometimes', 'nullable', 'uuid'],
            'target_id' => ['sometimes', 'nullable', 'uuid'],
            'life_area_id' => ['sometimes', 'nullable', 'uuid'],
        ]);

        if (
            array_key_exists('goal_id', $payload)
            || array_key_exists('target_id', $payload)
            || array_key_exists('life_area_id', $payload)
        ) {
            $normalized = $this->normalizePlanningContextReferences($user, [
                'goal_id' => array_key_exists('goal_id', $payload) ? $payload['goal_id'] : $list->goal_id,
                'target_id' => array_key_exists('target_id', $payload) ? $payload['target_id'] : $list->target_id,
                'life_area_id' => array_key_exists('life_area_id', $payload) ? $payload['life_area_id'] : $list->life_area_id,
            ]);

            $payload['goal_id'] = $normalized['goal_id'];
            $payload['target_id'] = $normalized['target_id'];
            $payload['life_area_id'] = $normalized['life_area_id'];
        }

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

    /**
     * @param array<string, mixed> $payload
     * @return array{goal_id:?string,target_id:?string,life_area_id:?string}
     */
    private function normalizePlanningContextReferences(User $user, array $payload): array
    {
        $goalId = array_key_exists('goal_id', $payload) ? ($payload['goal_id'] ?: null) : null;
        $targetId = array_key_exists('target_id', $payload) ? ($payload['target_id'] ?: null) : null;
        $lifeAreaId = array_key_exists('life_area_id', $payload) ? ($payload['life_area_id'] ?: null) : null;

        if ($lifeAreaId !== null) {
            $lifeAreaExists = LifeArea::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('user_id', $user->id)
                ->whereKey($lifeAreaId)
                ->exists();

            if (! $lifeAreaExists) {
                throw ValidationException::withMessages([
                    'life_area_id' => ['Life area must belong to your account in current workspace.'],
                ]);
            }
        }

        if ($targetId !== null) {
            $target = Target::query()
                ->where('tenant_id', $user->tenant_id)
                ->whereKey($targetId)
                ->first();

            if ($target === null) {
                throw ValidationException::withMessages([
                    'target_id' => ['Target does not exist in current workspace.'],
                ]);
            }

            $targetGoalId = (string) $target->goal_id;
            if ($goalId !== null && $goalId !== $targetGoalId) {
                throw ValidationException::withMessages([
                    'goal_id' => ['Goal must match selected target goal ownership.'],
                ]);
            }

            $goalId = $targetGoalId;
        }

        if ($goalId !== null) {
            $goalExists = Goal::query()
                ->where('tenant_id', $user->tenant_id)
                ->whereKey($goalId)
                ->exists();

            if (! $goalExists) {
                throw ValidationException::withMessages([
                    'goal_id' => ['Goal does not exist in current workspace.'],
                ]);
            }
        }

        return [
            'goal_id' => $goalId,
            'target_id' => $targetId,
            'life_area_id' => $lifeAreaId,
        ];
    }
}
