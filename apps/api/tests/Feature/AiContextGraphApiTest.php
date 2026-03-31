<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\Goal;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\JournalEntry;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiContextGraphApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_context_graph_endpoint_returns_not_found_when_ai_surface_is_disabled(): void
    {
        config()->set('features.ai_surface_enabled', false);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/ai/context-graph')->assertNotFound();
    }

    public function test_context_graph_is_versioned_deterministic_and_redacted(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'title' => 'Ship context graph endpoint',
            'description' => 'TASK_SECRET_DESCRIPTION',
            'status' => 'todo',
            'priority' => 'urgent',
            'due_date' => '2026-04-02',
        ]);

        $habit = Habit::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Daily planning',
            'description' => 'HABIT_SECRET_DESCRIPTION',
            'cadence' => ['type' => 'daily'],
        ]);

        HabitLog::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'habit_id' => $habit->id,
            'logged_at' => '2026-03-29 07:00:00',
            'value_numeric' => null,
            'value_seconds' => 300,
            'note' => 'Kept cadence',
        ]);

        Goal::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Launch copilot beta',
            'description' => 'GOAL_SECRET_DESCRIPTION',
            'status' => 'active',
            'target_date' => '2026-04-15',
        ]);

        CalendarEvent::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Deep work block',
            'description' => 'CALENDAR_SECRET_DESCRIPTION',
            'start_at' => '2026-04-01 09:00:00',
            'end_at' => '2026-04-01 10:00:00',
            'timezone' => 'UTC',
        ]);

        JournalEntry::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Reflection',
            'body' => 'JOURNAL_SECRET_BODY',
            'mood' => 'good',
            'entry_date' => '2026-03-30',
        ]);

        Sanctum::actingAs($user);

        $endpoint = '/api/v1/ai/context-graph?window_days=14&entity_limit=10&as_of=2026-03-31T09:00:00Z';
        $first = $this->getJson($endpoint)->assertOk();
        $second = $this->getJson($endpoint)->assertOk();

        $first
            ->assertJsonPath('data.schema_version', 'ai-context.v1')
            ->assertJsonPath('data.snapshot.window_days', 14)
            ->assertJsonPath('data.privacy.redaction_policy_version', 'ai-context-redaction.v1')
            ->assertJsonPath('data.privacy.mode', 'strict')
            ->assertJsonPath('data.privacy.redacted_fields.tasks.0', 'description')
            ->assertJsonPath('data.privacy.redacted_fields.journal_entries.0', 'body')
            ->assertJsonPath('data.entities.tasks.0.title', 'Ship context graph endpoint')
            ->assertJsonPath('data.entities.tasks.0.has_description', true)
            ->assertJsonPath('data.entities.journal_entries.0.has_body', true);

        $this->assertSame(
            (string) $first->json('data.snapshot.fingerprint'),
            (string) $second->json('data.snapshot.fingerprint')
        );

        $taskEntity = $first->json('data.entities.tasks.0');
        $journalEntity = $first->json('data.entities.journal_entries.0');
        $this->assertIsArray($taskEntity);
        $this->assertIsArray($journalEntity);
        $this->assertArrayNotHasKey('description', $taskEntity);
        $this->assertArrayNotHasKey('body', $journalEntity);

        $raw = (string) $first->getContent();
        $this->assertStringNotContainsString('TASK_SECRET_DESCRIPTION', $raw);
        $this->assertStringNotContainsString('HABIT_SECRET_DESCRIPTION', $raw);
        $this->assertStringNotContainsString('GOAL_SECRET_DESCRIPTION', $raw);
        $this->assertStringNotContainsString('CALENDAR_SECRET_DESCRIPTION', $raw);
        $this->assertStringNotContainsString('JOURNAL_SECRET_BODY', $raw);
    }

    public function test_context_graph_is_tenant_scoped(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $listA = TaskList::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id]);

        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);
        $listB = TaskList::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id]);

        Task::factory()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'list_id' => $listA->id,
            'title' => 'Tenant A visible task',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        Task::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'list_id' => $listB->id,
            'title' => 'Tenant B hidden task',
            'status' => 'todo',
            'priority' => 'urgent',
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/v1/ai/context-graph?as_of=2026-03-31T09:00:00Z')->assertOk();

        $titles = collect($response->json('data.entities.tasks'))->pluck('title')->all();
        $this->assertContains('Tenant A visible task', $titles);
        $this->assertNotContains('Tenant B hidden task', $titles);
    }
}
