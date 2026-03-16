<?php

namespace Tests\Unit;

use App\Integrations\Adapters\TodoistAdapter;
use Tests\TestCase;

class TodoistAdapterTest extends TestCase
{
    public function test_adapter_maps_task_payload_to_consistent_todoist_shape(): void
    {
        $adapter = new TodoistAdapter;

        $result = $adapter->sync([
            'internal_entity_type' => 'task',
            'external_id' => 'todoist-task-1',
            'entity_payload' => [
                'title' => 'Plan sprint',
                'description' => 'Review top priorities',
                'status' => 'todo',
                'priority' => 'high',
                'due_date' => '2026-03-21',
                'list_id' => 'list-abc',
            ],
        ]);

        $this->assertSame('todoist-task-1', $result->externalId);
        $this->assertSame('success', $result->status);
        $this->assertSame('todoist.v1', $result->metadata['mapping_version']);
        $this->assertSame('task', $result->metadata['mapped_entity_type']);
        $this->assertContains('content', $result->metadata['mapped_fields']);
        $this->assertContains('priority', $result->metadata['mapped_fields']);
    }

    public function test_adapter_hash_ignores_unknown_payload_fields_for_task(): void
    {
        $adapter = new TodoistAdapter;

        $baseResult = $adapter->sync([
            'internal_entity_type' => 'task',
            'external_id' => 'todoist-task-2',
            'entity_payload' => [
                'title' => 'Review docs',
                'description' => 'Check integration notes',
                'status' => 'todo',
                'priority' => 'medium',
                'due_date' => '2026-03-22',
                'list_id' => 'list-xyz',
            ],
        ]);

        $extendedResult = $adapter->sync([
            'internal_entity_type' => 'task',
            'external_id' => 'todoist-task-2',
            'entity_payload' => [
                'title' => 'Review docs',
                'description' => 'Check integration notes',
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
