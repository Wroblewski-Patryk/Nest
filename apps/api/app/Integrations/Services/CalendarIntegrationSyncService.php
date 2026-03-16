<?php

namespace App\Integrations\Services;

use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\CalendarEvent;
use App\Models\SyncMapping;
use App\Models\User;
use Illuminate\Support\Str;

class CalendarIntegrationSyncService
{
    /**
     * @return array{processed:int,synced:int,skipped:int,conflicts:int}
     */
    public function syncForUser(User $user, string $provider): array
    {
        $events = CalendarEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->orderBy('start_at')
            ->get();

        $processed = 0;
        $synced = 0;
        $skipped = 0;
        $conflicts = 0;

        foreach ($events as $event) {
            $processed++;

            $entityPayload = [
                'title' => $event->title,
                'description' => $event->description,
                'start_at' => $event->start_at?->toIso8601String(),
                'end_at' => $event->end_at?->toIso8601String(),
                'timezone' => $event->timezone,
                'all_day' => $event->all_day,
                'linked_entity_type' => $event->linked_entity_type,
                'linked_entity_id' => $event->linked_entity_id,
            ];

            $payload = $this->buildPayload(
                user: $user,
                provider: $provider,
                entityId: $event->id,
                entityData: $entityPayload,
            );

            if ($this->isUnchangedMapping($payload)) {
                $skipped++;

                continue;
            }

            if (($payload['conflict_fields'] ?? []) !== []) {
                $conflicts++;
            }

            $result = ProcessIntegrationSyncJob::dispatchSync($payload);
            $status = is_array($result) ? ($result['status'] ?? null) : null;

            if ($status === 'duplicate_skipped') {
                $skipped++;
            } else {
                $synced++;
            }
        }

        return [
            'processed' => $processed,
            'synced' => $synced,
            'skipped' => $skipped,
            'conflicts' => $conflicts,
        ];
    }

    /**
     * @param  array<string, mixed>  $entityData
     * @return array<string, mixed>
     */
    private function buildPayload(
        User $user,
        string $provider,
        string $entityId,
        array $entityData,
    ): array {
        $mapping = SyncMapping::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('provider', $provider)
            ->where('internal_entity_type', 'calendar_event')
            ->where('internal_entity_id', $entityId)
            ->first();

        $syncHash = hash('sha256', json_encode($entityData, JSON_THROW_ON_ERROR));
        $hasConflict = $mapping !== null
            && $mapping->sync_hash !== null
            && ! hash_equals((string) $mapping->sync_hash, $syncHash);

        return [
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'provider' => $provider,
            'internal_entity_type' => 'calendar_event',
            'internal_entity_id' => $entityId,
            'external_id' => $mapping?->external_id ?? "{$provider}:calendar_event:{$entityId}",
            'idempotency_key' => "{$provider}:calendar_event:{$entityId}:{$syncHash}",
            'entity_payload' => $entityData,
            'sync_hash' => $syncHash,
            'trace_id' => (string) Str::uuid(),
            'conflict_fields' => $hasConflict
                ? ['title', 'start_at', 'end_at', 'timezone', 'all_day']
                : [],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function isUnchangedMapping(array $payload): bool
    {
        $existing = SyncMapping::query()
            ->where('tenant_id', $payload['tenant_id'])
            ->where('provider', $payload['provider'])
            ->where('external_id', $payload['external_id'])
            ->first();

        return $existing !== null
            && $existing->sync_hash !== null
            && hash_equals((string) $existing->sync_hash, (string) $payload['sync_hash']);
    }
}
