<?php

namespace App\Integrations\Adapters;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\Support\IntegrationSyncResult;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class ClickUpAdapter implements IntegrationAdapter
{
    private const MAPPING_VERSION = 'clickup.v1';

    public function provider(): string
    {
        return 'clickup';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(array $payload): IntegrationSyncResult
    {
        $entityType = (string) ($payload['internal_entity_type'] ?? 'unknown');
        $externalId = (string) ($payload['external_id'] ?? 'clickup-'.Str::ulid());
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
                'adapter' => 'clickup',
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
                'name' => (string) ($entityPayload['name'] ?? ''),
                'color' => (string) ($entityPayload['color'] ?? '#4F46E5'),
                'orderindex' => (string) ($entityPayload['position'] ?? 0),
            ];
        }

        if ($entityType === 'task') {
            return array_filter([
                'name' => (string) ($entityPayload['title'] ?? ''),
                'description' => $this->nullableString($entityPayload['description'] ?? null),
                'priority' => $this->mapPriority((string) ($entityPayload['priority'] ?? 'medium')),
                'status' => $this->mapTaskStatus((string) ($entityPayload['status'] ?? 'todo')),
                'due_date' => $this->mapDueDate($entityPayload['due_date'] ?? null),
                'list_ref' => $this->nullableString($entityPayload['list_id'] ?? null),
            ], static fn ($value) => $value !== null);
        }

        return $entityPayload;
    }

    /**
     * @return array<string, int>
     */
    private function mapPriority(string $priority): array
    {
        $order = match ($priority) {
            'urgent' => 1,
            'high' => 2,
            'medium' => 3,
            default => 4,
        };

        return [
            'priority' => $order,
        ];
    }

    private function mapTaskStatus(string $status): string
    {
        return match ($status) {
            'done', 'completed' => 'complete',
            'canceled' => 'closed',
            'in_progress' => 'in progress',
            default => 'to do',
        };
    }

    private function mapDueDate(mixed $dueDate): ?string
    {
        if ($dueDate === null || $dueDate === '') {
            return null;
        }

        return (string) CarbonImmutable::parse((string) $dueDate)->getTimestampMs();
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (string) $value;
    }
}
