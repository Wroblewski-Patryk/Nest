<?php

namespace App\Integrations\Adapters;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\Support\IntegrationSyncResult;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class GoogleTasksAdapter implements IntegrationAdapter
{
    private const MAPPING_VERSION = 'google_tasks.v1';

    public function provider(): string
    {
        return 'google_tasks';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(array $payload): IntegrationSyncResult
    {
        $entityType = (string) ($payload['internal_entity_type'] ?? 'unknown');
        $externalId = (string) ($payload['external_id'] ?? 'gtasks-'.Str::ulid());
        $mappedPayload = $this->mapEntityPayload(
            entityType: $entityType,
            entityPayload: is_array($payload['entity_payload'] ?? null) ? $payload['entity_payload'] : []
        );
        $calculatedHash = hash('sha256', json_encode([
            'provider' => $this->provider(),
            'mapping_version' => self::MAPPING_VERSION,
            'entity_type' => $entityType,
            'payload' => $mappedPayload,
        ], JSON_THROW_ON_ERROR));
        $syncHash = (string) ($payload['sync_hash'] ?? $calculatedHash);

        return new IntegrationSyncResult(
            externalId: $externalId,
            status: 'success',
            syncHash: $syncHash,
            metadata: [
                'adapter' => 'google_tasks',
                'mapping_version' => self::MAPPING_VERSION,
                'mapped_entity_type' => $entityType,
                'mapped_fields' => array_keys($mappedPayload),
                'retry_profile' => [15, 60, 300, 900],
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $entityPayload
     * @return array<string, mixed>
     */
    private function mapEntityPayload(string $entityType, array $entityPayload): array
    {
        if ($entityType === 'task_list') {
            return [
                'title' => (string) ($entityPayload['name'] ?? ''),
                'position' => (int) ($entityPayload['position'] ?? 0),
                'color' => (string) ($entityPayload['color'] ?? '#4F46E5'),
            ];
        }

        if ($entityType === 'task') {
            return array_filter([
                'title' => (string) ($entityPayload['title'] ?? ''),
                'notes' => $this->nullableString($entityPayload['description'] ?? null),
                'status' => $this->mapTaskStatus((string) ($entityPayload['status'] ?? 'todo')),
                'priority' => (string) ($entityPayload['priority'] ?? 'medium'),
                'due' => $this->mapDueDate($entityPayload['due_date'] ?? null),
                'task_list_ref' => $this->nullableString($entityPayload['list_id'] ?? null),
            ], static fn ($value) => $value !== null);
        }

        return $entityPayload;
    }

    private function mapTaskStatus(string $status): string
    {
        return match ($status) {
            'done', 'completed', 'canceled' => 'completed',
            default => 'needsAction',
        };
    }

    private function mapDueDate(mixed $dueDate): ?string
    {
        if ($dueDate === null || $dueDate === '') {
            return null;
        }

        $normalized = CarbonImmutable::parse((string) $dueDate)->utc()->startOfDay();

        return $normalized->format('Y-m-d\TH:i:s\Z');
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (string) $value;
    }
}
