<?php

namespace Tests\Feature;

use App\Models\Goal;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CollaborationSpacesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_invite_accept_and_shared_list_enable_co_management(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'owner@example.com']);
        $friend = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'friend@example.com']);
        $outsider = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'outsider@example.com']);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $owner->id]);

        Sanctum::actingAs($owner);
        $spaceResponse = $this->postJson('/api/v1/collaboration/spaces', [
            'name' => 'Family Space',
        ])->assertCreated();
        $spaceId = (string) $spaceResponse->json('data.id');

        $inviteResponse = $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/invites", [
            'email' => $friend->email,
        ])->assertCreated();
        $token = (string) $inviteResponse->json('data.token');

        $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/share/lists/{$list->id}")
            ->assertOk()
            ->assertJsonPath('data.visibility', 'shared');

        Sanctum::actingAs($friend);
        $this->postJson("/api/v1/collaboration/invites/{$token}/accept")
            ->assertOk()
            ->assertJsonPath('data.space_id', $spaceId);

        $this->getJson("/api/v1/lists/{$list->id}")->assertOk();
        $this->patchJson("/api/v1/lists/{$list->id}", [
            'name' => 'Shared Family List',
        ])->assertOk();
        $this->postJson('/api/v1/tasks', [
            'list_id' => $list->id,
            'title' => 'Collaborative task',
        ])->assertCreated();

        Sanctum::actingAs($outsider);
        $this->getJson("/api/v1/lists/{$list->id}")->assertNotFound();
    }

    public function test_shared_goal_is_accessible_to_member_but_private_goal_stays_hidden(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'owner2@example.com']);
        $friend = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'friend2@example.com']);
        $sharedGoal = Goal::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $owner->id]);
        $privateGoal = Goal::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $owner->id]);

        Sanctum::actingAs($owner);
        $spaceResponse = $this->postJson('/api/v1/collaboration/spaces', [
            'name' => 'Planning Space',
        ])->assertCreated();
        $spaceId = (string) $spaceResponse->json('data.id');

        $inviteResponse = $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/invites", [
            'email' => $friend->email,
        ])->assertCreated();
        $token = (string) $inviteResponse->json('data.token');

        $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/share/goals/{$sharedGoal->id}")
            ->assertOk()
            ->assertJsonPath('data.visibility', 'shared');

        Sanctum::actingAs($friend);
        $this->postJson("/api/v1/collaboration/invites/{$token}/accept")->assertOk();

        $this->getJson("/api/v1/goals/{$sharedGoal->id}")->assertOk();
        $this->postJson('/api/v1/targets', [
            'goal_id' => $sharedGoal->id,
            'title' => 'Shared target',
            'metric_type' => 'count',
            'value_target' => 10,
        ])->assertCreated();

        $this->getJson("/api/v1/goals/{$privateGoal->id}")->assertNotFound();
    }

    public function test_viewer_role_can_read_shared_items_but_cannot_modify_them(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'owner3@example.com']);
        $viewer = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'viewer@example.com']);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $owner->id]);
        $goal = Goal::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $owner->id]);

        Sanctum::actingAs($owner);
        $spaceResponse = $this->postJson('/api/v1/collaboration/spaces', [
            'name' => 'Household Space',
        ])->assertCreated();
        $spaceId = (string) $spaceResponse->json('data.id');

        $inviteResponse = $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/invites", [
            'email' => $viewer->email,
            'role' => 'viewer',
        ])->assertCreated();
        $token = (string) $inviteResponse->json('data.token');

        $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/share/lists/{$list->id}")->assertOk();
        $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/share/goals/{$goal->id}")->assertOk();

        Sanctum::actingAs($viewer);
        $this->postJson("/api/v1/collaboration/invites/{$token}/accept")->assertOk();

        $this->getJson("/api/v1/lists/{$list->id}")->assertOk();
        $this->getJson("/api/v1/goals/{$goal->id}")->assertOk();

        $this->patchJson("/api/v1/lists/{$list->id}", [
            'name' => 'Viewer cannot rename',
        ])->assertForbidden();

        $this->postJson('/api/v1/tasks', [
            'list_id' => $list->id,
            'title' => 'Viewer cannot create task',
        ])->assertForbidden();

        $this->patchJson("/api/v1/goals/{$goal->id}", [
            'title' => 'Viewer cannot update goal',
        ])->assertForbidden();

        $this->postJson('/api/v1/targets', [
            'goal_id' => $goal->id,
            'title' => 'Viewer cannot add target',
            'metric_type' => 'count',
            'value_target' => 1,
        ])->assertForbidden();
    }

    public function test_owner_can_promote_viewer_to_editor_and_editor_can_manage_shared_objects(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'owner4@example.com']);
        $member = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'member@example.com']);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $owner->id]);
        $goal = Goal::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $owner->id]);

        Sanctum::actingAs($owner);
        $spaceResponse = $this->postJson('/api/v1/collaboration/spaces', [
            'name' => 'Family Board',
        ])->assertCreated();
        $spaceId = (string) $spaceResponse->json('data.id');

        $inviteResponse = $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/invites", [
            'email' => $member->email,
            'role' => 'viewer',
        ])->assertCreated();
        $token = (string) $inviteResponse->json('data.token');

        $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/share/lists/{$list->id}")->assertOk();
        $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/share/goals/{$goal->id}")->assertOk();

        Sanctum::actingAs($member);
        $this->postJson("/api/v1/collaboration/invites/{$token}/accept")->assertOk();

        Sanctum::actingAs($owner);
        $this->patchJson("/api/v1/collaboration/spaces/{$spaceId}/members/{$member->id}", [
            'role' => 'editor',
        ])->assertOk()
            ->assertJsonPath('data.role', 'editor');

        Sanctum::actingAs($member);
        $this->patchJson("/api/v1/lists/{$list->id}", [
            'name' => 'Editor updated list',
        ])->assertOk();

        $this->postJson('/api/v1/tasks', [
            'list_id' => $list->id,
            'title' => 'Editor task',
        ])->assertCreated();

        $this->patchJson("/api/v1/goals/{$goal->id}", [
            'title' => 'Editor updated goal',
        ])->assertOk();

        $this->postJson('/api/v1/targets', [
            'goal_id' => $goal->id,
            'title' => 'Editor target',
            'metric_type' => 'count',
            'value_target' => 5,
        ])->assertCreated();
    }

    public function test_non_owner_cannot_manage_member_roles_or_membership_lifecycle(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'owner5@example.com']);
        $editor = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'editor5@example.com']);
        $viewer = User::factory()->create(['tenant_id' => $tenant->id, 'email' => 'viewer5@example.com']);

        Sanctum::actingAs($owner);
        $spaceResponse = $this->postJson('/api/v1/collaboration/spaces', [
            'name' => 'Home Ops',
        ])->assertCreated();
        $spaceId = (string) $spaceResponse->json('data.id');

        $editorInvite = $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/invites", [
            'email' => $editor->email,
            'role' => 'editor',
        ])->assertCreated();

        $viewerInvite = $this->postJson("/api/v1/collaboration/spaces/{$spaceId}/invites", [
            'email' => $viewer->email,
            'role' => 'viewer',
        ])->assertCreated();

        Sanctum::actingAs($editor);
        $this->postJson('/api/v1/collaboration/invites/'.(string) $editorInvite->json('data.token').'/accept')->assertOk();
        $this->patchJson("/api/v1/collaboration/spaces/{$spaceId}/members/{$viewer->id}", [
            'role' => 'editor',
        ])->assertNotFound();

        Sanctum::actingAs($viewer);
        $this->postJson('/api/v1/collaboration/invites/'.(string) $viewerInvite->json('data.token').'/accept')->assertOk();

        Sanctum::actingAs($editor);
        $this->deleteJson("/api/v1/collaboration/spaces/{$spaceId}/members/{$viewer->id}")
            ->assertNotFound();
    }
}
