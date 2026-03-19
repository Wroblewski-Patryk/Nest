<?php

namespace App\Http\Controllers\Api;

use App\Collaboration\Services\CollaborationAccessService;
use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Models\Target;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TargetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'goal_id' => ['sometimes', 'uuid'],
            'status' => ['sometimes', Rule::in(['active', 'paused', 'completed', 'archived'])],
        ]);

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $page = max((int) $request->integer('page', 1), 1);

        $targets = Target::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereHas('goal', function (Builder $query) use ($user, $spaceIds): void {
                $query->where('tenant_id', $user->tenant_id)
                    ->where(function (Builder $goalQuery) use ($user, $spaceIds): void {
                        $goalQuery->where('user_id', $user->id);
                        if ($spaceIds !== []) {
                            $goalQuery->orWhere(function (Builder $shared) use ($spaceIds): void {
                                $shared->where('visibility', 'shared')
                                    ->whereIn('collaboration_space_id', $spaceIds);
                            });
                        }
                    });
            })
            ->when($request->filled('goal_id'), fn (Builder $query) => $query->where('goal_id', $request->string('goal_id')))
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->string('status')))
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $targets->items(),
            'meta' => [
                'page' => $targets->currentPage(),
                'per_page' => $targets->perPage(),
                'total' => $targets->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $payload = $request->validate([
            'goal_id' => ['required', 'uuid'],
            'title' => ['required', 'string', 'max:255'],
            'metric_type' => ['required', 'string', 'max:64'],
            'value_target' => ['required', 'numeric'],
            'value_current' => ['nullable', 'numeric'],
            'unit' => ['nullable', 'string', 'max:32'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in(['active', 'paused', 'completed', 'archived'])],
        ]);

        $goal = Goal::query()
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
            ->findOrFail($payload['goal_id']);

        $target = Target::query()->create([
            'tenant_id' => $user->tenant_id,
            'goal_id' => $goal->id,
            'title' => $payload['title'],
            'metric_type' => $payload['metric_type'],
            'value_target' => $payload['value_target'],
            'value_current' => $payload['value_current'] ?? 0,
            'unit' => $payload['unit'] ?? null,
            'due_date' => $payload['due_date'] ?? null,
            'status' => $payload['status'] ?? 'active',
        ]);

        return response()->json(['data' => $target], 201);
    }

    public function show(Request $request, string $targetId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $target = Target::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereHas('goal', function (Builder $query) use ($user, $spaceIds): void {
                $query->where('tenant_id', $user->tenant_id)
                    ->where(function (Builder $goalQuery) use ($user, $spaceIds): void {
                        $goalQuery->where('user_id', $user->id);
                        if ($spaceIds !== []) {
                            $goalQuery->orWhere(function (Builder $shared) use ($spaceIds): void {
                                $shared->where('visibility', 'shared')
                                    ->whereIn('collaboration_space_id', $spaceIds);
                            });
                        }
                    });
            })
            ->findOrFail($targetId);

        return response()->json(['data' => $target]);
    }

    public function update(Request $request, string $targetId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'metric_type' => ['sometimes', 'string', 'max:64'],
            'value_target' => ['sometimes', 'numeric'],
            'value_current' => ['sometimes', 'numeric'],
            'unit' => ['sometimes', 'nullable', 'string', 'max:32'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', Rule::in(['active', 'paused', 'completed', 'archived'])],
        ]);

        $target = Target::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereHas('goal', function (Builder $query) use ($user, $spaceIds): void {
                $query->where('tenant_id', $user->tenant_id)
                    ->where(function (Builder $goalQuery) use ($user, $spaceIds): void {
                        $goalQuery->where('user_id', $user->id);
                        if ($spaceIds !== []) {
                            $goalQuery->orWhere(function (Builder $shared) use ($spaceIds): void {
                                $shared->where('visibility', 'shared')
                                    ->whereIn('collaboration_space_id', $spaceIds);
                            });
                        }
                    });
            })
            ->findOrFail($targetId);

        $target->fill($payload);
        $target->save();

        return response()->json(['data' => $target->fresh()]);
    }

    public function destroy(Request $request, string $targetId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $target = Target::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereHas('goal', function (Builder $query) use ($user, $spaceIds): void {
                $query->where('tenant_id', $user->tenant_id)
                    ->where(function (Builder $goalQuery) use ($user, $spaceIds): void {
                        $goalQuery->where('user_id', $user->id);
                        if ($spaceIds !== []) {
                            $goalQuery->orWhere(function (Builder $shared) use ($spaceIds): void {
                                $shared->where('visibility', 'shared')
                                    ->whereIn('collaboration_space_id', $spaceIds);
                            });
                        }
                    });
            })
            ->findOrFail($targetId);

        $target->status = 'archived';
        $target->save();
        $target->delete();

        return response()->json([], 204);
    }
}
