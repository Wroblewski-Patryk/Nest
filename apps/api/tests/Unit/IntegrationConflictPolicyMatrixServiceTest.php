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

    public function test_partition_conflict_fields_returns_manual_and_auto_sets(): void
    {
        $service = new IntegrationConflictPolicyMatrixService;

        $partition = $service->partitionConflictFields(
            provider: 'google_calendar',
            entityType: 'calendar_event',
            candidateFields: ['description', 'title', 'start_at', 'linked_entity_id']
        );

        $this->assertSame(['title', 'start_at'], $partition['manual_queue_fields']);
        $this->assertSame(['description', 'linked_entity_id'], $partition['auto_merge_fields']);
    }

    public function test_merge_policy_payload_marks_manual_required_when_manual_fields_exist(): void
    {
        $service = new IntegrationConflictPolicyMatrixService;

        $payload = $service->buildMergePolicyPayload(
            manualFields: ['title', 'start_at'],
            autoFields: ['description']
        );

        $this->assertSame('manual_required', $payload['merge_state']);
        $this->assertSame(['title', 'start_at'], $payload['merge_policy']['manual_queue_fields']);
        $this->assertSame(['description'], $payload['merge_policy']['auto_merge_fields']);
    }
}
