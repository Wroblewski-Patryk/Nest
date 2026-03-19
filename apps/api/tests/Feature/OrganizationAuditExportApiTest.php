<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\OrganizationSsoIdentity;
use App\Models\OrganizationSsoProvider;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationAuditExportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_export_organization_audit_as_json(): void
    {
        [$owner, $organization] = $this->seedOrganizationWithSsoEvents();

        $response = $this->actingAs($owner)
            ->getJson("/api/v1/orgs/{$organization->id}/audit-exports?format=json")
            ->assertOk();

        $this->assertGreaterThan(0, count($response->json('data')));
        $this->assertSame('json', $response->json('meta.format'));
    }

    public function test_owner_can_export_organization_audit_as_csv(): void
    {
        [$owner, $organization] = $this->seedOrganizationWithSsoEvents();

        $response = $this->actingAs($owner)
            ->get("/api/v1/orgs/{$organization->id}/audit-exports?format=csv");

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_member_cannot_export_organization_audit(): void
    {
        [$owner, $organization] = $this->seedOrganizationWithSsoEvents();
        $member = User::factory()->create(['tenant_id' => $owner->tenant_id]);

        OrganizationMember::query()->create([
            'tenant_id' => $owner->tenant_id,
            'organization_id' => $organization->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);

        $this->actingAs($member)
            ->getJson("/api/v1/orgs/{$organization->id}/audit-exports")
            ->assertForbidden();
    }

    /**
     * @return array{User, Organization}
     */
    private function seedOrganizationWithSsoEvents(): array
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'owner@audit.org',
        ]);

        $organization = Organization::query()->create([
            'tenant_id' => $tenant->id,
            'owner_user_id' => $owner->id,
            'name' => 'Audit Org',
            'slug' => 'audit-org',
            'status' => 'active',
        ]);

        OrganizationMember::query()->create([
            'tenant_id' => $tenant->id,
            'organization_id' => $organization->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'active',
        ]);

        $provider = OrganizationSsoProvider::query()->create([
            'tenant_id' => $tenant->id,
            'organization_id' => $organization->id,
            'created_by_user_id' => $owner->id,
            'protocol' => 'oidc',
            'slug' => 'corp-oidc',
            'display_name' => 'Corp OIDC',
            'status' => 'active',
            'oidc_issuer' => 'https://issuer.example.com',
            'oidc_client_id' => 'client-123',
            'oidc_jwks_url' => 'https://issuer.example.com/jwks',
            'attribute_mapping' => [],
            'allowed_email_domains' => ['audit.org'],
            'auto_provision_users' => false,
            'require_verified_email' => true,
            'require_signed_assertions' => true,
        ]);

        OrganizationSsoIdentity::query()->create([
            'tenant_id' => $tenant->id,
            'organization_id' => $organization->id,
            'provider_id' => $provider->id,
            'user_id' => $owner->id,
            'external_subject' => 'audit-subject',
            'email' => $owner->email,
            'linked_at' => now(),
        ]);

        return [$owner, $organization];
    }
}
