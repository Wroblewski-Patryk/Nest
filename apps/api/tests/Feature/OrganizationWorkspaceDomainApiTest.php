<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrganizationWorkspaceDomainApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_organization_add_member_and_create_workspace(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id]);
        $member = User::factory()->create(['tenant_id' => $tenant->id]);

        Sanctum::actingAs($owner);

        $organizationResponse = $this->postJson('/api/v1/orgs', [
            'name' => 'Household Org',
        ])->assertCreated();
        $organizationId = (string) $organizationResponse->json('data.id');

        $this->postJson("/api/v1/orgs/{$organizationId}/members", [
            'user_id' => $member->id,
            'role' => 'admin',
        ])->assertCreated();

        $workspaceResponse = $this->postJson('/api/v1/workspaces', [
            'organization_id' => $organizationId,
            'name' => 'Family Workspace',
        ])->assertCreated();

        $this->assertDatabaseHas('workspaces', [
            'id' => (string) $workspaceResponse->json('data.id'),
            'tenant_id' => $tenant->id,
            'organization_id' => $organizationId,
        ]);

        Sanctum::actingAs($member);
        $this->getJson('/api/v1/orgs')
            ->assertOk()
            ->assertJsonPath('data.0.id', $organizationId);
        $this->getJson('/api/v1/workspaces')
            ->assertOk()
            ->assertJsonPath('data.0.organization_id', $organizationId);
    }

    public function test_organization_workspace_apis_are_tenant_scoped_and_guest_protected(): void
    {
        $tenantA = Tenant::factory()->create();
        $ownerA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        Sanctum::actingAs($ownerA);
        $organizationId = (string) $this->postJson('/api/v1/orgs', [
            'name' => 'Tenant A Org',
        ])->json('data.id');

        Sanctum::actingAs($userB);
        $this->postJson("/api/v1/orgs/{$organizationId}/members", [
            'user_id' => $userB->id,
            'role' => 'member',
        ])->assertNotFound();

        auth()->forgetGuards();
        $this->getJson('/api/v1/orgs')->assertUnauthorized();
    }
}
