<?php

namespace App\Integrations\Services;

use App\Integrations\IntegrationAdapterRegistry;
use App\Models\IntegrationSyncAudit;
use App\Models\SyncMapping;
use App\Observability\MetricCounter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class IntegrationSyncService
{
    public function __construct(
        private readonly IntegrationAdapterRegistry $registry,
        private readonly MetricCounter $metrics,
        private readonly IntegrationConflictQueueService $conflicts,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function sync(array $payload): array
    {
        $validated = $this->validatePayload($payload);
        $idempotencyKey = (string) $validated['idempotency_key'];

        if (! $this->acquireIdempotencyLock($validated['tenant_id'], $validated['provider'], $idempotencyKey)) {
            $this->metrics->increment('integration.sync.duplicate');
            $this->recordAudit(
                payload: $validated,
                status: 'duplicate_skipped',
                metadata: ['reason' => 'idempotency_lock_exists']
            );

            return [
                'status' => 'duplicate_skipped',
                'idempotency_key' => $idempotencyKey,
            ];
        }

        $adapter = $this->registry->resolve($validated['provider']);
        $result = $adapter->sync($validated);

        $syncHash = $result->syncHash ?? $this->payloadHash($validated);
        $this->upsertSyncMappingWithIntegrity(
            payload: $validated,
            externalId: $result->externalId,
            status: $result->status,
            syncHash: $syncHash
        );
        $this->recordAudit(
            payload: $validated,
            status: $result->status,
            externalId: $result->externalId,
            syncHash: $syncHash,
            metadata: $result->metadata
        );

        $this->metrics->increment('integration.sync.processed');

        return [
            'status' => $result->status,
            'provider' => $validated['provider'],
            'external_id' => $result->externalId,
            'idempotency_key' => $idempotencyKey,
        ];
    }

    private function acquireIdempotencyLock(string $tenantId, string $provider, string $idempotencyKey): bool
    {
        $lockKey = "integrations:idempotency:{$tenantId}:{$provider}:{$idempotencyKey}";

        return Cache::add($lockKey, true, now()->addHours(24));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function validatePayload(array $payload): array
    {
        $required = [
            'tenant_id',
            'user_id',
            'provider',
            'internal_entity_type',
            'internal_entity_id',
        ];

        foreach ($required as $field) {
            if (! array_key_exists($field, $payload) || $payload[$field] === null || $payload[$field] === '') {
                throw new InvalidArgumentException("Missing required integration payload field [{$field}].");
            }
        }

        $payload['idempotency_key'] = $payload['idempotency_key'] ?? (string) Str::ulid();

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function payloadHash(array $payload): string
    {
        return hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function upsertSyncMappingWithIntegrity(
        array $payload,
        string $externalId,
        string $status,
        string $syncHash
    ): void {
        $byInternal = SyncMapping::query()
            ->where('tenant_id', $payload['tenant_id'])
            ->where('provider', $payload['provider'])
            ->where('internal_entity_type', $payload['internal_entity_type'])
            ->where('internal_entity_id', $payload['internal_entity_id'])
            ->first();

        if ($byInternal !== null && ! hash_equals((string) $byInternal->external_id, $externalId)) {
            throw new RuntimeException('Sync mapping integrity violation for internal entity.');
        }

        $byExternal = SyncMapping::query()
            ->where('tenant_id', $payload['tenant_id'])
            ->where('provider', $payload['provider'])
            ->where('external_id', $externalId)
            ->first();

        if (
            $byExternal !== null
            && (
                ! hash_equals((string) $byExternal->internal_entity_type, (string) $payload['internal_entity_type'])
                || ! hash_equals((string) $byExternal->internal_entity_id, (string) $payload['internal_entity_id'])
            )
        ) {
            throw new RuntimeException('Sync mapping integrity violation for external entity.');
        }

        SyncMapping::query()->updateOrCreate(
            [
                'tenant_id' => $payload['tenant_id'],
                'provider' => $payload['provider'],
                'internal_entity_type' => $payload['internal_entity_type'],
                'internal_entity_id' => $payload['internal_entity_id'],
            ],
            [
                'user_id' => $payload['user_id'],
                'external_id' => $externalId,
                'last_sync_at' => now(),
                'last_sync_status' => $status,
                'sync_hash' => $syncHash,
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $metadata
     */
    private function recordAudit(
        array $payload,
        string $status,
        ?string $externalId = null,
        ?string $syncHash = null,
        array $metadata = []
    ): void {
        $audit = IntegrationSyncAudit::query()->create([
            'tenant_id' => $payload['tenant_id'] ?? null,
            'user_id' => $payload['user_id'] ?? null,
            'provider' => (string) ($payload['provider'] ?? 'unknown'),
            'idempotency_key' => (string) ($payload['idempotency_key'] ?? 'missing'),
            'internal_entity_type' => $payload['internal_entity_type'] ?? null,
            'internal_entity_id' => $payload['internal_entity_id'] ?? null,
            'external_id' => $externalId,
            'status' => $status,
            'trace_id' => $payload['trace_id'] ?? null,
            'sync_hash' => $syncHash,
            'metadata' => $metadata,
            'occurred_at' => now(),
        ]);

        $this->conflicts->upsertFromSyncMetadata(
            payload: $payload,
            metadata: $metadata,
            externalId: $externalId ?? $audit->external_id
        );
    }
}
