<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\LifeArea;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class JournalEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'mood' => ['sometimes', Rule::in(['low', 'neutral', 'good', 'great'])],
            'q' => ['sometimes', 'string', 'max:255'],
        ]);

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $page = max((int) $request->integer('page', 1), 1);

        $entries = JournalEntry::query()
            ->with('lifeAreas')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->when($request->filled('mood'), fn (Builder $query) => $query->where('mood', $request->string('mood')))
            ->when($request->filled('q'), function (Builder $query) use ($request): void {
                $query->where(function (Builder $inner) use ($request): void {
                    $term = '%'.$request->string('q').'%';
                    $inner->where('title', 'like', $term)->orWhere('body', 'like', $term);
                });
            })
            ->orderByDesc('entry_date')
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $entries->items(),
            'meta' => [
                'page' => $entries->currentPage(),
                'per_page' => $entries->perPage(),
                'total' => $entries->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'mood' => ['nullable', Rule::in(['low', 'neutral', 'good', 'great'])],
            'entry_date' => ['nullable', 'date'],
            'life_area_ids' => ['nullable', 'array'],
            'life_area_ids.*' => ['uuid'],
        ]);

        $entry = DB::transaction(function () use ($payload, $user): JournalEntry {
            $entry = JournalEntry::query()->create([
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'title' => $payload['title'],
                'body' => $payload['body'],
                'mood' => $payload['mood'] ?? null,
                'entry_date' => $payload['entry_date'] ?? now()->toDateString(),
            ]);

            if (! empty($payload['life_area_ids'])) {
                $lifeAreaIds = LifeArea::query()
                    ->where('tenant_id', $user->tenant_id)
                    ->where('user_id', $user->id)
                    ->whereIn('id', $payload['life_area_ids'])
                    ->pluck('id')
                    ->all();

                $entry->lifeAreas()->syncWithPivotValues($lifeAreaIds, [
                    'tenant_id' => $user->tenant_id,
                ]);
            }

            return $entry->fresh(['lifeAreas']);
        });

        return response()->json(['data' => $entry], 201);
    }

    public function show(Request $request, string $journalEntryId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $entry = JournalEntry::query()
            ->with('lifeAreas')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($journalEntryId);

        return response()->json(['data' => $entry]);
    }

    public function update(Request $request, string $journalEntryId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string', 'max:10000'],
            'mood' => ['sometimes', 'nullable', Rule::in(['low', 'neutral', 'good', 'great'])],
            'entry_date' => ['sometimes', 'date'],
            'life_area_ids' => ['sometimes', 'array'],
            'life_area_ids.*' => ['uuid'],
        ]);

        $entry = JournalEntry::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($journalEntryId);

        $entry = DB::transaction(function () use ($entry, $payload, $user): JournalEntry {
            $entry->fill(collect($payload)->except('life_area_ids')->toArray());
            $entry->save();

            if (array_key_exists('life_area_ids', $payload)) {
                $lifeAreaIds = LifeArea::query()
                    ->where('tenant_id', $user->tenant_id)
                    ->where('user_id', $user->id)
                    ->whereIn('id', $payload['life_area_ids'])
                    ->pluck('id')
                    ->all();

                $entry->lifeAreas()->syncWithPivotValues($lifeAreaIds, [
                    'tenant_id' => $user->tenant_id,
                ]);
            }

            return $entry->fresh(['lifeAreas']);
        });

        return response()->json(['data' => $entry]);
    }

    public function destroy(Request $request, string $journalEntryId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $entry = JournalEntry::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($journalEntryId);

        $entry->delete();

        return response()->json([], 204);
    }
}
