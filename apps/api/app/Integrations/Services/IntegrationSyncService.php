<?php

namespace App\Integrations\Services;

use App\Actors\ActorContext;
use App\Integrations\IntegrationAdapterRegistry;
use App\Models\CalendarEvent;
use App\Models\IntegrationSyncAudit;
use App\Models\JournalEntry;
use App\Models\SyncMapping;
use App\Models\Task;
use App\Models\TaskList;
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
        $startedAt = microtime(true);
        $validated = $this->validatePayload($payload);
        $this->assertInternalEntityOwnership($validated);
        $idempotencyKey = (string) $validated['idempotency_key'];
        $idempotencyFingerprint = $this->resolveIdempotencyFingerprint($validated);

        try {
            if (! $this->acquireIdempotencyLock($validated['tenant_id'], $validated['provider'], $idempotencyFingerprint)) {
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
        } finally {
            $this->recordLatencyMetric($startedAt);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function assertInternalEntityOwnership(array $payload): void
    {
        $entityType = (string) $payload['internal_entity_type'];
        $entityId = (string) $payload['internal_entity_id'];
        $tenantId = (string) $payload['tenant_id'];
        $userId = (string) $payload['user_id'];

        $isOwned = match ($entityType) {
            'task_list' => TaskList::query()
                ->where('id', $entityId)
                ->where('tenant_id', $tenantId)
                ->where('user_id', $userId)
                ->exists(),
            'task' => Task::query()
                ->where('id', $entityId)
                ->where('tenant_id', $tenantId)
                ->where('user_id', $userId)
                ->exists(),
            'calendar_event' => CalendarEvent::query()
                ->where('id', $entityId)
                ->where('tenant_id', $tenantId)
                ->where('user_id', $userId)
                ->exists(),
            'journal_entry' => JournalEntry::query()
                ->where('id', $entityId)
                ->where('tenant_id', $tenantId)
                ->where('user_id', $userId)
                ->exists(),
            default => true,
        };

        if (! $isOwned) {
            throw new InvalidArgumentException('Internal entity ownership verification failed.');
        }
    }

    private function acquireIdempotencyLock(string $tenantId, string $provider, string $idempotencyFingerprint): bool
    {
        $lockKey = "integrations:idempotency:{$tenantId}:{$provider}:{$idempotencyFingerprint}";

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
    private function resolveIdempotencyFingerprint(array $payload): string
    {
        $syncHash = $payload['sync_hash'] ?? null;
        if (! is_string($syncHash) || $syncHash === '') {
            $syncHash = $this->payloadHash($payload['entity_payload'] ?? $payload);
        }

        return hash('sha256', "{$payload['idempotency_key']}|{$syncHash}");
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
        $metadata = array_merge($metadata, [
            'actor_context' => $this->sanitizeActorContext($payload),
        ]);

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

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, string|null>
     */
    private function sanitizeActorContext(array $payload): array
    {
        $context = $payload['actor_context'] ?? null;
        if (! is_array($context)) {
            return [
                'actor_type' => ActorContext::HUMAN_USER,
                'actor_user_id' => isset($payload['user_id']) ? (string) $payload['user_id'] : null,
                'delegator_user_id' => null,
            ];
        }

        $actorType = isset($context['actor_type']) ? (string) $context['actor_type'] : ActorContext::HUMAN_USER;
        if (! in_array($actorType, ActorContext::ALLOWED_TYPES, true)) {
            $actorType = ActorContext::HUMAN_USER;
        }

        return [
            'actor_type' => $actorType,
            'actor_user_id' => isset($context['actor_user_id']) ? (string) $context['actor_user_id'] : null,
            'delegator_user_id' => isset($context['delegator_user_id']) ? (string) $context['delegator_user_id'] : null,
        ];
    }

    private function recordLatencyMetric(float $startedAt): void
    {
        $latencyMs = (int) max(0, round((microtime(true) - $startedAt) * 1000));

        $this->metrics->increment('integration.sync.latency.count');
        $this->metrics->increment('integration.sync.latency.sum_ms', $latencyMs);

        $buckets = [100, 250, 500, 1000, 2000, 5000];

        foreach ($buckets as $bucket) {
            if ($latencyMs <= $bucket) {
                $this->metrics->increment("integration.sync.latency.bucket_{$bucket}");

                return;
            }
        }

        $this->metrics->increment('integration.sync.latency.bucket_overflow');
    }
}
