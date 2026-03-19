<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\SecretRotationAudit;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SecurityControlVerificationCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_controls_command_passes_with_only_warnings_in_non_strict_mode(): void
    {
        $this->artisan('security:controls:verify', ['--json' => true])
            ->assertExitCode(0);
    }

    public function test_security_controls_command_fails_for_critical_sso_protocol_violation(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $organization = Organization::query()->create([
            'tenant_id' => $tenant->id,
            'owner_user_id' => $user->id,
            'name' => 'Critical Org',
            'slug' => 'critical-org',
            'status' => 'active',
        ]);

        DB::table('organization_sso_providers')->insert([
            'id' => (string) str()->uuid(),
            'tenant_id' => $tenant->id,
            'organization_id' => $organization->id,
            'created_by_user_id' => $user->id,
            'protocol' => 'legacy_custom',
            'slug' => 'legacy-custom',
            'display_name' => 'Legacy Custom',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->artisan('security:controls:verify', ['--json' => true])
            ->assertExitCode(1);
    }

    public function test_security_controls_command_fails_in_strict_mode_for_warning_controls(): void
    {
        SecretRotationAudit::query()->create([
            'tenant_id' => null,
            'operation' => 'rotate_secrets',
            'status' => 'completed',
            'affected_records' => 0,
            'scope' => [],
            'metadata' => [],
            'executed_at' => now(),
        ]);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        DB::table('integration_credentials')->insert([
            'id' => (string) str()->uuid(),
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'trello',
            'scopes' => json_encode(['read']),
            'access_token' => encrypt('token'),
            'refresh_token' => null,
            'expires_at' => now()->subDay(),
            'revoked_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->artisan('security:controls:verify', ['--strict' => true, '--json' => true])
            ->assertExitCode(1);
    }
}
