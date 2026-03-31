<?php

namespace App\Integrations\Adapters;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\Support\IntegrationSyncResult;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class MicrosoftTodoAdapter implements IntegrationAdapter
{
    private const MAPPING_VERSION = 'microsoft_todo.v1';

    public function provider(): string
    {
        return 'microsoft_todo';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(array $payload): IntegrationSyncResult
    {
        $entityType = (string) ($payload['internal_entity_type'] ?? 'unknown');
        $externalId = (string) ($payload['external_id'] ?? 'ms-todo-'.Str::ulid());
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
                'adapter' => 'microsoft_todo',
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
                'displayName' => (string) ($entityPayload['name'] ?? ''),
            ];
        }

        if ($entityType === 'task') {
            return array_filter([
                'title' => (string) ($entityPayload['title'] ?? ''),
                'body' => $this->mapBody($entityPayload['description'] ?? null),
                'status' => $this->mapStatus((string) ($entityPayload['status'] ?? 'todo')),
                'importance' => $this->mapImportance((string) ($entityPayload['priority'] ?? 'medium')),
                'dueDateTime' => $this->mapDueDate($entityPayload['due_date'] ?? null),
                'linkedListRef' => $this->nullableString($entityPayload['list_id'] ?? null),
            ], static fn ($value) => $value !== null);
        }

        return $entityPayload;
    }

    /**
     * @return array<string, string>|null
     */
    private function mapBody(mixed $description): ?array
    {
        $text = $this->nullableString($description);
        if ($text === null) {
            return null;
        }

        return [
            'contentType' => 'text',
            'content' => $text,
        ];
    }

    private function mapStatus(string $status): string
    {
        return match ($status) {
            'done', 'completed', 'canceled' => 'completed',
            default => 'notStarted',
        };
    }

    private function mapImportance(string $priority): string
    {
        return match ($priority) {
            'urgent', 'high' => 'high',
            'low' => 'low',
            default => 'normal',
        };
    }

    /**
     * @return array<string, string>|null
     */
    private function mapDueDate(mixed $dueDate): ?array
    {
        if ($dueDate === null || $dueDate === '') {
            return null;
        }

        $normalized = CarbonImmutable::parse((string) $dueDate)->utc()->startOfDay();

        return [
            'dateTime' => $normalized->format('Y-m-d\TH:i:s'),
            'timeZone' => 'UTC',
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (string) $value;
    }
}
