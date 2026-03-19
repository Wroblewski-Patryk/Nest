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
}
