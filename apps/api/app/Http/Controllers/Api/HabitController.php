<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HabitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authorize('viewAny', Habit::class);

        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'q' => ['sometimes', 'string', 'max:255'],
        ]);

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $page = max((int) $request->integer('page', 1), 1);

        $habits = $this->accessibleHabitQuery($user)
            ->when($request->has('is_active'), function (Builder $query) use ($request): void {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->when($request->filled('q'), function (Builder $query) use ($request): void {
                $query->where('title', 'like', '%'.$request->string('q').'%');
            })
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $habits->items(),
            'meta' => [
                'page' => $habits->currentPage(),
                'per_page' => $habits->perPage(),
                'total' => $habits->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authorize('create', Habit::class);

        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['required', Rule::in(['boolean', 'numeric', 'duration'])],
            'cadence' => ['required', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $habit = Habit::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'title' => $payload['title'],
            'description' => $payload['description'] ?? null,
            'type' => $payload['type'],
            'cadence' => $payload['cadence'],
            'is_active' => $payload['is_active'] ?? true,
        ]);

        return response()->json(['data' => $habit], 201);
    }

    public function show(Request $request, string $habitId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $habit = $this->accessibleHabitQuery($user)->findOrFail($habitId);
        $this->authorize('view', $habit);

        return response()->json(['data' => $habit]);
    }

    public function update(Request $request, string $habitId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'type' => ['sometimes', Rule::in(['boolean', 'numeric', 'duration'])],
            'cadence' => ['sometimes', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $habit = $this->accessibleHabitQuery($user)->findOrFail($habitId);
        $this->authorize('update', $habit);

        $habit->fill($payload);
        $habit->save();

        return response()->json(['data' => $habit->fresh()]);
    }

    public function destroy(Request $request, string $habitId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $habit = $this->accessibleHabitQuery($user)->findOrFail($habitId);
        $this->authorize('delete', $habit);

        $habit->is_active = false;
        $habit->save();
        $habit->delete();

        return response()->json([], 204);
    }

    public function log(Request $request, string $habitId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'logged_at' => ['required', 'date'],
            'value_numeric' => ['nullable', 'numeric'],
            'value_seconds' => ['nullable', 'integer', 'min:0'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $habit = $this->accessibleHabitQuery($user)->findOrFail($habitId);
        $this->authorize('log', $habit);

        $log = HabitLog::query()->updateOrCreate(
            [
                'habit_id' => $habit->id,
                'logged_at' => $payload['logged_at'],
            ],
            [
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'value_numeric' => $payload['value_numeric'] ?? null,
                'value_seconds' => $payload['value_seconds'] ?? null,
                'note' => $payload['note'] ?? null,
            ]
        );

        return response()->json(['data' => $log], 201);
    }

    /**
     * @return Builder<Habit>
     */
    private function accessibleHabitQuery(User $user): Builder
    {
        return Habit::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id);
    }
}
