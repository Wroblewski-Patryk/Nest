<?php

namespace Tests\Feature;

use App\Integrations\Services\IntegrationCredentialVault;
use App\Models\MobilePushDevice;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\OrganizationSsoProvider;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SecretRotationOperationsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_secrets_rotate_command_reencrypts_scoped_records_and_audits(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $vault = app(IntegrationCredentialVault::class);
        $vault->store(
            user: $user,
            provider: 'trello',
            accessToken: 'rotate-access-token',
            refreshToken: 'rotate-refresh-token',
            scopes: ['read'],
        );

        $device = MobilePushDevice::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'platform' => 'ios',
            'device_label' => 'iPhone',
            'device_token' => 'device-token-123',
            'device_token_hash' => hash('sha256', 'device-token-123'),
            'last_registered_at' => now(),
            'revoked_at' => null,
        ]);

        $organization = Organization::query()->create([
            'tenant_id' => $tenant->id,
            'owner_user_id' => $user->id,
            'name' => 'Rotation Org',
            'slug' => 'rotation-org',
            'status' => 'active',
        ]);

        OrganizationMember::query()->create([
            'tenant_id' => $tenant->id,
            'organization_id' => $organization->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
        ]);

        $provider = OrganizationSsoProvider::query()->create([
            'tenant_id' => $tenant->id,
            'organization_id' => $organization->id,
            'created_by_user_id' => $user->id,
            'protocol' => 'saml',
            'slug' => 'corp-saml',
            'display_name' => 'Corp SAML',
            'status' => 'active',
            'saml_entity_id' => 'urn:rotation:idp',
            'saml_acs_url' => 'https://rotation.example.com/acs',
            'saml_assertion_signing_secret' => 'secret-rotation-signing-key-abcdefghijklmnopqrstuvwxyz',
            'attribute_mapping' => [],
            'allowed_email_domains' => ['rotation.org'],
            'auto_provision_users' => false,
            'require_verified_email' => true,
            'require_signed_assertions' => true,
        ]);

        $rawCredentialBefore = (string) DB::table('integration_credentials')->value('access_token');
        $rawDeviceBefore = (string) DB::table('mobile_push_devices')->value('device_token');
        $rawSsoBefore = (string) DB::table('organization_sso_providers')->value('saml_assertion_signing_secret');

        $this->artisan('secrets:rotate', [
            '--tenant' => $tenant->id,
        ])->assertExitCode(0);

        $rawCredentialAfter = (string) DB::table('integration_credentials')->value('access_token');
        $rawDeviceAfter = (string) DB::table('mobile_push_devices')->value('device_token');
        $rawSsoAfter = (string) DB::table('organization_sso_providers')->value('saml_assertion_signing_secret');

        $this->assertNotSame($rawCredentialBefore, $rawCredentialAfter);
        $this->assertNotSame($rawDeviceBefore, $rawDeviceAfter);
        $this->assertNotSame($rawSsoBefore, $rawSsoAfter);

        $resolvedCredential = $vault->activeFor($user, 'trello');
        $this->assertNotNull($resolvedCredential);
        $this->assertSame('rotate-access-token', $resolvedCredential->access_token);
        $this->assertSame('rotate-refresh-token', $resolvedCredential->refresh_token);

        $this->assertSame('device-token-123', (string) $device->fresh()?->device_token);
        $this->assertSame(
            'secret-rotation-signing-key-abcdefghijklmnopqrstuvwxyz',
            (string) $provider->fresh()?->saml_assertion_signing_secret
        );

        $this->assertDatabaseHas('secret_rotation_audits', [
            'tenant_id' => $tenant->id,
            'operation' => 'rotate_secrets',
            'status' => 'completed',
            'affected_records' => 3,
        ]);
    }

    public function test_secrets_credentials_revoke_command_respects_scope_and_audits(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $userA1 = User::factory()->create(['tenant_id' => $tenantA->id]);
        $userA2 = User::factory()->create(['tenant_id' => $tenantA->id]);
        $userB1 = User::factory()->create(['tenant_id' => $tenantB->id]);

        $vault = app(IntegrationCredentialVault::class);
        $vault->store($userA1, 'trello', 'a1', null, ['read']);
        $vault->store($userA2, 'trello', 'a2', null, ['read']);
        $vault->store($userA1, 'google_tasks', 'a3', null, ['tasks.readonly']);
        $vault->store($userB1, 'trello', 'b1', null, ['read']);

        $this->artisan('secrets:credentials:revoke', [
            '--tenant' => $tenantA->id,
            '--provider' => 'trello',
        ])->assertExitCode(0);

        $this->assertSame(2, DB::table('integration_credentials')
            ->where('tenant_id', $tenantA->id)
            ->where('provider', 'trello')
            ->whereNotNull('revoked_at')
            ->count());

        $this->assertSame(0, DB::table('integration_credentials')
            ->where('tenant_id', $tenantA->id)
            ->where('provider', 'google_tasks')
            ->whereNotNull('revoked_at')
            ->count());

        $this->assertSame(0, DB::table('integration_credentials')
            ->where('tenant_id', $tenantB->id)
            ->where('provider', 'trello')
            ->whereNotNull('revoked_at')
            ->count());

        $this->assertDatabaseHas('secret_rotation_audits', [
            'tenant_id' => $tenantA->id,
            'operation' => 'revoke_credentials',
            'status' => 'completed',
            'affected_records' => 2,
        ]);
    }
}
