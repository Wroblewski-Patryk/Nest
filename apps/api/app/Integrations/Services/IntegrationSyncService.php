<?php

namespace App\Integrations\Services;

use App\Integrations\IntegrationAdapterRegistry;
use App\Models\SyncMapping;
use App\Observability\MetricCounter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use InvalidArgumentException;

class IntegrationSyncService
{
    public function __construct(
        private readonly IntegrationAdapterRegistry $registry,
        private readonly MetricCounter $metrics,
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

            return [
                'status' => 'duplicate_skipped',
                'idempotency_key' => $idempotencyKey,
            ];
        }

        $adapter = $this->registry->resolve($validated['provider']);
        $result = $adapter->sync($validated);

        SyncMapping::query()->updateOrCreate(
            [
                'tenant_id' => $validated['tenant_id'],
                'provider' => $validated['provider'],
                'external_id' => $result->externalId,
            ],
            [
                'user_id' => $validated['user_id'],
                'internal_entity_type' => $validated['internal_entity_type'],
                'internal_entity_id' => $validated['internal_entity_id'],
                'last_sync_at' => now(),
                'last_sync_status' => $result->status,
                'sync_hash' => $result->syncHash ?? $this->payloadHash($validated),
            ]
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
}
