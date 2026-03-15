<?php

namespace Tests\Feature;

use App\Models\Habit;
use App\Models\Routine;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HabitsAndRoutinesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_crud_habits_and_log_progress(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        Sanctum::actingAs($user);

        $habitResponse = $this->postJson('/api/v1/habits', [
            'title' => 'Daily Reading',
            'description' => 'Read 20 pages',
            'type' => 'numeric',
            'cadence' => ['type' => 'daily'],
        ]);

        $habitResponse->assertCreated()->assertJsonPath('data.title', 'Daily Reading');
        $habitId = $habitResponse->json('data.id');

        $this->postJson("/api/v1/habits/{$habitId}/logs", [
            'logged_at' => '2026-03-16 08:00:00',
            'value_numeric' => 25,
            'note' => 'Morning session',
        ])->assertCreated()
            ->assertJsonPath('data.value_numeric', '25.00');

        $this->patchJson("/api/v1/habits/{$habitId}", [
            'is_active' => false,
        ])->assertOk()->assertJsonPath('data.is_active', false);

        $this->deleteJson("/api/v1/habits/{$habitId}")->assertNoContent();
        $this->assertSoftDeleted('habits', ['id' => $habitId]);
    }

    public function test_user_can_crud_routines_with_ordered_steps(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/routines', [
            'title' => 'Morning Routine',
            'description' => 'Start day with energy',
            'steps' => [
                ['title' => 'Drink water', 'duration_minutes' => 5],
                ['title' => 'Stretching', 'duration_minutes' => 15],
            ],
        ]);

        $create
            ->assertCreated()
            ->assertJsonPath('data.title', 'Morning Routine')
            ->assertJsonCount(2, 'data.steps')
            ->assertJsonPath('data.steps.0.step_order', 1)
            ->assertJsonPath('data.steps.1.step_order', 2);

        $routineId = $create->json('data.id');

        $this->patchJson("/api/v1/routines/{$routineId}", [
            'title' => 'Updated Morning Routine',
            'steps' => [
                ['title' => 'Meditation', 'duration_minutes' => 10],
                ['title' => 'Workout', 'duration_minutes' => 25],
                ['title' => 'Review day', 'duration_minutes' => 5],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated Morning Routine')
            ->assertJsonCount(3, 'data.steps')
            ->assertJsonPath('data.steps.2.step_order', 3);

        $this->deleteJson("/api/v1/routines/{$routineId}")->assertNoContent();
        $this->assertSoftDeleted('routines', ['id' => $routineId]);
    }

    public function test_habits_and_routines_are_tenant_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $habitB = Habit::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        $routineB = Routine::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson("/api/v1/habits/{$habitB->id}")->assertNotFound();
        $this->getJson("/api/v1/routines/{$routineB->id}")->assertNotFound();
    }

    public function test_guest_cannot_access_habits_and_routines_routes(): void
    {
        $this->getJson('/api/v1/habits')->assertUnauthorized();
        $this->postJson('/api/v1/habits', ['title' => 'x'])->assertUnauthorized();
        $this->getJson('/api/v1/routines')->assertUnauthorized();
        $this->postJson('/api/v1/routines', ['title' => 'x'])->assertUnauthorized();
    }
}
