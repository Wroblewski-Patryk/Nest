<?php

namespace App\Integrations\Services;

use App\Models\IntegrationSyncConflict;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class IntegrationConflictQueueService
{
    public function __construct(
        private readonly IntegrationConflictPolicyMatrixService $policy,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $metadata
     */
    public function upsertFromSyncMetadata(array $payload, array $metadata, ?string $externalId = null): void
    {
        $conflictDetected = (bool) ($metadata['conflict_detected'] ?? false);
        $conflictFields = is_array($metadata['conflict_fields'] ?? null) ? $metadata['conflict_fields'] : [];
        $provider = (string) ($payload['provider'] ?? '');
        $entityType = (string) ($payload['internal_entity_type'] ?? '');
        $partition = $this->policy->partitionConflictFields($provider, $entityType, $conflictFields);
        $queueFields = $partition['manual_queue_fields'];
        $autoMergeFields = $partition['auto_merge_fields'];

        if (! $conflictDetected || $queueFields === []) {
            return;
        }

        $conflict = IntegrationSyncConflict::query()
            ->where('tenant_id', $payload['tenant_id'])
            ->where('provider', $payload['provider'])
            ->where('internal_entity_type', $payload['internal_entity_type'])
            ->where('internal_entity_id', $payload['internal_entity_id'])
            ->where('status', 'open')
            ->first();

        if ($conflict !== null) {
            $existingFields = is_array($conflict->conflict_fields) ? $conflict->conflict_fields : [];
            $existingPayload = is_array($conflict->resolution_payload) ? $conflict->resolution_payload : [];
            $conflict->update([
                'conflict_fields' => array_values(array_unique([
                    ...$existingFields,
                    ...$queueFields,
                ])),
                'last_seen_at' => now(),
                'external_id' => $externalId ?? $conflict->external_id,
                'resolution_payload' => $this->policy->mergeMergePolicyIntoPayload(
                    existingPayload: $existingPayload,
                    manualFields: $queueFields,
                    autoFields: $autoMergeFields,
                ),
            ]);

            return;
        }

        IntegrationSyncConflict::query()->create([
            'tenant_id' => $payload['tenant_id'],
            'user_id' => $payload['user_id'],
            'provider' => $provider,
            'internal_entity_type' => $entityType,
            'internal_entity_id' => $payload['internal_entity_id'],
            'external_id' => $externalId,
            'status' => 'open',
            'conflict_fields' => array_values(array_unique($queueFields)),
            'resolution_payload' => $this->policy->buildMergePolicyPayload(
                manualFields: $queueFields,
                autoFields: $autoMergeFields,
            ),
            'detected_at' => now(),
            'last_seen_at' => now(),
        ]);
    }

    /**
     * @return LengthAwarePaginator<int, IntegrationSyncConflict>
     */
    public function listOpenForUser(User $user, ?string $provider, int $perPage, int $page): LengthAwarePaginator
    {
        return IntegrationSyncConflict::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('status', 'open')
            ->when($provider !== null && $provider !== '', fn ($query) => $query->where('provider', $provider))
            ->orderByDesc('last_seen_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * @param  array<string, mixed>|null  $resolutionPayload
     */
    public function resolveForUser(
        User $user,
        string $conflictId,
        string $action,
        ?array $resolutionPayload = null
    ): IntegrationSyncConflict {
        $conflict = IntegrationSyncConflict::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('status', 'open')
            ->findOrFail($conflictId);

        $conflict->update([
            'status' => 'resolved',
            'resolution_action' => $action,
            'resolution_payload' => $resolutionPayload,
            'resolved_at' => now(),
        ]);

        return $conflict->fresh();
    }
}
