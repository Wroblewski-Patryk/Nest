<?php

namespace Tests\Feature;

use App\Integrations\Services\IntegrationConflictQueueService;
use App\Models\IntegrationSyncConflict;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IntegrationConflictPolicyEnforcementTest extends TestCase
{
    use RefreshDatabase;

    public function test_conflict_queue_ignores_non_manual_fields_from_metadata(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $service = app(IntegrationConflictQueueService::class);

        $service->upsertFromSyncMetadata(
            payload: [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'provider' => 'google_calendar',
                'internal_entity_type' => 'calendar_event',
                'internal_entity_id' => '019cf39d-8460-73ed-84fe-3aa85847e58e',
            ],
            metadata: [
                'conflict_detected' => true,
                'conflict_fields' => ['description', 'linked_entity_id'],
            ],
            externalId: 'gcal-event-1'
        );

        $this->assertDatabaseCount('integration_sync_conflicts', 0);
    }

    public function test_conflict_queue_persists_only_manual_fields_for_open_item(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $service = app(IntegrationConflictQueueService::class);

        $service->upsertFromSyncMetadata(
            payload: [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'provider' => 'google_calendar',
                'internal_entity_type' => 'calendar_event',
                'internal_entity_id' => '019cf39d-8460-73ed-84fe-3aa85847e58f',
            ],
            metadata: [
                'conflict_detected' => true,
                'conflict_fields' => ['description', 'title', 'start_at'],
            ],
            externalId: 'gcal-event-2'
        );

        /** @var IntegrationSyncConflict $conflict */
        $conflict = IntegrationSyncConflict::query()->firstOrFail();
        $this->assertSame(['title', 'start_at'], $conflict->conflict_fields);
        $this->assertSame(
            ['title', 'start_at'],
            $conflict->resolution_payload['merge_policy']['manual_queue_fields'] ?? []
        );
        $this->assertSame(
            ['description'],
            $conflict->resolution_payload['merge_policy']['auto_merge_fields'] ?? []
        );
        $this->assertSame('manual_required', $conflict->resolution_payload['merge_state'] ?? null);
    }

    public function test_merge_policy_is_deterministic_across_repeated_conflict_updates(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $service = app(IntegrationConflictQueueService::class);

        $payload = [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'google_calendar',
            'internal_entity_type' => 'calendar_event',
            'internal_entity_id' => '019cf39d-8460-73ed-84fe-3aa85847e58a',
        ];

        $service->upsertFromSyncMetadata(
            payload: $payload,
            metadata: [
                'conflict_detected' => true,
                'conflict_fields' => ['title', 'description', 'start_at'],
            ],
            externalId: 'gcal-event-concurrent-1'
        );

        $service->upsertFromSyncMetadata(
            payload: $payload,
            metadata: [
                'conflict_detected' => true,
                'conflict_fields' => ['description', 'start_at', 'title', 'linked_entity_id'],
            ],
            externalId: 'gcal-event-concurrent-2'
        );

        /** @var IntegrationSyncConflict $conflict */
        $conflict = IntegrationSyncConflict::query()->firstOrFail();
        $this->assertSame(['title', 'start_at'], $conflict->conflict_fields);
        $this->assertSame(
            ['title', 'start_at'],
            $conflict->resolution_payload['merge_policy']['manual_queue_fields'] ?? []
        );
        $this->assertSame(
            ['description', 'linked_entity_id'],
            $conflict->resolution_payload['merge_policy']['auto_merge_fields'] ?? []
        );
    }
}
