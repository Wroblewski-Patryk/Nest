<?php

namespace Tests\Feature;

use App\Auth\DelegatedCredentialScopeCatalog;
use App\Models\ActorBoundaryAudit;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiAgentAccountApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_human_user_can_manage_ai_agent_lifecycle_and_credentials(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($owner);

        $createAgent = $this->postJson('/api/v1/auth/ai-agents', [
            'name' => 'Life Copilot',
        ])->assertCreated();

        $agentId = (string) $createAgent->json('data.id');
        $this->assertDatabaseHas('users', [
            'id' => $agentId,
            'tenant_id' => $tenant->id,
            'owner_user_id' => $owner->id,
            'principal_type' => User::PRINCIPAL_AI_AGENT,
            'agent_status' => User::AGENT_STATUS_ACTIVE,
        ]);

        $this->getJson('/api/v1/auth/ai-agents')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $agentId)
            ->assertJsonPath('data.0.agent_status', User::AGENT_STATUS_ACTIVE);

        $issue = $this->postJson("/api/v1/auth/ai-agents/{$agentId}/credentials", [
            'name' => 'Agent Runtime',
            'scopes' => ['lists:write', 'tasks:read'],
            'expires_at' => now()->addDay()->toISOString(),
        ])->assertCreated();

        $credentialId = (int) $issue->json('data.credential.id');
        $this->assertIsString($issue->json('data.plain_text_token'));

        $this->postJson("/api/v1/auth/ai-agents/{$agentId}/credentials/{$credentialId}/revoke")
            ->assertOk()
            ->assertJsonPath('data.status', 'revoked');

        $this->postJson("/api/v1/auth/ai-agents/{$agentId}/deactivate")
            ->assertOk()
            ->assertJsonPath('data.agent_status', User::AGENT_STATUS_REVOKED);
    }

    public function test_ai_agent_token_observes_scope_and_boundary_rules_with_audit(): void
    {
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id]);
        $agent = User::factory()->create([
            'tenant_id' => $tenant->id,
            'principal_type' => User::PRINCIPAL_AI_AGENT,
            'owner_user_id' => $owner->id,
            'agent_status' => User::AGENT_STATUS_ACTIVE,
        ]);

        $aiToken = $agent->createToken(
            name: 'AI Runtime',
            abilities: [
                DelegatedCredentialScopeCatalog::AI_AGENT_MARKER_SCOPE,
                'lists:write',
                'tasks:read',
            ],
            expiresAt: now()->addDay()
        )->plainTextToken;

        $createList = $this->withHeader('Authorization', "Bearer {$aiToken}")
            ->postJson('/api/v1/lists', [
                'name' => 'Agent Owned List',
            ])->assertCreated()
            ->assertHeader('X-Nest-Actor-Type', 'ai_agent');

        $this->withHeader('Authorization', "Bearer {$aiToken}")
            ->getJson('/api/v1/tasks')
            ->assertOk()
            ->assertHeader('X-Nest-Actor-Type', 'ai_agent');

        $this->withHeader('Authorization', "Bearer {$aiToken}")
            ->getJson('/api/v1/auth/delegated-credentials')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'forbidden');

        $this->assertNotNull($createList->json('data.id'));
        $this->assertDatabaseHas('actor_boundary_audits', [
            'tenant_id' => $tenant->id,
            'user_id' => $agent->id,
            'principal_type' => User::PRINCIPAL_AI_AGENT,
            'token_mode' => 'ai_agent',
            'reason' => 'route_not_allowed',
            'route' => '/api/v1/auth/delegated-credentials',
        ]);
    }

    public function test_boundary_mismatch_is_denied_and_audited(): void
    {
        $tenant = Tenant::factory()->create();
        $human = User::factory()->create(['tenant_id' => $tenant->id]);

        $mismatchedToken = $human->createToken(
            name: 'Bad Marker',
            abilities: [
                DelegatedCredentialScopeCatalog::AI_AGENT_MARKER_SCOPE,
                'tasks:read',
            ],
            expiresAt: now()->addDay()
        )->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$mismatchedToken}")
            ->getJson('/api/v1/tasks')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'forbidden');

        $this->assertDatabaseHas('actor_boundary_audits', [
            'tenant_id' => $tenant->id,
            'user_id' => $human->id,
            'reason' => 'boundary_mismatch',
            'token_mode' => 'ai_agent',
        ]);
    }

    public function test_revoked_ai_agent_principal_is_denied_and_audited(): void
    {
        $tenant = Tenant::factory()->create();
        $human = User::factory()->create(['tenant_id' => $tenant->id]);

        $revokedAgent = User::factory()->create([
            'tenant_id' => $tenant->id,
            'principal_type' => User::PRINCIPAL_AI_AGENT,
            'owner_user_id' => $human->id,
            'agent_status' => User::AGENT_STATUS_REVOKED,
        ]);
        $revokedAgent->forceFill([
            'principal_type' => User::PRINCIPAL_AI_AGENT,
            'agent_status' => User::AGENT_STATUS_REVOKED,
        ])->save();
        $this->assertSame(User::PRINCIPAL_AI_AGENT, (string) $revokedAgent->fresh()->principal_type);

        $revokedToken = $revokedAgent->createToken(
            name: 'Revoked Runtime',
            abilities: [
                DelegatedCredentialScopeCatalog::AI_AGENT_MARKER_SCOPE,
                'tasks:read',
            ],
            expiresAt: now()->addDay()
        )->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$revokedToken}")
            ->getJson('/api/v1/tasks')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'auth_required');

        $audit = ActorBoundaryAudit::query()
            ->where('tenant_id', $tenant->id)
            ->where('user_id', $revokedAgent->id)
            ->where('reason', 'ai_agent_revoked')
            ->first();

        $this->assertNotNull($audit);
    }

    public function test_delegated_token_cannot_access_ai_agent_management_routes(): void
    {
        $tenant = Tenant::factory()->create();
        $human = User::factory()->create(['tenant_id' => $tenant->id]);

        $delegatedToken = $human->createToken(
            name: 'Delegated Runtime',
            abilities: [
                DelegatedCredentialScopeCatalog::MARKER_SCOPE,
                'tasks:read',
            ],
            expiresAt: now()->addDay()
        )->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$delegatedToken}")
            ->getJson('/api/v1/auth/ai-agents')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'forbidden');

        $this->assertDatabaseHas('actor_boundary_audits', [
            'tenant_id' => $tenant->id,
            'user_id' => $human->id,
            'principal_type' => User::PRINCIPAL_HUMAN_USER,
            'token_mode' => 'delegated',
            'reason' => 'route_not_allowed',
            'route' => '/api/v1/auth/ai-agents',
        ]);
    }
}
