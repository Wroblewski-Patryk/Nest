<?php

namespace Tests\Feature;

use App\Models\JournalEntry;
use App\Models\LifeArea;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JournalAndLifeAreasApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_crud_life_areas(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/life-areas', [
            'name' => 'Health',
            'color' => '#22C55E',
            'weight' => 35,
        ])->assertCreated();

        $lifeAreaId = $create->json('data.id');

        $this->getJson('/api/v1/life-areas')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $lifeAreaId);

        $this->patchJson("/api/v1/life-areas/{$lifeAreaId}", [
            'weight' => 40,
        ])->assertOk()->assertJsonPath('data.weight', 40);

        $this->deleteJson("/api/v1/life-areas/{$lifeAreaId}")->assertNoContent();

        $this->assertSoftDeleted('life_areas', ['id' => $lifeAreaId]);
        $this->getJson('/api/v1/life-areas')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/life-areas?include_archived=1')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_user_can_crud_journal_entries_with_life_area_tags(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $lifeArea = LifeArea::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'name' => 'Mindset',
        ]);

        $create = $this->postJson('/api/v1/journal-entries', [
            'title' => 'Monday reflection',
            'body' => 'Solid focus and deep work.',
            'mood' => 'good',
            'entry_date' => '2026-03-15',
            'life_area_ids' => [$lifeArea->id],
        ])->assertCreated();

        $entryId = $create->json('data.id');

        $this->assertDatabaseHas('journal_entry_life_area', [
            'tenant_id' => $tenant->id,
            'journal_entry_id' => $entryId,
            'life_area_id' => $lifeArea->id,
        ]);

        $this->getJson('/api/v1/journal-entries?mood=good')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $entryId);

        $this->patchJson("/api/v1/journal-entries/{$entryId}", [
            'mood' => 'great',
            'life_area_ids' => [],
        ])->assertOk()
            ->assertJsonPath('data.mood', 'great')
            ->assertJsonCount(0, 'data.life_areas');

        $this->deleteJson("/api/v1/journal-entries/{$entryId}")->assertNoContent();
        $this->assertSoftDeleted('journal_entries', ['id' => $entryId]);
    }

    public function test_user_can_recreate_life_area_name_after_soft_delete(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $first = $this->postJson('/api/v1/life-areas', [
            'name' => 'Health',
            'color' => '#22C55E',
            'weight' => 35,
        ])->assertCreated();

        $firstId = $first->json('data.id');

        $this->deleteJson("/api/v1/life-areas/{$firstId}")->assertNoContent();
        $this->assertSoftDeleted('life_areas', ['id' => $firstId]);

        $second = $this->postJson('/api/v1/life-areas', [
            'name' => 'Health',
            'color' => '#16A34A',
            'weight' => 40,
        ])->assertCreated();

        $secondId = $second->json('data.id');

        $this->assertNotSame($firstId, $secondId);
    }

    public function test_life_areas_and_journal_entries_are_tenant_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $lifeAreaB = LifeArea::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        $entryB = JournalEntry::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson("/api/v1/life-areas/{$lifeAreaB->id}")->assertNotFound();
        $this->getJson("/api/v1/journal-entries/{$entryB->id}")->assertNotFound();
    }

    public function test_guest_cannot_access_journal_and_life_areas_routes(): void
    {
        $this->getJson('/api/v1/life-areas')->assertUnauthorized();
        $this->postJson('/api/v1/life-areas', ['name' => 'x'])->assertUnauthorized();
        $this->getJson('/api/v1/journal-entries')->assertUnauthorized();
        $this->postJson('/api/v1/journal-entries', ['title' => 'x'])->assertUnauthorized();
    }
}
