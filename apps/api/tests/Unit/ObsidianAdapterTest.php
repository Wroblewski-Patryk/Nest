<?php

namespace Tests\Unit;

use App\Integrations\Adapters\ObsidianAdapter;
use Tests\TestCase;

class ObsidianAdapterTest extends TestCase
{
    public function test_adapter_maps_journal_entry_to_markdown_note_shape(): void
    {
        $adapter = new ObsidianAdapter;

        $result = $adapter->sync([
            'internal_entity_type' => 'journal_entry',
            'external_id' => 'obsidian-note-1',
            'entity_payload' => [
                'title' => 'Weekly Reflection',
                'body' => 'I focused on deep work sessions.',
                'mood' => 'good',
                'entry_date' => '2026-03-16',
                'life_areas' => ['Work', 'Health'],
            ],
        ]);

        $this->assertSame('obsidian-note-1', $result->externalId);
        $this->assertSame('success', $result->status);
        $this->assertSame('obsidian.v1', $result->metadata['mapping_version']);
        $this->assertSame('journal_entry', $result->metadata['mapped_entity_type']);
        $this->assertContains('path', $result->metadata['mapped_fields']);
        $this->assertContains('content', $result->metadata['mapped_fields']);
        $this->assertStringContainsString('.md', (string) ($result->metadata['note_path'] ?? ''));
    }
}
