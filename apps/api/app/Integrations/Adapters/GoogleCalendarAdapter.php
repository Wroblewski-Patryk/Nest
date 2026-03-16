<?php

namespace App\Integrations\Adapters;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\Support\IntegrationSyncResult;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class GoogleCalendarAdapter implements IntegrationAdapter
{
    private const MAPPING_VERSION = 'google_calendar.v1';

    public function provider(): string
    {
        return 'google_calendar';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(array $payload): IntegrationSyncResult
    {
        $entityType = (string) ($payload['internal_entity_type'] ?? 'unknown');
        $externalId = (string) ($payload['external_id'] ?? 'gcal-'.Str::ulid());
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
        $conflictFields = is_array($payload['conflict_fields'] ?? null) ? $payload['conflict_fields'] : [];

        return new IntegrationSyncResult(
            externalId: $externalId,
            status: 'success',
            syncHash: $syncHash,
            metadata: [
                'adapter' => 'google_calendar',
                'mapping_version' => self::MAPPING_VERSION,
                'mapped_entity_type' => $entityType,
                'mapped_fields' => array_keys($mappedPayload),
                'retry_profile' => [15, 60, 300, 900],
                'conflict_detected' => $conflictFields !== [],
                'conflict_fields' => $conflictFields,
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $entityPayload
     * @return array<string, mixed>
     */
    private function mapEntityPayload(string $entityType, array $entityPayload): array
    {
        if ($entityType !== 'calendar_event') {
            return $entityPayload;
        }

        $timezone = (string) ($entityPayload['timezone'] ?? 'UTC');
        $start = CarbonImmutable::parse((string) ($entityPayload['start_at'] ?? 'now'), $timezone)->utc();
        $end = CarbonImmutable::parse((string) ($entityPayload['end_at'] ?? 'now'), $timezone)->utc();

        return array_filter([
            'summary' => (string) ($entityPayload['title'] ?? ''),
            'description' => $this->nullableString($entityPayload['description'] ?? null),
            'start' => [
                'dateTime' => $start->format('Y-m-d\TH:i:s\Z'),
                'timeZone' => $timezone,
            ],
            'end' => [
                'dateTime' => $end->format('Y-m-d\TH:i:s\Z'),
                'timeZone' => $timezone,
            ],
            'all_day' => (bool) ($entityPayload['all_day'] ?? false),
            'linked_entity_type' => $this->nullableString($entityPayload['linked_entity_type'] ?? null),
            'linked_entity_id' => $this->nullableString($entityPayload['linked_entity_id'] ?? null),
        ], static fn ($value) => $value !== null);
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (string) $value;
    }
}
