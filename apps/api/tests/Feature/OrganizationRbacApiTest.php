<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrganizationRbacApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_admin_member_permissions_are_enforced_for_org_and_workspace_actions(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $member = User::factory()->create(['tenant_id' => $tenant->id]);
        $extra = User::factory()->create(['tenant_id' => $tenant->id]);

        Sanctum::actingAs($owner);
        $organizationId = (string) $this->postJson('/api/v1/orgs', [
            'name' => 'Org RBAC',
        ])->json('data.id');

        $this->postJson("/api/v1/orgs/{$organizationId}/members", [
            'user_id' => $admin->id,
            'role' => 'admin',
        ])->assertCreated();

        $this->postJson("/api/v1/orgs/{$organizationId}/members", [
            'user_id' => $member->id,
            'role' => 'member',
        ])->assertCreated();

        Sanctum::actingAs($admin);
        $this->postJson("/api/v1/orgs/{$organizationId}/members", [
            'user_id' => $extra->id,
            'role' => 'member',
        ])->assertForbidden();
        $this->postJson('/api/v1/workspaces', [
            'organization_id' => $organizationId,
            'name' => 'Admin Workspace',
        ])->assertCreated();

        Sanctum::actingAs($member);
        $this->postJson('/api/v1/workspaces', [
            'organization_id' => $organizationId,
            'name' => 'Member Workspace',
        ])->assertForbidden();

        Sanctum::actingAs($owner);
        $this->patchJson("/api/v1/orgs/{$organizationId}/members/{$member->id}", [
            'role' => 'admin',
        ])->assertOk();

        Sanctum::actingAs($member);
        $this->postJson('/api/v1/workspaces', [
            'organization_id' => $organizationId,
            'name' => 'Promoted Workspace',
        ])->assertCreated();
    }
}
