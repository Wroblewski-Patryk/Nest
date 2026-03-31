<?php

namespace App\Integrations\Services;

use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\SyncMapping;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

class ListTaskIntegrationSyncService
{
    private const CHUNK_SIZE = 100;

    /**
     * @return array{
     *   processed:int,
     *   enqueued:int,
     *   skipped:int,
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
        $jobReferences = [];

        TaskList::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('is_archived', false)
            ->chunkById(self::CHUNK_SIZE, function ($lists) use (
                $user,
                $provider,
                $syncRequestId,
                $actorContext,
                &$processed,
                &$skipped,
                &$enqueued,
                &$jobReferences
            ): void {
                foreach ($lists as $list) {
                    $processed++;
                    $payload = $this->buildPayload(
                        user: $user,
                        provider: $provider,
                        entityType: 'task_list',
                        entityId: $list->id,
                        syncRequestId: $syncRequestId,
                        actorContext: $actorContext,
                        entityData: [
                            'name' => $list->name,
                            'color' => $list->color,
                            'position' => $list->position,
                        ]
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
                        'internal_entity_type' => 'task_list',
                        'internal_entity_id' => $list->id,
                    ];
                }
            });

        Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('status', '!=', 'canceled')
            ->chunkById(self::CHUNK_SIZE, function ($tasks) use (
                $user,
                $provider,
                $syncRequestId,
                $actorContext,
                &$processed,
                &$skipped,
                &$enqueued,
                &$jobReferences
            ): void {
                foreach ($tasks as $task) {
                    $processed++;
                    $payload = $this->buildPayload(
                        user: $user,
                        provider: $provider,
                        entityType: 'task',
                        entityId: $task->id,
                        syncRequestId: $syncRequestId,
                        actorContext: $actorContext,
                        entityData: [
                            'title' => $task->title,
                            'description' => $task->description,
                            'status' => $task->status,
                            'priority' => $task->priority,
                            'due_date' => optional($task->due_date)->toDateString(),
                            'list_id' => $task->list_id,
                        ]
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
                        'internal_entity_type' => 'task',
                        'internal_entity_id' => $task->id,
                    ];
                }
            });

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
        string $entityType,
        string $entityId,
        string $syncRequestId,
        array $actorContext,
        array $entityData
    ): array {
        $mapping = SyncMapping::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('provider', $provider)
            ->where('internal_entity_type', $entityType)
            ->where('internal_entity_id', $entityId)
            ->first();

        return [
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'provider' => $provider,
            'internal_entity_type' => $entityType,
            'internal_entity_id' => $entityId,
            'external_id' => $mapping?->external_id ?? "{$provider}-{$entityType}-{$entityId}",
            'idempotency_key' => "{$provider}:{$entityType}:{$entityId}",
            'entity_payload' => $entityData,
            'sync_hash' => hash('sha256', json_encode($entityData, JSON_THROW_ON_ERROR)),
            'sync_request_id' => $syncRequestId,
            'job_reference' => (string) Str::ulid(),
            'trace_id' => (string) Str::uuid(),
            'actor_context' => $actorContext,
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
