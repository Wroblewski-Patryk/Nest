<?php

namespace Tests\Feature;

use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\JournalEntry;
use App\Models\LifeArea;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LifeAreaBalanceScoreApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_fetch_life_area_balance_scores(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $areaA = LifeArea::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'name' => 'Health',
            'weight' => 70,
        ]);
        $areaB = LifeArea::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'name' => 'Career',
            'weight' => 30,
        ]);

        $entryA1 = JournalEntry::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'entry_date' => now()->subDays(3)->toDateString(),
        ]);
        $entryA2 = JournalEntry::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'entry_date' => now()->subDays(1)->toDateString(),
        ]);
        $entryA1->lifeAreas()->attach($areaA->id, ['tenant_id' => $tenant->id]);
        $entryA2->lifeAreas()->attach($areaA->id, ['tenant_id' => $tenant->id]);

        $list = TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);
        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'life_area_id' => $areaB->id,
            'status' => 'done',
            'completed_at' => now()->subDay(),
        ]);

        $habit = Habit::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'life_area_id' => $areaB->id,
        ]);
        HabitLog::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'habit_id' => $habit->id,
            'logged_at' => now()->subDay(),
            'note' => 'Logged',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/insights/life-area-balance?window_days=30')
            ->assertOk()
            ->assertJsonPath('meta.window_days', 30)
            ->assertJsonCount(2, 'data');

        $rowsByName = collect($response->json('data'))->keyBy('name');
        $this->assertSame(67.0, (float) $response->json('meta.global_balance_score'));
        $this->assertSame(70.0, (float) $rowsByName['Health']['balance_score']);
        $this->assertSame(60.0, (float) $rowsByName['Career']['balance_score']);
        $this->assertSame(2, $rowsByName['Health']['journal_entries']);
        $this->assertSame(1, $rowsByName['Career']['completed_tasks']);
        $this->assertSame(1, $rowsByName['Career']['habit_logs']);
    }

    public function test_balance_scores_are_tenant_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        LifeArea::factory()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'name' => 'A-Only',
            'weight' => 100,
        ]);
        LifeArea::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'name' => 'B-Only',
            'weight' => 100,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson('/api/v1/insights/life-area-balance')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'A-Only');
    }

    public function test_window_days_validation_is_enforced(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/insights/life-area-balance?window_days=181')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['window_days']);
    }

    public function test_guest_cannot_access_life_area_balance_scores(): void
    {
        $this->getJson('/api/v1/insights/life-area-balance')->assertUnauthorized();
    }
}
