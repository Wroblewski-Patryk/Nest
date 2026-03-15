<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TasksAndListsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_crud_lists(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/v1/lists', [
            'name' => 'Personal Backlog',
            'color' => '#10B981',
            'position' => 2,
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Personal Backlog');

        $listId = $createResponse->json('data.id');

        $this->getJson('/api/v1/lists')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $listId);

        $this->patchJson("/api/v1/lists/{$listId}", [
            'name' => 'Updated Backlog',
            'is_archived' => true,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Updated Backlog')
            ->assertJsonPath('data.is_archived', true);

        $this->deleteJson("/api/v1/lists/{$listId}")
            ->assertNoContent();

        $this->assertSoftDeleted('task_lists', ['id' => $listId]);
    }

    public function test_authenticated_user_can_crud_tasks_with_filter_sort_and_pagination(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $list = TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'name' => 'Execution',
        ]);

        $this->postJson('/api/v1/tasks', [
            'list_id' => $list->id,
            'title' => 'Task A',
            'status' => 'todo',
            'priority' => 'high',
            'due_date' => '2026-03-20',
        ])->assertCreated();

        $taskB = $this->postJson('/api/v1/tasks', [
            'list_id' => $list->id,
            'title' => 'Task B',
            'status' => 'todo',
            'priority' => 'high',
            'due_date' => '2026-03-10',
        ])->assertCreated()->json('data');

        $this->postJson('/api/v1/tasks', [
            'list_id' => $list->id,
            'title' => 'Task C',
            'status' => 'done',
            'priority' => 'low',
            'due_date' => '2026-03-25',
        ])->assertCreated();

        $filtered = $this->getJson('/api/v1/tasks?status=todo&priority=high&sort=due_date&per_page=1&page=1');
        $filtered
            ->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('data.0.title', 'Task B');

        $taskId = $taskB['id'];

        $this->patchJson("/api/v1/tasks/{$taskId}", [
            'title' => 'Task B Updated',
            'status' => 'in_progress',
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Task B Updated')
            ->assertJsonPath('data.status', 'in_progress');

        $this->deleteJson("/api/v1/tasks/{$taskId}")
            ->assertNoContent();

        $this->assertSoftDeleted('tasks', ['id' => $taskId]);
    }

    public function test_user_cannot_access_other_tenant_lists_or_tasks(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);

        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $listB = TaskList::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
        ]);

        $taskB = Task::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'list_id' => $listB->id,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson("/api/v1/lists/{$listB->id}")->assertNotFound();
        $this->getJson("/api/v1/tasks/{$taskB->id}")->assertNotFound();
    }

    public function test_guest_cannot_access_tasks_and_lists_routes(): void
    {
        $this->getJson('/api/v1/lists')->assertUnauthorized();
        $this->postJson('/api/v1/lists', ['name' => 'Test'])->assertUnauthorized();
        $this->getJson('/api/v1/tasks')->assertUnauthorized();
        $this->postJson('/api/v1/tasks', ['title' => 'Test'])->assertUnauthorized();
    }
}
