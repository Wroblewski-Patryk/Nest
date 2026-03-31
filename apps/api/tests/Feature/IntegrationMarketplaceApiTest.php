<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IntegrationMarketplaceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_discover_install_uninstall_and_reinstall_provider_from_marketplace(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/integrations/marketplace/providers')
            ->assertOk()
            ->assertJsonPath('meta.total', 7)
            ->assertJsonPath('meta.installed', 0)
            ->assertJsonPath('data.0.provider', 'trello')
            ->assertJsonPath('data.0.install_status', 'not_installed');

        $this->postJson('/api/v1/integrations/marketplace/providers/trello/install', [
            'install_metadata' => ['source' => 'test-suite'],
        ])
            ->assertOk()
            ->assertJsonPath('data.provider', 'trello')
            ->assertJsonPath('data.install_status', 'installed')
            ->assertJsonPath('data.is_installed', true)
            ->assertJsonPath('data.connection.status', 'not_connected');

        $this->putJson('/api/v1/integrations/connections/trello', [
            'access_token' => 'trello-token',
            'scopes' => ['read', 'write'],
        ])->assertOk();

        $this->postJson('/api/v1/integrations/marketplace/providers/trello/uninstall', [
            'reason' => 'temporary disable',
        ])
            ->assertOk()
            ->assertJsonPath('data.install_status', 'uninstalled')
            ->assertJsonPath('data.is_installed', false)
            ->assertJsonPath('data.connection.status', 'revoked');

        $this->postJson('/api/v1/integrations/marketplace/providers/trello/install')
            ->assertOk()
            ->assertJsonPath('data.install_status', 'installed')
            ->assertJsonPath('data.is_installed', true);

        $this->getJson('/api/v1/integrations/marketplace/audits')
            ->assertOk()
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('data.0.action', 'install')
            ->assertJsonPath('data.1.action', 'uninstall')
            ->assertJsonPath('data.2.action', 'install');
    }

    public function test_marketplace_data_is_tenant_and_user_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        Sanctum::actingAs($userA);

        $this->postJson('/api/v1/integrations/marketplace/providers/google_tasks/install')
            ->assertOk();

        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);
        Sanctum::actingAs($userB);

        $this->getJson('/api/v1/integrations/marketplace/providers')
            ->assertOk()
            ->assertJsonPath('meta.installed', 0)
            ->assertJsonPath('data.1.provider', 'google_tasks')
            ->assertJsonPath('data.1.install_status', 'not_installed');

        $this->getJson('/api/v1/integrations/marketplace/audits')
            ->assertOk()
            ->assertJsonPath('meta.total', 0);
    }

    public function test_guest_cannot_access_marketplace_management_endpoints(): void
    {
        $this->getJson('/api/v1/integrations/marketplace/providers')->assertUnauthorized();
        $this->postJson('/api/v1/integrations/marketplace/providers/trello/install')->assertUnauthorized();
        $this->postJson('/api/v1/integrations/marketplace/providers/trello/uninstall')->assertUnauthorized();
        $this->getJson('/api/v1/integrations/marketplace/audits')->assertUnauthorized();
    }
}
