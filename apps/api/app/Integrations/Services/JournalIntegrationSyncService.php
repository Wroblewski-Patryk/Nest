<?php

namespace App\Integrations\Services;

use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\JournalEntry;
use App\Models\SyncMapping;
use App\Models\User;
use Illuminate\Support\Str;

class JournalIntegrationSyncService
{
    /**
     * @return array{processed:int,synced:int,skipped:int}
     */
    public function syncForUser(User $user, string $provider): array
    {
        $entries = JournalEntry::query()
            ->with('lifeAreas:id,name')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->orderByDesc('entry_date')
            ->get();

        $processed = 0;
        $synced = 0;
        $skipped = 0;

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
                entityData: $entityPayload,
            );

            if ($this->isUnchangedMapping($payload)) {
                $skipped++;

                continue;
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
            'trace_id' => (string) Str::uuid(),
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
