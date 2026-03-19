<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\IntegrationSyncAudit;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationCalendarSyncApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_user_can_sync_calendar_events_to_google_calendar(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        CalendarEvent::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Project kickoff',
            'timezone' => 'Europe/Warsaw',
        ]);

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk()
            ->assertJsonPath('data.provider', 'google_calendar')
            ->assertJsonPath('data.processed', 1)
            ->assertJsonPath('data.enqueued', 1)
            ->assertJsonPath('data.skipped', 0)
            ->assertJsonPath('data.conflicts', 0)
            ->assertJsonPath('data.mode', 'async');

        $this->drainIntegrationQueue();

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => 'google_calendar',
            'internal_entity_type' => 'calendar_event',
        ]);

        $audit = IntegrationSyncAudit::query()
            ->where('tenant_id', $tenant->id)
            ->where('provider', 'google_calendar')
            ->first();

        $this->assertNotNull($audit);
        $this->assertSame('google_calendar.v1', $audit->metadata['mapping_version'] ?? null);
        $this->assertSame(false, $audit->metadata['conflict_detected'] ?? null);
    }

    public function test_repeated_calendar_sync_without_changes_is_skipped(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        CalendarEvent::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk();

        $this->drainIntegrationQueue();

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk()
            ->assertJsonPath('data.processed', 1)
            ->assertJsonPath('data.enqueued', 0)
            ->assertJsonPath('data.skipped', 1)
            ->assertJsonPath('data.conflicts', 0);
    }

    public function test_updated_calendar_event_is_reported_as_conflict_candidate(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $event = CalendarEvent::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Planning',
        ]);

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk();

        $this->drainIntegrationQueue();

        $event->update([
            'title' => 'Planning updated',
            'all_day' => true,
        ]);

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk()
            ->assertJsonPath('data.processed', 1)
            ->assertJsonPath('data.enqueued', 1)
            ->assertJsonPath('data.conflicts', 1);

        $this->drainIntegrationQueue();

        $audits = IntegrationSyncAudit::query()
            ->where('tenant_id', $tenant->id)
            ->where('provider', 'google_calendar')
            ->get();

        $this->assertGreaterThanOrEqual(2, $audits->count());
    }

    public function test_guest_cannot_trigger_calendar_sync(): void
    {
        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertUnauthorized();
    }

    public function test_sync_processes_calendar_events_across_chunk_boundary(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        CalendarEvent::factory()->count(101)->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        $response = $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk();

        $response->assertJsonPath('data.processed', 101)
            ->assertJsonPath('data.enqueued', 101)
            ->assertJsonPath('data.skipped', 0)
            ->assertJsonPath('data.conflicts', 0);

        $this->assertCount(101, $response->json('data.job_references', []));
    }

    private function drainIntegrationQueue(): void
    {
        while ((int) DB::table('jobs')->count() > 0) {
            Artisan::call('queue:work', [
                'connection' => 'database',
                '--queue' => 'integrations',
                '--once' => true,
            ]);
        }
    }
}
