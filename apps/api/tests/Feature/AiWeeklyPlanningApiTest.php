<?php

namespace Tests\Feature;

use App\Models\Goal;
use App\Models\Habit;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiWeeklyPlanningApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_weekly_plan_endpoint_returns_not_found_when_ai_surface_is_disabled(): void
    {
        config()->set('features.ai_surface_enabled', false);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/weekly-plan/propose', [
            'constraints' => ['available_hours' => 8],
        ])->assertNotFound();
    }

    public function test_enabled_ai_weekly_plan_returns_constraint_aware_plan_with_rationale(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'title' => 'Finish architecture RFC',
            'status' => 'todo',
            'priority' => 'urgent',
            'due_date' => now()->addDays(2)->toDateString(),
        ]);
        Habit::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Evening review',
            'cadence' => ['type' => 'daily'],
        ]);
        Goal::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Launch beta',
            'status' => 'active',
            'target_date' => now()->addWeeks(6)->toDateString(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/weekly-plan/propose', [
            'constraints' => [
                'available_hours' => 4,
                'max_items' => 5,
                'include_weekend' => false,
                'prioritize' => ['tasks', 'habits', 'goals'],
            ],
        ])->assertOk();

        $response
            ->assertJsonPath('data.constraints.available_hours', 4)
            ->assertJsonPath('data.constraints.max_items', 5)
            ->assertJsonPath('data.constraints.include_weekend', false)
            ->assertJsonPath('data.summary.used_minutes', 165)
            ->assertJsonPath('data.summary.planned_items', 3)
            ->assertJsonPath('data.explainability.model_version', 'weekly-plan.v2');

        $items = $response->json('data.items');
        $this->assertCount(3, $items);

        foreach ($items as $item) {
            $this->assertNotEmpty($item['rationale']);
            $this->assertNotEmpty($item['reason_codes']);
            $this->assertNotEmpty($item['source_entities']);
            $this->assertArrayHasKey('scheduled_for', $item);
            $this->assertArrayHasKey('estimated_minutes', $item);
            $this->assertLessThan(6, Carbon::parse($item['scheduled_for'])->dayOfWeekIso);
        }
    }

    public function test_weekly_plan_is_tenant_scoped(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $listA = TaskList::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id]);
        $listB = TaskList::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id]);

        Task::factory()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'list_id' => $listA->id,
            'title' => 'Tenant A task',
            'status' => 'todo',
            'priority' => 'high',
        ]);
        Task::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'list_id' => $listB->id,
            'title' => 'Tenant B secret task',
            'status' => 'todo',
            'priority' => 'urgent',
        ]);

        Sanctum::actingAs($userA);

        $response = $this->postJson('/api/v1/ai/weekly-plan/propose', [
            'constraints' => [
                'available_hours' => 3,
                'max_items' => 3,
                'prioritize' => ['tasks'],
            ],
        ])->assertOk();

        $titles = collect($response->json('data.items'))->pluck('title')->all();
        $this->assertContains('Tenant A task', $titles);
        $this->assertNotContains('Tenant B secret task', $titles);
    }

    public function test_guest_cannot_access_weekly_plan_endpoint(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $this->postJson('/api/v1/ai/weekly-plan/propose', [
            'constraints' => ['available_hours' => 8],
        ])->assertUnauthorized();
    }
}
