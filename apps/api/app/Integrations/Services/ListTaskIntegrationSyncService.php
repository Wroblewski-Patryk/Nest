<?php

namespace App\Integrations\Services;

use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\SyncMapping;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Support\Str;

class ListTaskIntegrationSyncService
{
    /**
     * @return array{processed:int,synced:int,skipped:int}
     */
    public function syncForUser(User $user, string $provider): array
    {
        $lists = TaskList::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('is_archived', false)
            ->get();

        $tasks = Task::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('status', '!=', 'canceled')
            ->get();

        $processed = 0;
        $synced = 0;
        $skipped = 0;

        foreach ($lists as $list) {
            $processed++;
            $payload = $this->buildPayload(
                user: $user,
                provider: $provider,
                entityType: 'task_list',
                entityId: $list->id,
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

            $result = ProcessIntegrationSyncJob::dispatchSync($payload);

            $status = is_array($result) ? ($result['status'] ?? null) : null;
            if ($status === 'duplicate_skipped') {
                $skipped++;
            } else {
                $synced++;
            }
        }

        foreach ($tasks as $task) {
            $processed++;
            $payload = $this->buildPayload(
                user: $user,
                provider: $provider,
                entityType: 'task',
                entityId: $task->id,
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
        string $entityType,
        string $entityId,
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
