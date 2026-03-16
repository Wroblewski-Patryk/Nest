<?php

namespace Tests\Feature;

use App\Models\AnalyticsEvent;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InsightsTrendApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_tasks_weekly_trend_endpoint_returns_bucketed_counts(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'status' => 'done',
            'completed_at' => now()->startOfWeek()->addDay(),
        ]);
        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'status' => 'done',
            'completed_at' => now()->subWeek()->startOfWeek()->addDay(),
        ]);
        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'status' => 'done',
            'completed_at' => now()->subWeeks(3),
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/insights/trends/tasks?period=weekly&points=2')
            ->assertOk()
            ->assertJsonPath('meta.module', 'tasks')
            ->assertJsonPath('meta.period', 'weekly')
            ->assertJsonPath('meta.points', 2)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data');

        $values = array_column($response->json('data'), 'value');
        $this->assertSame([1, 1], $values);
    }

    public function test_habits_monthly_trend_endpoint_returns_bucketed_counts(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $habit = Habit::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        HabitLog::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'habit_id' => $habit->id,
            'logged_at' => now()->startOfMonth()->addDays(3),
        ]);
        HabitLog::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'habit_id' => $habit->id,
            'logged_at' => now()->subMonth()->startOfMonth()->addDays(2),
        ]);
        HabitLog::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'habit_id' => $habit->id,
            'logged_at' => now()->subMonth()->startOfMonth()->addDays(6),
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/insights/trends/habits?period=monthly&points=2')
            ->assertOk()
            ->assertJsonPath('meta.module', 'habits')
            ->assertJsonPath('meta.period', 'monthly')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonCount(2, 'data');

        $values = array_column($response->json('data'), 'value');
        $this->assertSame([2, 1], $values);
    }

    public function test_goals_trend_is_tenant_and_user_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        AnalyticsEvent::query()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'event_name' => 'goals.target.progress_updated',
            'event_version' => '1.0',
            'platform' => 'api',
            'module' => 'goals',
            'properties' => ['target_id' => 't-1'],
            'occurred_at' => now()->startOfWeek()->addDay(),
            'received_at' => now()->startOfWeek()->addDay(),
        ]);
        AnalyticsEvent::query()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'event_name' => 'goals.target.progress_updated',
            'event_version' => '1.0',
            'platform' => 'api',
            'module' => 'goals',
            'properties' => ['target_id' => 't-2'],
            'occurred_at' => now()->startOfWeek()->addDay(),
            'received_at' => now()->startOfWeek()->addDay(),
        ]);

        Sanctum::actingAs($userA);

        $this->getJson('/api/v1/insights/trends/goals?period=weekly&points=1')
            ->assertOk()
            ->assertJsonPath('meta.module', 'goals')
            ->assertJsonPath('meta.total', 1);
    }

    public function test_trend_validation_rejects_invalid_period(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/insights/trends/tasks?period=daily')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['period']);
    }

    public function test_guest_cannot_access_trend_endpoints(): void
    {
        $this->getJson('/api/v1/insights/trends/tasks')->assertUnauthorized();
        $this->getJson('/api/v1/insights/trends/habits')->assertUnauthorized();
        $this->getJson('/api/v1/insights/trends/goals')->assertUnauthorized();
    }
}
