<?php

namespace Tests\Unit;

use App\Integrations\Adapters\GoogleTasksAdapter;
use Tests\TestCase;

class GoogleTasksAdapterTest extends TestCase
{
    public function test_adapter_maps_task_payload_to_consistent_google_tasks_shape(): void
    {
        $adapter = new GoogleTasksAdapter;

        $result = $adapter->sync([
            'internal_entity_type' => 'task',
            'external_id' => 'gtasks-task-1',
            'entity_payload' => [
                'title' => 'Prepare weekly review',
                'description' => 'Collect habits and goals snapshot',
                'status' => 'done',
                'priority' => 'high',
                'due_date' => '2026-03-20',
                'list_id' => 'list-123',
            ],
        ]);

        $this->assertSame('gtasks-task-1', $result->externalId);
        $this->assertSame('success', $result->status);
        $this->assertArrayHasKey('mapping_version', $result->metadata);
        $this->assertSame('google_tasks.v1', $result->metadata['mapping_version']);
        $this->assertSame('task', $result->metadata['mapped_entity_type']);
        $this->assertContains('status', $result->metadata['mapped_fields']);
        $this->assertContains('due', $result->metadata['mapped_fields']);
    }

    public function test_adapter_hash_ignores_unknown_payload_fields_for_task(): void
    {
        $adapter = new GoogleTasksAdapter;

        $baseResult = $adapter->sync([
            'internal_entity_type' => 'task',
            'external_id' => 'gtasks-task-2',
            'entity_payload' => [
                'title' => 'Prepare backup',
                'description' => 'Export workspace snapshot',
                'status' => 'todo',
                'priority' => 'medium',
                'due_date' => '2026-03-22',
                'list_id' => 'list-xyz',
            ],
        ]);

        $extendedResult = $adapter->sync([
            'internal_entity_type' => 'task',
            'external_id' => 'gtasks-task-2',
            'entity_payload' => [
                'title' => 'Prepare backup',
                'description' => 'Export workspace snapshot',
                'status' => 'todo',
                'priority' => 'medium',
                'due_date' => '2026-03-22',
                'list_id' => 'list-xyz',
                'unknown_field' => 'ignored',
            ],
        ]);

        $this->assertSame($baseResult->syncHash, $extendedResult->syncHash);
    }
}
