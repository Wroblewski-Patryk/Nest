<?php

namespace Tests\Integration;

use App\Models\CalendarEvent;
use App\Models\JournalEntry;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class IntegrationProviderRegressionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    #[DataProvider('listTaskProviders')]
    public function test_list_task_sync_pipeline_runs_end_to_end_for_provider(string $provider): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $listResponse = $this->postJson('/api/v1/lists', [
            'name' => "{$provider} regression list",
            'color' => '#0ea5e9',
        ])->assertCreated();

        $listId = (string) $listResponse->json('data.id');
        $this->postJson('/api/v1/tasks', [
            'list_id' => $listId,
            'title' => "{$provider} regression task",
            'priority' => 'high',
        ])->assertCreated();

        $this->postJson('/api/v1/integrations/list-task-sync', [
            'provider' => $provider,
        ])->assertOk()
            ->assertJsonPath('data.provider', $provider)
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.synced', 2)
            ->assertJsonPath('data.skipped', 0);

        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => $provider,
            'internal_entity_type' => 'task_list',
            'internal_entity_id' => $listId,
        ]);
        $this->assertDatabaseHas('sync_mappings', [
            'tenant_id' => $tenant->id,
            'provider' => $provider,
            'internal_entity_type' => 'task',
        ]);
    }

    public function test_calendar_sync_pipeline_runs_with_conflict_queue_flow(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $event = CalendarEvent::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Regression Calendar Event',
        ]);

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk()
            ->assertJsonPath('data.synced', 1)
            ->assertJsonPath('data.conflicts', 0);

        $event->update([
            'title' => 'Regression Calendar Event Updated',
        ]);

        $this->postJson('/api/v1/integrations/calendar-sync', [
            'provider' => 'google_calendar',
        ])->assertOk()
            ->assertJsonPath('data.synced', 1)
            ->assertJsonPath('data.conflicts', 1);

        $this->getJson('/api/v1/integrations/conflicts?provider=google_calendar')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.provider', 'google_calendar')
            ->assertJsonPath('data.0.status', 'open');
    }

    public function test_journal_sync_pipeline_runs_end_to_end_for_obsidian(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        JournalEntry::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Regression Journal Entry',
            'body' => 'Regression content',
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
    }

    /**
     * @return array<string, array{0:string}>
     */
    public static function listTaskProviders(): array
    {
        return [
            'trello' => ['trello'],
            'google_tasks' => ['google_tasks'],
            'todoist' => ['todoist'],
        ];
    }
}
