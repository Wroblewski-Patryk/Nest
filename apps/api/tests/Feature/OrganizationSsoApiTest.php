<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\OrganizationSsoProvider;
use App\Models\Tenant;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OrganizationSsoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_oidc_sso_provider(): void
    {
        [$owner, $organization] = $this->createOrganizationWithOwner();

        $this->actingAs($owner)->postJson("/api/v1/orgs/{$organization->id}/sso/providers", [
            'protocol' => 'oidc',
            'display_name' => 'Google Workspace',
            'slug' => 'google-workspace',
            'oidc_issuer' => 'https://accounts.example.com',
            'oidc_client_id' => 'client-123',
            'oidc_jwks_url' => 'https://accounts.example.com/jwks',
            'auto_provision_users' => false,
        ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'google-workspace');

        $this->assertDatabaseHas('organization_sso_providers', [
            'organization_id' => $organization->id,
            'protocol' => 'oidc',
            'slug' => 'google-workspace',
        ]);
    }

    public function test_member_cannot_manage_sso_provider_configuration(): void
    {
        [$owner, $organization] = $this->createOrganizationWithOwner();
        $member = User::factory()->create(['tenant_id' => $owner->tenant_id]);

        OrganizationMember::query()->create([
            'tenant_id' => $owner->tenant_id,
            'organization_id' => $organization->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);

        $this->actingAs($member)->postJson("/api/v1/orgs/{$organization->id}/sso/providers", [
            'protocol' => 'oidc',
            'display_name' => 'Denied Provider',
            'oidc_issuer' => 'https://accounts.example.com',
            'oidc_client_id' => 'client-123',
            'oidc_jwks_url' => 'https://accounts.example.com/jwks',
        ])->assertForbidden();
    }

    public function test_oidc_exchange_links_existing_organization_member(): void
    {
        [$owner, $organization] = $this->createOrganizationWithOwner();
        $member = User::factory()->create([
            'tenant_id' => $owner->tenant_id,
            'email' => 'employee@acme.com',
        ]);

        OrganizationMember::query()->create([
            'tenant_id' => $owner->tenant_id,
            'organization_id' => $organization->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);

        $secret = 'oidc-bridge-secret-abcdefghijklmnopqrstuvwxyz-123456';
        $jwk = [
            'kty' => 'oct',
            'alg' => 'HS256',
            'use' => 'sig',
            'kid' => 'oidc-kid-1',
            'k' => $this->base64UrlEncode($secret),
        ];

        Http::fake([
            'https://accounts.example.com/jwks' => Http::response(['keys' => [$jwk]], 200),
        ]);

        OrganizationSsoProvider::query()->create([
            'tenant_id' => $owner->tenant_id,
            'organization_id' => $organization->id,
            'created_by_user_id' => $owner->id,
            'protocol' => 'oidc',
            'slug' => 'corp-oidc',
            'display_name' => 'Corp OIDC',
            'status' => 'active',
            'oidc_issuer' => 'https://accounts.example.com',
            'oidc_client_id' => 'client-123',
            'oidc_jwks_url' => 'https://accounts.example.com/jwks',
            'attribute_mapping' => [],
            'allowed_email_domains' => ['acme.com'],
            'auto_provision_users' => false,
            'require_verified_email' => true,
            'require_signed_assertions' => true,
        ]);

        $idToken = JWT::encode([
            'iss' => 'https://accounts.example.com',
            'aud' => 'client-123',
            'sub' => 'oidc-user-1',
            'email' => 'employee@acme.com',
            'name' => 'Acme Employee',
            'email_verified' => true,
            'iat' => now()->timestamp,
            'exp' => now()->addHour()->timestamp,
        ], $secret, 'HS256', 'oidc-kid-1');

        $response = $this->postJson("/api/v1/auth/orgs/{$organization->slug}/sso/corp-oidc/exchange", [
            'id_token' => $idToken,
        ])
            ->assertOk();

        $this->assertNotNull($response->json('data.token'));
        $this->assertSame($member->id, $response->json('data.user.id'));
        $this->assertFalse((bool) $response->json('data.created'));
        $this->assertDatabaseHas('organization_sso_identities', [
            'organization_id' => $organization->id,
            'user_id' => $member->id,
            'external_subject' => 'oidc-user-1',
        ]);
    }

    public function test_saml_exchange_auto_provisions_user_when_enabled(): void
    {
        [$owner, $organization] = $this->createOrganizationWithOwner();
        $secret = 'saml-bridge-secret-abcdefghijklmnopqrstuvwxyz-987654';

        OrganizationSsoProvider::query()->create([
            'tenant_id' => $owner->tenant_id,
            'organization_id' => $organization->id,
            'created_by_user_id' => $owner->id,
            'protocol' => 'saml',
            'slug' => 'corp-saml',
            'display_name' => 'Corp SAML',
            'status' => 'active',
            'saml_entity_id' => 'urn:acme:idp',
            'saml_acs_url' => 'https://acme.example.com/sso/acs',
            'saml_assertion_signing_secret' => $secret,
            'attribute_mapping' => [],
            'allowed_email_domains' => ['acme.com'],
            'auto_provision_users' => true,
            'require_verified_email' => true,
            'require_signed_assertions' => true,
        ]);

        $assertionJwt = JWT::encode([
            'sub' => 'saml-subject-1',
            'email' => 'new.user@acme.com',
            'name' => 'New User',
            'email_verified' => true,
            'iat' => now()->timestamp,
            'exp' => now()->addHour()->timestamp,
        ], $secret, 'HS256');

        $response = $this->postJson("/api/v1/auth/orgs/{$organization->slug}/sso/corp-saml/exchange", [
            'saml_assertion_jwt' => $assertionJwt,
        ])
            ->assertOk();

        $this->assertTrue((bool) $response->json('data.created'));
        $userId = (string) $response->json('data.user.id');
        $this->assertDatabaseHas('users', [
            'id' => $userId,
            'tenant_id' => $organization->tenant_id,
            'email' => 'new.user@acme.com',
        ]);
        $this->assertDatabaseHas('organization_members', [
            'organization_id' => $organization->id,
            'user_id' => $userId,
            'status' => 'active',
        ]);
        $this->assertDatabaseHas('organization_sso_identities', [
            'organization_id' => $organization->id,
            'user_id' => $userId,
            'external_subject' => 'saml-subject-1',
        ]);
    }

    public function test_sso_exchange_rejects_email_domain_outside_allowlist(): void
    {
        [$owner, $organization] = $this->createOrganizationWithOwner();
        $secret = 'saml-bridge-secret-abcdefghijklmnopqrstuvwxyz-987654';

        OrganizationSsoProvider::query()->create([
            'tenant_id' => $owner->tenant_id,
            'organization_id' => $organization->id,
            'created_by_user_id' => $owner->id,
            'protocol' => 'saml',
            'slug' => 'corp-saml',
            'display_name' => 'Corp SAML',
            'status' => 'active',
            'saml_entity_id' => 'urn:acme:idp',
            'saml_acs_url' => 'https://acme.example.com/sso/acs',
            'saml_assertion_signing_secret' => $secret,
            'attribute_mapping' => [],
            'allowed_email_domains' => ['acme.com'],
            'auto_provision_users' => true,
            'require_verified_email' => true,
            'require_signed_assertions' => true,
        ]);

        $assertionJwt = JWT::encode([
            'sub' => 'saml-subject-2',
            'email' => 'new.user@outside.org',
            'name' => 'New User',
            'email_verified' => true,
            'iat' => now()->timestamp,
            'exp' => now()->addHour()->timestamp,
        ], $secret, 'HS256');

        $this->postJson("/api/v1/auth/orgs/{$organization->slug}/sso/corp-saml/exchange", [
            'saml_assertion_jwt' => $assertionJwt,
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Email domain is not allowed for this organization SSO provider.');
    }

    /**
     * @return array{User, Organization}
     */
    private function createOrganizationWithOwner(): array
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'owner@acme.com',
        ]);

        $organization = Organization::query()->create([
            'tenant_id' => $tenant->id,
            'owner_user_id' => $owner->id,
            'name' => 'Acme Org',
            'slug' => 'acme-org',
            'status' => 'active',
        ]);

        OrganizationMember::query()->create([
            'tenant_id' => $tenant->id,
            'organization_id' => $organization->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'active',
        ]);

        return [$owner, $organization];
    }

    private function base64UrlEncode(string $input): string
    {
        return rtrim(strtr(base64_encode($input), '+/', '-_'), '=');
    }
}
