<?php

namespace Tests\Feature;

use App\Auth\DelegatedCredentialScopeCatalog;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DelegatedCredentialApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_issue_list_and_revoke_delegated_credentials(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/auth/delegated-credentials', [
            'name' => 'Telegram Agent',
            'scopes' => ['tasks:read', 'tasks:write', 'lists:read'],
            'expires_at' => now()->addDay()->toISOString(),
        ])->assertCreated();

        $credentialId = (int) $create->json('data.credential.id');
        $this->assertIsString($create->json('data.plain_text_token'));
        $this->assertNotSame('', (string) $create->json('data.plain_text_token'));

        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $credentialId,
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);

        $this->getJson('/api/v1/auth/delegated-credentials')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', (string) $credentialId)
            ->assertJsonPath('data.0.name', 'Telegram Agent')
            ->assertJsonPath('data.0.status', 'active');

        $this->postJson("/api/v1/auth/delegated-credentials/{$credentialId}/revoke")
            ->assertOk()
            ->assertJsonPath('data.id', (string) $credentialId)
            ->assertJsonPath('data.status', 'revoked')
            ->assertJsonPath('data.revoked_at', fn (mixed $value): bool => is_string($value) && $value !== '');
    }

    public function test_invalid_scope_is_rejected_when_creating_delegated_credential(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/delegated-credentials', [
            'name' => 'Bad Scope',
            'scopes' => ['tasks:read', 'unknown:scope'],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['scopes.1']);
    }

    public function test_delegated_credential_enforces_scope_and_actor_context(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        TaskList::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        $delegated = $user->createToken(
            name: 'Scoped Agent',
            abilities: [DelegatedCredentialScopeCatalog::MARKER_SCOPE, 'tasks:read'],
            expiresAt: now()->addDay()
        );

        $token = $delegated->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/tasks')
            ->assertOk()
            ->assertHeader('X-Nest-Actor-Type', 'delegated_agent');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/goals')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'forbidden');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/tasks', [
                'title' => 'Blocked write',
            ])
            ->assertForbidden()
            ->assertJsonPath('error.code', 'forbidden');
    }

    public function test_revoked_or_expired_delegated_credentials_are_denied(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $revokedToken = $user->createToken(
            name: 'Revoked Agent',
            abilities: [DelegatedCredentialScopeCatalog::MARKER_SCOPE, 'tasks:read'],
            expiresAt: now()->addDay()
        );

        DB::table('personal_access_tokens')
            ->where('id', $revokedToken->accessToken->id)
            ->update(['revoked_at' => now()]);

        $this->withHeader('Authorization', "Bearer {$revokedToken->plainTextToken}")
            ->getJson('/api/v1/tasks')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'auth_required');

        $expiredToken = $user->createToken(
            name: 'Expired Agent',
            abilities: [DelegatedCredentialScopeCatalog::MARKER_SCOPE, 'tasks:read'],
            expiresAt: now()->subMinute()
        );

        $this->withHeader('Authorization', "Bearer {$expiredToken->plainTextToken}")
            ->getJson('/api/v1/tasks')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'auth_required');
    }
}

