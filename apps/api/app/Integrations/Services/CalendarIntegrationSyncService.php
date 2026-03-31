<?php

namespace App\Integrations\Services;

use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\CalendarEvent;
use App\Models\SyncMapping;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

class CalendarIntegrationSyncService
{
    private const CHUNK_SIZE = 100;

    /**
     * @return array{
     *   processed:int,
     *   enqueued:int,
     *   skipped:int,
     *   conflicts:int,
     *   sync_request_id:string,
     *   job_references:array<int, array{job_reference:string,queue_job_id:mixed,internal_entity_type:string,internal_entity_id:string}>
     * }
     */
    public function syncForUser(
        User $user,
        string $provider,
        ?string $syncRequestId = null,
        array $actorContext = []
    ): array
    {
        $syncRequestId ??= (string) Str::ulid();

        $processed = 0;
        $enqueued = 0;
        $skipped = 0;
        $conflicts = 0;
        $jobReferences = [];

        CalendarEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->chunkById(self::CHUNK_SIZE, function ($events) use (
                $user,
                $provider,
                $syncRequestId,
                $actorContext,
                &$processed,
                &$skipped,
                &$conflicts,
                &$enqueued,
                &$jobReferences
            ): void {
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
                        syncRequestId: $syncRequestId,
                        actorContext: $actorContext,
                        entityData: $entityPayload,
                    );

                    if ($this->isUnchangedMapping($payload)) {
                        $skipped++;

                        continue;
                    }

                    if (($payload['conflict_fields'] ?? []) !== []) {
                        $conflicts++;
                    }

                    $queueJobId = $this->enqueueSync($payload);
                    $enqueued++;
                    $jobReferences[] = [
                        'job_reference' => (string) $payload['job_reference'],
                        'queue_job_id' => $queueJobId,
                        'internal_entity_type' => 'calendar_event',
                        'internal_entity_id' => $event->id,
                    ];
                }
            });

        return [
            'processed' => $processed,
            'enqueued' => $enqueued,
            'skipped' => $skipped,
            'conflicts' => $conflicts,
            'sync_request_id' => $syncRequestId,
            'job_references' => $jobReferences,
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
        string $syncRequestId,
        array $actorContext,
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
            'sync_request_id' => $syncRequestId,
            'job_reference' => (string) Str::ulid(),
            'trace_id' => (string) Str::uuid(),
            'actor_context' => $actorContext,
            'conflict_fields' => $hasConflict
                ? ['title', 'start_at', 'end_at', 'timezone', 'all_day']
                : [],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function enqueueSync(array $payload): mixed
    {
        return Queue::connection('database')->pushOn(
            'integrations',
            new ProcessIntegrationSyncJob($payload)
        );
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
