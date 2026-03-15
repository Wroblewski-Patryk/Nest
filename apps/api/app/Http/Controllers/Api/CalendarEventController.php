<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Models\Goal;
use App\Models\Routine;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CalendarEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'start_from' => ['sometimes', 'date'],
            'start_to' => ['sometimes', 'date'],
            'linked_entity_type' => ['sometimes', Rule::in(['task', 'goal', 'routine'])],
            'all_day' => ['sometimes', 'boolean'],
        ]);

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $page = max((int) $request->integer('page', 1), 1);

        $events = CalendarEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->when($request->filled('start_from'), fn (Builder $query) => $query->where('start_at', '>=', $request->string('start_from')))
            ->when($request->filled('start_to'), fn (Builder $query) => $query->where('start_at', '<=', $request->string('start_to')))
            ->when($request->filled('linked_entity_type'), fn (Builder $query) => $query->where('linked_entity_type', $request->string('linked_entity_type')))
            ->when($request->has('all_day'), fn (Builder $query) => $query->where('all_day', $request->boolean('all_day')))
            ->orderBy('start_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'page' => $events->currentPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'all_day' => ['nullable', 'boolean'],
            'linked_entity_type' => ['nullable', Rule::in(['task', 'goal', 'routine']), 'required_with:linked_entity_id'],
            'linked_entity_id' => ['nullable', 'uuid', 'required_with:linked_entity_type'],
        ]);

        if (($payload['linked_entity_type'] ?? null) && ($payload['linked_entity_id'] ?? null)) {
            $this->assertLinkedEntityExistsForUser(
                $user,
                $payload['linked_entity_type'],
                $payload['linked_entity_id']
            );
        }

        $event = CalendarEvent::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'title' => $payload['title'],
            'description' => $payload['description'] ?? null,
            'start_at' => $payload['start_at'],
            'end_at' => $payload['end_at'],
            'timezone' => $payload['timezone'] ?? 'UTC',
            'all_day' => $payload['all_day'] ?? false,
            'source' => 'internal',
            'linked_entity_type' => $payload['linked_entity_type'] ?? null,
            'linked_entity_id' => $payload['linked_entity_id'] ?? null,
        ]);

        return response()->json(['data' => $event], 201);
    }

    public function show(Request $request, string $eventId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $event = CalendarEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($eventId);

        return response()->json(['data' => $event]);
    }

    public function update(Request $request, string $eventId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'start_at' => ['sometimes', 'date'],
            'end_at' => ['sometimes', 'date'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'all_day' => ['sometimes', 'boolean'],
            'linked_entity_type' => ['sometimes', 'nullable', Rule::in(['task', 'goal', 'routine']), 'required_with:linked_entity_id'],
            'linked_entity_id' => ['sometimes', 'nullable', 'uuid', 'required_with:linked_entity_type'],
        ]);

        $event = CalendarEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($eventId);

        $startAt = $payload['start_at'] ?? $event->start_at;
        $endAt = $payload['end_at'] ?? $event->end_at;
        if (strtotime((string) $endAt) <= strtotime((string) $startAt)) {
            return response()->json([
                'message' => 'The end_at field must be a date after start_at.',
                'errors' => ['end_at' => ['The end_at field must be a date after start_at.']],
            ], 422);
        }

        $linkedType = $payload['linked_entity_type'] ?? $event->linked_entity_type;
        $linkedId = $payload['linked_entity_id'] ?? $event->linked_entity_id;

        if ($linkedType && $linkedId) {
            $this->assertLinkedEntityExistsForUser($user, $linkedType, $linkedId);
        }

        $event->fill($payload);
        $event->save();

        return response()->json(['data' => $event->fresh()]);
    }

    public function destroy(Request $request, string $eventId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $event = CalendarEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($eventId);

        $event->delete();

        return response()->json([], 204);
    }

    private function assertLinkedEntityExistsForUser(User $user, string $type, string $id): void
    {
        $modelClass = match ($type) {
            'task' => Task::class,
            'goal' => Goal::class,
            'routine' => Routine::class,
            default => null,
        };

        if (! $modelClass) {
            throw new NotFoundHttpException;
        }

        $exists = $modelClass::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->exists();

        if (! $exists) {
            throw new NotFoundHttpException;
        }
    }
}
