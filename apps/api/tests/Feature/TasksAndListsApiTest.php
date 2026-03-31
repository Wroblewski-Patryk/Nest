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

    public function test_user_can_recreate_list_name_after_soft_delete(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $first = $this->postJson('/api/v1/lists', [
            'name' => 'Deep Work',
            'color' => '#10B981',
        ])->assertCreated();

        $firstId = $first->json('data.id');

        $this->deleteJson("/api/v1/lists/{$firstId}")->assertNoContent();
        $this->assertSoftDeleted('task_lists', ['id' => $firstId]);

        $second = $this->postJson('/api/v1/lists', [
            'name' => 'Deep Work',
            'color' => '#3B82F6',
        ])->assertCreated();

        $secondId = $second->json('data.id');

        $this->assertNotSame($firstId, $secondId);
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

    public function test_shared_task_assignment_handoff_and_timeline_are_recorded(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'owner-task-assignment@example.com']);
        $member = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'member-task-assignment@example.com']);

        Sanctum::actingAs($owner);
        $list = TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'visibility' => 'private',
            'collaboration_space_id' => null,
        ]);

        $spaceId = (string) $this->postJson('/api/v1/collaboration/spaces', [
            'name' => 'Shared Planning',
        ])->assertCreated()->json('data.id');

        $inviteToken = (string) $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/invites", [
            'email' => $member->email,
            'role' => 'editor',
        ])->assertCreated()->json('data.token');

        $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/share/lists/{$list->id}")
            ->assertOk();

        Sanctum::actingAs($member);
        $this->postJson("/api/v1/collaboration/invites/{$inviteToken}/accept")->assertOk();

        Sanctum::actingAs($owner);
        $taskId = (string) $this->postJson('/api/v1/tasks', [
            'list_id' => $list->id,
            'title' => 'Prepare weekly handoff',
            'assignee_user_id' => $member->id,
            'reminder_owner_user_id' => $member->id,
            'handoff_note' => 'Initial assignment to teammate.',
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($member);
        $this->patchJson("/api/v1/tasks/{$taskId}", [
            'status' => 'in_progress',
            'assignee_user_id' => $owner->id,
            'reminder_owner_user_id' => $owner->id,
            'handoff_note' => 'Handing back after draft complete.',
        ])->assertOk()
            ->assertJsonPath('data.assignee_user_id', $owner->id)
            ->assertJsonPath('data.reminder_owner_user_id', $owner->id);

        Sanctum::actingAs($owner);
        $timeline = $this->getJson("/api/v1/tasks/{$taskId}/assignment-timeline")
            ->assertOk()
            ->json('data');

        $this->assertIsArray($timeline);
        $actions = array_values(array_filter(array_map(
            static fn (mixed $entry): ?string => is_array($entry) ? ($entry['action'] ?? null) : null,
            $timeline
        )));

        $this->assertContains('assigned', $actions);
        $this->assertContains('handoff', $actions);
    }

    public function test_guest_cannot_access_tasks_and_lists_routes(): void
    {
        $this->getJson('/api/v1/lists')->assertUnauthorized();
        $this->postJson('/api/v1/lists', ['name' => 'Test'])->assertUnauthorized();
        $this->getJson('/api/v1/tasks')->assertUnauthorized();
        $this->postJson('/api/v1/tasks', ['title' => 'Test'])->assertUnauthorized();
    }
}
