<?php

namespace Tests\Unit;

use App\Integrations\Services\IntegrationConflictPolicyMatrixService;
use Tests\TestCase;

class IntegrationConflictPolicyMatrixServiceTest extends TestCase
{
    public function test_manual_queue_fields_are_deterministically_selected_by_provider_and_entity(): void
    {
        $service = new IntegrationConflictPolicyMatrixService;

        $result = $service->manualQueueFields(
            provider: 'google_calendar',
            entityType: 'calendar_event',
            candidateFields: ['description', 'title', 'end_at', 'linked_entity_id']
        );

        $this->assertSame(['title', 'end_at'], $result);
    }

    public function test_unknown_provider_or_entity_returns_empty_manual_queue_fields(): void
    {
        $service = new IntegrationConflictPolicyMatrixService;

        $this->assertSame([], $service->manualQueueFields('unknown', 'task', ['title']));
        $this->assertSame([], $service->manualQueueFields('trello', 'unknown', ['title']));
    }
}
