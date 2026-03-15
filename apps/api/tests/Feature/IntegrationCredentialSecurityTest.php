<?php

namespace Tests\Feature;

use App\Integrations\Services\IntegrationCredentialVault;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class IntegrationCredentialSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_provider_tokens_are_stored_encrypted_and_resolved_decrypted(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $vault = app(IntegrationCredentialVault::class);
        $vault->store(
            user: $user,
            provider: 'trello',
            accessToken: 'plain-access-token',
            refreshToken: 'plain-refresh-token',
            scopes: ['read', 'write'],
        );

        $rawCredential = DB::table('integration_credentials')->first();
        $this->assertNotNull($rawCredential);
        $this->assertNotSame('plain-access-token', $rawCredential->access_token);
        $this->assertNotSame('plain-refresh-token', $rawCredential->refresh_token);

        $resolved = $vault->activeFor($user, 'trello');
        $this->assertNotNull($resolved);
        $this->assertSame('plain-access-token', $resolved->access_token);
        $this->assertSame('plain-refresh-token', $resolved->refresh_token);
    }

    public function test_revoked_credentials_are_excluded_from_active_lookup(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $vault = app(IntegrationCredentialVault::class);
        $vault->store(
            user: $user,
            provider: 'google_tasks',
            accessToken: 'token-1',
            refreshToken: null,
            scopes: ['tasks.readonly'],
        );

        $this->assertNotNull($vault->activeFor($user, 'google_tasks'));

        $vault->revoke($user, 'google_tasks');

        $this->assertNull($vault->activeFor($user, 'google_tasks'));
        $this->assertDatabaseHas('integration_credentials', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'google_tasks',
        ]);
    }
}
