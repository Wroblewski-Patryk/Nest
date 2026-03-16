<?php

namespace Tests\Feature;

use App\Models\IntegrationSyncAudit;
use App\Models\JournalEntry;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationJournalSyncApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_user_can_sync_journal_entries_to_obsidian(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        JournalEntry::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Morning notes',
            'entry_date' => '2026-03-16',
        ]);

        $this->postJson('/api/v1/integrations/journal-sync', [
            'provider' => 'obsidian',
        ])->assertOk()
            ->assertJsonPath('data.provider', 'obsidian')
            ->assertJsonPath('data.processed', 1)
            ->assertJsonPath('data.synced', 1)
            ->assertJsonPath('data.skipped', 0);

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => 'obsidian',
            'internal_entity_type' => 'journal_entry',
        ]);

        $audit = IntegrationSyncAudit::query()
            ->where('tenant_id', $tenant->id)
            ->where('provider', 'obsidian')
            ->first();

        $this->assertNotNull($audit);
        $this->assertSame('obsidian.v1', $audit->metadata['mapping_version'] ?? null);
    }

    public function test_repeated_journal_sync_without_changes_is_skipped(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        JournalEntry::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        $this->postJson('/api/v1/integrations/journal-sync', [
            'provider' => 'obsidian',
        ])->assertOk();

        $this->postJson('/api/v1/integrations/journal-sync', [
            'provider' => 'obsidian',
        ])->assertOk()
            ->assertJsonPath('data.processed', 1)
            ->assertJsonPath('data.synced', 0)
            ->assertJsonPath('data.skipped', 1);
    }

    public function test_guest_cannot_trigger_journal_sync(): void
    {
        $this->postJson('/api/v1/integrations/journal-sync', [
            'provider' => 'obsidian',
        ])->assertUnauthorized();
    }
}
