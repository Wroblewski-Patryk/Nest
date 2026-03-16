<?php

namespace App\Integrations\Adapters;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\Support\IntegrationSyncResult;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class ObsidianAdapter implements IntegrationAdapter
{
    private const MAPPING_VERSION = 'obsidian.v1';

    public function provider(): string
    {
        return 'obsidian';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(array $payload): IntegrationSyncResult
    {
        $entityType = (string) ($payload['internal_entity_type'] ?? 'unknown');
        $externalId = (string) ($payload['external_id'] ?? 'obsidian-'.Str::ulid());
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
                'adapter' => 'obsidian',
                'mapping_version' => self::MAPPING_VERSION,
                'mapped_entity_type' => $entityType,
                'mapped_fields' => array_keys($mappedPayload),
                'note_path' => $mappedPayload['path'] ?? null,
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $entityPayload
     * @return array<string, mixed>
     */
    private function mapEntityPayload(string $entityType, array $entityPayload): array
    {
        if ($entityType !== 'journal_entry') {
            return $entityPayload;
        }

        $title = trim((string) ($entityPayload['title'] ?? 'untitled-entry'));
        $entryDate = (string) ($entityPayload['entry_date'] ?? CarbonImmutable::now()->toDateString());
        $safeTitle = Str::of($title)->replaceMatches('/[^A-Za-z0-9\-_ ]/', '')->replace(' ', '-')->lower();
        $path = "journal/{$entryDate}-{$safeTitle}.md";

        $frontmatter = [
            'title' => $title,
            'entry_date' => $entryDate,
            'mood' => $entityPayload['mood'] ?? null,
            'life_areas' => $entityPayload['life_areas'] ?? [],
        ];

        return [
            'path' => $path,
            'frontmatter' => $frontmatter,
            'content' => (string) ($entityPayload['body'] ?? ''),
        ];
    }
}
