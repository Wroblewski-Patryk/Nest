<?php

namespace App\Http\Controllers\Api;

use App\Collaboration\Services\AssignmentTimelineService;
use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Models\Goal;
use App\Models\Routine;
use App\Models\Task;
use App\Models\User;
use App\Notifications\Services\InAppNotificationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
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

        $events = $this->accessibleEventQuery($user)
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

    public function store(
        Request $request,
        AssignmentTimelineService $timeline,
        InAppNotificationService $inAppNotifications
    ): JsonResponse
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
            'assignee_user_id' => ['nullable', 'uuid'],
            'reminder_owner_user_id' => ['nullable', 'uuid'],
            'handoff_note' => ['nullable', 'string', 'max:500'],
        ]);

        if (($payload['linked_entity_type'] ?? null) && ($payload['linked_entity_id'] ?? null)) {
            $this->assertLinkedEntityExistsForOwner(
                $user->tenant_id,
                $user->id,
                (string) $payload['linked_entity_type'],
                (string) $payload['linked_entity_id']
            );
        }

        [$assigneeUserId, $reminderOwnerUserId] = $this->resolveEventParticipants(
            $user,
            $payload['assignee_user_id'] ?? $user->id,
            $payload['reminder_owner_user_id'] ?? ($payload['assignee_user_id'] ?? $user->id)
        );

        $event = CalendarEvent::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'assignee_user_id' => $assigneeUserId,
            'reminder_owner_user_id' => $reminderOwnerUserId,
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

        if ($assigneeUserId !== $user->id) {
            $timeline->record(
                tenantId: $user->tenant_id,
                entityType: 'calendar_event',
                entityId: (string) $event->id,
                action: 'assigned',
                fromUserId: $user->id,
                toUserId: $assigneeUserId,
                changedByUserId: $user->id,
                note: array_key_exists('handoff_note', $payload) ? (string) ($payload['handoff_note'] ?? '') : null,
            );

            $inAppNotifications->create(
                tenantId: $user->tenant_id,
                userId: $assigneeUserId,
                eventType: 'calendar_event_assigned',
                title: 'Calendar event assigned',
                body: "You were assigned an event: {$event->title}",
                payload: [
                    'module' => 'calendar',
                    'entity_type' => 'calendar_event',
                    'entity_id' => (string) $event->id,
                    'deep_link' => '/calendar',
                ],
            );
        }

        if ($reminderOwnerUserId !== $assigneeUserId) {
            $timeline->record(
                tenantId: $user->tenant_id,
                entityType: 'calendar_event',
                entityId: (string) $event->id,
                action: 'reminder_owner_changed',
                fromUserId: $assigneeUserId,
                toUserId: $reminderOwnerUserId,
                changedByUserId: $user->id,
            );

            $inAppNotifications->create(
                tenantId: $user->tenant_id,
                userId: $reminderOwnerUserId,
                eventType: 'calendar_reminder_owner_changed',
                title: 'Calendar reminder ownership updated',
                body: "Reminder owner was set for event: {$event->title}",
                payload: [
                    'module' => 'calendar',
                    'entity_type' => 'calendar_event',
                    'entity_id' => (string) $event->id,
                    'deep_link' => '/calendar',
                ],
            );
        }

        return response()->json(['data' => $event], 201);
    }

    public function show(Request $request, string $eventId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $event = $this->accessibleEventQuery($user)->findOrFail($eventId);

        return response()->json(['data' => $event]);
    }

    public function update(
        Request $request,
        string $eventId,
        AssignmentTimelineService $timeline,
        InAppNotificationService $inAppNotifications
    ): JsonResponse
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
            'assignee_user_id' => ['sometimes', 'nullable', 'uuid'],
            'reminder_owner_user_id' => ['sometimes', 'nullable', 'uuid'],
            'handoff_note' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $event = $this->accessibleEventQuery($user)->findOrFail($eventId);

        if ($event->user_id !== $user->id && $event->assignee_user_id !== $user->id) {
            abort(403);
        }

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
            $this->assertLinkedEntityExistsForOwner($user->tenant_id, (string) $event->user_id, $linkedType, $linkedId);
        }

        $previousAssignee = $event->assignee_user_id ?? $event->user_id;
        $previousReminderOwner = $event->reminder_owner_user_id ?? $previousAssignee;
        $handoffNote = array_key_exists('handoff_note', $payload) ? (string) ($payload['handoff_note'] ?? '') : null;
        unset($payload['handoff_note']);

        if (array_key_exists('assignee_user_id', $payload) || array_key_exists('reminder_owner_user_id', $payload)) {
            $candidateAssignee = array_key_exists('assignee_user_id', $payload)
                ? $payload['assignee_user_id']
                : $previousAssignee;
            $candidateReminderOwner = array_key_exists('reminder_owner_user_id', $payload)
                ? $payload['reminder_owner_user_id']
                : $previousReminderOwner;

            [$payload['assignee_user_id'], $payload['reminder_owner_user_id']] = $this->resolveEventParticipants(
                $user,
                $candidateAssignee,
                $candidateReminderOwner
            );
        }

        $event->fill($payload);
        $event->save();

        $currentAssignee = $event->assignee_user_id ?? $event->user_id;
        $currentReminderOwner = $event->reminder_owner_user_id ?? $currentAssignee;

        if ($previousAssignee !== $currentAssignee) {
            $action = $previousAssignee === $event->user_id ? 'assigned' : 'handoff';
            $timeline->record(
                tenantId: $user->tenant_id,
                entityType: 'calendar_event',
                entityId: (string) $event->id,
                action: $action,
                fromUserId: $previousAssignee,
                toUserId: $currentAssignee,
                changedByUserId: $user->id,
                note: $handoffNote,
            );

            $inAppNotifications->create(
                tenantId: $user->tenant_id,
                userId: $currentAssignee,
                eventType: $action === 'assigned' ? 'calendar_event_assigned' : 'calendar_event_handoff',
                title: $action === 'assigned' ? 'Calendar event assigned' : 'Calendar event handed off',
                body: "You are now responsible for event: {$event->title}",
                payload: [
                    'module' => 'calendar',
                    'entity_type' => 'calendar_event',
                    'entity_id' => (string) $event->id,
                    'deep_link' => '/calendar',
                ],
            );
        }

        if ($previousReminderOwner !== $currentReminderOwner) {
            $timeline->record(
                tenantId: $user->tenant_id,
                entityType: 'calendar_event',
                entityId: (string) $event->id,
                action: 'reminder_owner_changed',
                fromUserId: $previousReminderOwner,
                toUserId: $currentReminderOwner,
                changedByUserId: $user->id,
            );

            $inAppNotifications->create(
                tenantId: $user->tenant_id,
                userId: $currentReminderOwner,
                eventType: 'calendar_reminder_owner_changed',
                title: 'Calendar reminder ownership updated',
                body: "Reminder ownership changed for event: {$event->title}",
                payload: [
                    'module' => 'calendar',
                    'entity_type' => 'calendar_event',
                    'entity_id' => (string) $event->id,
                    'deep_link' => '/calendar',
                ],
            );
        }

        return response()->json(['data' => $event->fresh()]);
    }

    public function assignmentTimeline(
        Request $request,
        string $eventId,
        AssignmentTimelineService $timeline
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $event = $this->accessibleEventQuery($user)->findOrFail($eventId);
        $entries = $timeline->forEntity($user->tenant_id, 'calendar_event', (string) $event->id);

        return response()->json(['data' => $entries]);
    }

    public function destroy(Request $request, string $eventId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $event = $this->accessibleEventQuery($user)->findOrFail($eventId);
        if ($event->user_id !== $user->id) {
            abort(403);
        }

        $event->delete();

        return response()->json([], 204);
    }

    private function assertLinkedEntityExistsForOwner(
        string $tenantId,
        string $ownerUserId,
        string $type,
        string $id
    ): void {
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
            ->where('tenant_id', $tenantId)
            ->where('user_id', $ownerUserId)
            ->where('id', $id)
            ->exists();

        if (! $exists) {
            throw new NotFoundHttpException;
        }
    }

    /**
     * @return array{0:string,1:string}
     */
    private function resolveEventParticipants(User $actor, ?string $assigneeUserId, ?string $reminderOwnerUserId): array
    {
        $assignee = $assigneeUserId ?: $actor->id;
        $reminderOwner = $reminderOwnerUserId ?: $assignee;

        $assigneeExists = User::query()
            ->where('tenant_id', $actor->tenant_id)
            ->where('id', $assignee)
            ->exists();
        if (! $assigneeExists) {
            throw ValidationException::withMessages([
                'assignee_user_id' => ['Assignee must belong to the same tenant.'],
            ]);
        }

        $reminderOwnerExists = User::query()
            ->where('tenant_id', $actor->tenant_id)
            ->where('id', $reminderOwner)
            ->exists();
        if (! $reminderOwnerExists) {
            throw ValidationException::withMessages([
                'reminder_owner_user_id' => ['Reminder owner must belong to the same tenant.'],
            ]);
        }

        return [$assignee, $reminderOwner];
    }

    private function accessibleEventQuery(User $user): Builder
    {
        return CalendarEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function (Builder $query) use ($user): void {
                $query->where('user_id', $user->id)
                    ->orWhere('assignee_user_id', $user->id)
                    ->orWhere('reminder_owner_user_id', $user->id);
            });
    }
}
