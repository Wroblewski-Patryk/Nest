<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Routine;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoutineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'q' => ['sometimes', 'string', 'max:255'],
        ]);

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $page = max((int) $request->integer('page', 1), 1);

        $routines = Routine::query()
            ->with('steps')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->when($request->has('is_active'), function (Builder $query) use ($request): void {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->when($request->filled('q'), function (Builder $query) use ($request): void {
                $query->where('title', 'like', '%'.$request->string('q').'%');
            })
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $routines->items(),
            'meta' => [
                'page' => $routines->currentPage(),
                'per_page' => $routines->perPage(),
                'total' => $routines->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['nullable', 'boolean'],
            'steps' => ['required', 'array', 'min:1'],
            'steps.*.title' => ['required', 'string', 'max:255'],
            'steps.*.details' => ['nullable', 'string', 'max:2000'],
            'steps.*.duration_minutes' => ['nullable', 'integer', 'min:0'],
        ]);

        $routine = DB::transaction(function () use ($payload, $user): Routine {
            $routine = Routine::query()->create([
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'title' => $payload['title'],
                'description' => $payload['description'] ?? null,
                'is_active' => $payload['is_active'] ?? true,
            ]);

            foreach (array_values($payload['steps']) as $index => $step) {
                $routine->steps()->create([
                    'tenant_id' => $user->tenant_id,
                    'step_order' => $index + 1,
                    'title' => $step['title'],
                    'details' => $step['details'] ?? null,
                    'duration_minutes' => $step['duration_minutes'] ?? null,
                ]);
            }

            return $routine->fresh(['steps']);
        });

        return response()->json(['data' => $routine], 201);
    }

    public function show(Request $request, string $routineId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $routine = Routine::query()
            ->with('steps')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($routineId);

        return response()->json(['data' => $routine]);
    }

    public function update(Request $request, string $routineId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
            'steps' => ['sometimes', 'array', 'min:1'],
            'steps.*.title' => ['required_with:steps', 'string', 'max:255'],
            'steps.*.details' => ['nullable', 'string', 'max:2000'],
            'steps.*.duration_minutes' => ['nullable', 'integer', 'min:0'],
        ]);

        $routine = Routine::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($routineId);

        $routine = DB::transaction(function () use ($payload, $routine, $user): Routine {
            $routine->fill(collect($payload)->except('steps')->toArray());
            $routine->save();

            if (array_key_exists('steps', $payload)) {
                $routine->steps()->delete();

                foreach (array_values($payload['steps']) as $index => $step) {
                    $routine->steps()->create([
                        'tenant_id' => $user->tenant_id,
                        'step_order' => $index + 1,
                        'title' => $step['title'],
                        'details' => $step['details'] ?? null,
                        'duration_minutes' => $step['duration_minutes'] ?? null,
                    ]);
                }
            }

            return $routine->fresh(['steps']);
        });

        return response()->json(['data' => $routine]);
    }

    public function destroy(Request $request, string $routineId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $routine = Routine::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($routineId);

        $routine->is_active = false;
        $routine->save();
        $routine->delete();

        return response()->json([], 204);
    }
}
