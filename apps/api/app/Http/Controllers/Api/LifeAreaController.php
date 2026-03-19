<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LifeArea;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LifeAreaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'include_archived' => ['sometimes', 'boolean'],
        ]);

        $lifeAreas = LifeArea::query()
            ->when($request->boolean('include_archived'), fn (Builder $query) => $query->withTrashed())
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->when(! $request->boolean('include_archived'), function (Builder $query): void {
                $query->where('is_archived', false);
            })
            ->orderByDesc('weight')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $lifeAreas,
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
                Rule::unique('life_areas', 'name')
                    ->where('tenant_id', $user->tenant_id)
                    ->whereNull('deleted_at'),
            ],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'weight' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $lifeArea = LifeArea::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'name' => $payload['name'],
            'color' => $payload['color'] ?? '#4F46E5',
            'weight' => $payload['weight'] ?? 50,
            'is_archived' => false,
        ]);

        return response()->json(['data' => $lifeArea], 201);
    }

    public function show(Request $request, string $lifeAreaId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $lifeArea = LifeArea::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($lifeAreaId);

        return response()->json(['data' => $lifeArea]);
    }

    public function update(Request $request, string $lifeAreaId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:120',
                Rule::unique('life_areas', 'name')
                    ->where('tenant_id', $user->tenant_id)
                    ->whereNull('deleted_at')
                    ->ignore($lifeAreaId),
            ],
            'color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'weight' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'is_archived' => ['sometimes', 'boolean'],
        ]);

        $lifeArea = LifeArea::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($lifeAreaId);

        $lifeArea->fill($payload);
        $lifeArea->save();

        return response()->json(['data' => $lifeArea->fresh()]);
    }

    public function destroy(Request $request, string $lifeAreaId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $lifeArea = LifeArea::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($lifeAreaId);

        $lifeArea->is_archived = true;
        $lifeArea->save();
        $lifeArea->delete();

        return response()->json([], 204);
    }
}
