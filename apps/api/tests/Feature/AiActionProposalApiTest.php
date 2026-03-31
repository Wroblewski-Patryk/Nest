<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiActionProposalApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_proposed_create_task_action_requires_approval_and_does_not_write_before_approval(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/actions/proposals', [
            'action_type' => 'create_task',
            'proposal_payload' => [
                'title' => 'AI suggested task',
                'list_id' => $list->id,
                'priority' => 'high',
            ],
        ])->assertCreated();

        $response
            ->assertJsonPath('data.action_type', 'create_task')
            ->assertJsonPath('data.requires_approval', true)
            ->assertJsonPath('data.status', 'pending');

        $this->assertSame(0, Task::query()->count());
    }

    public function test_approving_create_task_action_executes_write_and_records_audit_result(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        Sanctum::actingAs($user);

        $proposalId = (string) $this->postJson('/api/v1/ai/actions/proposals', [
            'action_type' => 'create_task',
            'proposal_payload' => [
                'title' => 'AI approved task',
                'list_id' => $list->id,
                'priority' => 'urgent',
            ],
        ])->assertCreated()->json('data.id');

        $approve = $this->postJson("/api/v1/ai/actions/proposals/{$proposalId}/approve")
            ->assertOk();

        $approve
            ->assertJsonPath('data.status', 'executed')
            ->assertJsonPath('data.execution_result.entity_type', 'task')
            ->assertJsonPath('data.execution_result.action', 'created')
            ->assertJsonPath('data.execution_result.title', 'AI approved task');

        $createdTask = Task::query()->first();
        $this->assertNotNull($createdTask);
        $this->assertSame('AI approved task', $createdTask?->title);
        $this->assertSame('ai_copilot', $createdTask?->source);
    }

    public function test_approving_update_task_status_action_executes_only_after_explicit_approval(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        $task = Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'title' => 'Status candidate',
            'status' => 'todo',
        ]);

        Sanctum::actingAs($user);

        $proposalId = (string) $this->postJson('/api/v1/ai/actions/proposals', [
            'action_type' => 'update_task_status',
            'proposal_payload' => [
                'task_id' => $task->id,
                'status' => 'done',
            ],
        ])->assertCreated()->json('data.id');

        $this->assertSame('todo', (string) $task->fresh()?->status);

        $this->postJson("/api/v1/ai/actions/proposals/{$proposalId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'executed')
            ->assertJsonPath('data.execution_result.status', 'done');

        $task->refresh();
        $this->assertSame('done', (string) $task->status);
        $this->assertNotNull($task->completed_at);
    }

    public function test_rejecting_proposal_keeps_state_without_execution(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        Sanctum::actingAs($user);

        $proposalId = (string) $this->postJson('/api/v1/ai/actions/proposals', [
            'action_type' => 'create_task',
            'proposal_payload' => [
                'title' => 'Task to reject',
                'list_id' => $list->id,
            ],
        ])->assertCreated()->json('data.id');

        $this->postJson("/api/v1/ai/actions/proposals/{$proposalId}/reject", [
            'reason' => 'User rejected',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'User rejected');

        $this->assertSame(0, Task::query()->count());
    }

    public function test_user_cannot_approve_proposal_from_another_tenant(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $listA = TaskList::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id]);

        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        Sanctum::actingAs($userA);
        $proposalId = (string) $this->postJson('/api/v1/ai/actions/proposals', [
            'action_type' => 'create_task',
            'proposal_payload' => [
                'title' => 'Tenant A proposal',
                'list_id' => $listA->id,
            ],
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($userB);
        $this->postJson("/api/v1/ai/actions/proposals/{$proposalId}/approve")
            ->assertNotFound();
    }
}
