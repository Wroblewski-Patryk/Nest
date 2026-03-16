<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationConnectionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_connect_and_revoke_provider_connections(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/integrations/connections')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.status', 'not_connected');

        $this->putJson('/api/v1/integrations/connections/trello', [
            'access_token' => 'trello-access-token',
            'refresh_token' => 'trello-refresh-token',
            'scopes' => ['read', 'write'],
        ])
            ->assertOk()
            ->assertJsonPath('data.provider', 'trello')
            ->assertJsonPath('data.status', 'connected')
            ->assertJsonPath('data.is_connected', true);

        $raw = DB::table('integration_credentials')
            ->where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)
            ->where('provider', 'trello')
            ->first();

        $this->assertNotNull($raw);
        $this->assertNotSame('trello-access-token', $raw->access_token);

        $this->deleteJson('/api/v1/integrations/connections/trello')
            ->assertOk()
            ->assertJsonPath('data.provider', 'trello')
            ->assertJsonPath('data.status', 'revoked')
            ->assertJsonPath('data.is_connected', false)
            ->assertJsonPath('data.revoked_at', fn (?string $value): bool => is_string($value) && $value !== '');

        $this->putJson('/api/v1/integrations/connections/trello', [
            'access_token' => 'trello-access-token-v2',
            'scopes' => ['read'],
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'connected')
            ->assertJsonPath('data.is_connected', true)
            ->assertJsonPath('data.revoked_at', null);
    }

    public function test_connections_are_tenant_and_user_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        Sanctum::actingAs($userA);
        $this->putJson('/api/v1/integrations/connections/google_tasks', [
            'access_token' => 'google-token-a',
            'scopes' => ['tasks.readonly'],
        ])->assertOk();

        Sanctum::actingAs($userB);
        $this->getJson('/api/v1/integrations/connections')
            ->assertOk()
            ->assertJsonPath('data.1.provider', 'google_tasks')
            ->assertJsonPath('data.1.status', 'not_connected');
    }

    public function test_guest_cannot_manage_provider_connections(): void
    {
        $this->getJson('/api/v1/integrations/connections')->assertUnauthorized();
        $this->putJson('/api/v1/integrations/connections/trello', [
            'access_token' => 'token-123456',
        ])->assertUnauthorized();
        $this->deleteJson('/api/v1/integrations/connections/trello')->assertUnauthorized();
    }
}
