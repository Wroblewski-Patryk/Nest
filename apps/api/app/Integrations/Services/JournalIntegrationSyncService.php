<?php

namespace App\Integrations\Services;

use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\JournalEntry;
use App\Models\SyncMapping;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

class JournalIntegrationSyncService
{
    /**
     * @return array{
     *   processed:int,
     *   enqueued:int,
     *   skipped:int,
     *   sync_request_id:string,
     *   job_references:array<int, array{job_reference:string,queue_job_id:mixed,internal_entity_type:string,internal_entity_id:string}>
     * }
     */
    public function syncForUser(User $user, string $provider, ?string $syncRequestId = null): array
    {
        $syncRequestId ??= (string) Str::ulid();

        $entries = JournalEntry::query()
            ->with('lifeAreas:id,name')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->orderByDesc('entry_date')
            ->get();

        $processed = 0;
        $enqueued = 0;
        $skipped = 0;
        $jobReferences = [];

        foreach ($entries as $entry) {
            $processed++;

            $entityPayload = [
                'title' => $entry->title,
                'body' => $entry->body,
                'mood' => $entry->mood,
                'entry_date' => $entry->entry_date?->toDateString(),
                'life_areas' => $entry->lifeAreas->pluck('name')->values()->all(),
            ];

            $payload = $this->buildPayload(
                user: $user,
                provider: $provider,
                entityId: $entry->id,
                syncRequestId: $syncRequestId,
                entityData: $entityPayload,
            );

            if ($this->isUnchangedMapping($payload)) {
                $skipped++;

                continue;
            }

            $queueJobId = $this->enqueueSync($payload);
            $enqueued++;
            $jobReferences[] = [
                'job_reference' => (string) $payload['job_reference'],
                'queue_job_id' => $queueJobId,
                'internal_entity_type' => 'journal_entry',
                'internal_entity_id' => $entry->id,
            ];
        }

        return [
            'processed' => $processed,
            'enqueued' => $enqueued,
            'skipped' => $skipped,
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
        array $entityData,
    ): array {
        $mapping = SyncMapping::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('provider', $provider)
            ->where('internal_entity_type', 'journal_entry')
            ->where('internal_entity_id', $entityId)
            ->first();

        return [
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'provider' => $provider,
            'internal_entity_type' => 'journal_entry',
            'internal_entity_id' => $entityId,
            'external_id' => $mapping?->external_id ?? "{$provider}:journal_entry:{$entityId}",
            'idempotency_key' => "{$provider}:journal_entry:{$entityId}",
            'entity_payload' => $entityData,
            'sync_hash' => hash('sha256', json_encode($entityData, JSON_THROW_ON_ERROR)),
            'sync_request_id' => $syncRequestId,
            'job_reference' => (string) Str::ulid(),
            'trace_id' => (string) Str::uuid(),
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
