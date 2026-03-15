<?php

namespace Tests\Feature;

use App\Models\Goal;
use App\Models\Target;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GoalsAndTargetsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_crud_goals(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/goals', [
            'title' => 'Run a half marathon',
            'description' => 'Prepare before summer',
            'target_date' => '2026-06-30',
        ])->assertCreated();

        $goalId = $create->json('data.id');

        $this->getJson('/api/v1/goals?status=active')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $goalId);

        $this->patchJson("/api/v1/goals/{$goalId}", [
            'status' => 'paused',
        ])->assertOk()->assertJsonPath('data.status', 'paused');

        $this->deleteJson("/api/v1/goals/{$goalId}")->assertNoContent();
        $this->assertSoftDeleted('goals', ['id' => $goalId]);
    }

    public function test_user_can_crud_targets_for_own_goals(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $goal = Goal::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        $create = $this->postJson('/api/v1/targets', [
            'goal_id' => $goal->id,
            'title' => 'Weekly runs',
            'metric_type' => 'count',
            'value_target' => 3,
            'value_current' => 1,
            'unit' => 'runs',
            'status' => 'active',
        ])->assertCreated();

        $targetId = $create->json('data.id');

        $this->getJson("/api/v1/targets?goal_id={$goal->id}")
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $targetId);

        $this->patchJson("/api/v1/targets/{$targetId}", [
            'value_current' => 2,
            'status' => 'paused',
        ])->assertOk()
            ->assertJsonPath('data.value_current', '2.00')
            ->assertJsonPath('data.status', 'paused');

        $this->deleteJson("/api/v1/targets/{$targetId}")->assertNoContent();
        $this->assertSoftDeleted('targets', ['id' => $targetId]);
    }

    public function test_goals_and_targets_are_tenant_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $goalB = Goal::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        $targetB = Target::factory()->create([
            'tenant_id' => $tenantB->id,
            'goal_id' => $goalB->id,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson("/api/v1/goals/{$goalB->id}")->assertNotFound();
        $this->getJson("/api/v1/targets/{$targetB->id}")->assertNotFound();
    }

    public function test_guest_cannot_access_goals_and_targets_routes(): void
    {
        $this->getJson('/api/v1/goals')->assertUnauthorized();
        $this->postJson('/api/v1/goals', ['title' => 'x'])->assertUnauthorized();
        $this->getJson('/api/v1/targets')->assertUnauthorized();
        $this->postJson('/api/v1/targets', ['title' => 'x'])->assertUnauthorized();
    }
}
