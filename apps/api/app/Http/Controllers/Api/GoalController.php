<?php

namespace App\Http\Controllers\Api;

use App\Collaboration\Services\CollaborationAccessService;
use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'status' => ['sometimes', Rule::in(['active', 'paused', 'completed', 'archived'])],
            'q' => ['sometimes', 'string', 'max:255'],
        ]);

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $page = max((int) $request->integer('page', 1), 1);

        $goals = Goal::query()
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
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->string('status')))
            ->when($request->filled('q'), fn (Builder $query) => $query->where('title', 'like', '%'.$request->string('q').'%'))
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $goals->items(),
            'meta' => [
                'page' => $goals->currentPage(),
                'per_page' => $goals->perPage(),
                'total' => $goals->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:3000'],
            'status' => ['nullable', Rule::in(['active', 'paused', 'completed', 'archived'])],
            'target_date' => ['nullable', 'date'],
        ]);

        $goal = Goal::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'title' => $payload['title'],
            'description' => $payload['description'] ?? null,
            'status' => $payload['status'] ?? 'active',
            'visibility' => 'private',
            'collaboration_space_id' => null,
            'target_date' => $payload['target_date'] ?? null,
        ]);

        return response()->json(['data' => $goal], 201);
    }

    public function show(Request $request, string $goalId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $goal = Goal::query()
            ->with('targets')
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
            ->findOrFail($goalId);

        return response()->json(['data' => $goal]);
    }

    public function update(Request $request, string $goalId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:3000'],
            'status' => ['sometimes', Rule::in(['active', 'paused', 'completed', 'archived'])],
            'target_date' => ['sometimes', 'nullable', 'date'],
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
            ->findOrFail($goalId);

        $goal->fill($payload);
        $goal->save();

        return response()->json(['data' => $goal->fresh()]);
    }

    public function destroy(Request $request, string $goalId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = app(CollaborationAccessService::class)->memberSpaceIds($user);

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
            ->findOrFail($goalId);

        $goal->status = 'archived';
        $goal->save();
        $goal->delete();

        return response()->json([], 204);
    }
}
