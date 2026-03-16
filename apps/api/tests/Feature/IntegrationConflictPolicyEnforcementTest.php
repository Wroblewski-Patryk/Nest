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
    }
}
