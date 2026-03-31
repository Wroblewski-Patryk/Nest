<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiCopilotConversationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_copilot_conversation_endpoint_returns_not_found_when_ai_surface_is_disabled(): void
    {
        config()->set('features.ai_surface_enabled', false);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/copilot/conversation', [
            'message' => 'Plan my week',
        ])->assertNotFound();
    }

    public function test_copilot_conversation_returns_fallback_response_with_explainability_and_references(): void
    {
        config()->set('features.ai_surface_enabled', true);
        config()->set('services.openai.api_key', null);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);

        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'title' => 'Prepare launch retrospective',
            'status' => 'todo',
            'priority' => 'high',
            'due_date' => '2026-04-01',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/copilot/conversation', [
            'message' => 'Can you help me plan priorities for this week?',
            'context' => [
                'window_days' => 14,
                'entity_limit' => 10,
                'as_of' => '2026-03-31T09:00:00Z',
            ],
        ])->assertOk();

        $response
            ->assertJsonPath('data.intent', 'planning')
            ->assertJsonPath('data.provider.mode', 'fallback')
            ->assertJsonPath('data.provider.reason', 'provider_unavailable')
            ->assertJsonPath('data.context_snapshot.schema_version', 'ai-context.v1')
            ->assertJsonPath('data.explainability.strategy', 'copilot-rule-based-context.v1');

        $this->assertNotEmpty((string) $response->json('data.answer'));
        $this->assertNotEmpty($response->json('data.explainability.reason_codes'));
        $this->assertNotEmpty($response->json('data.explainability.source_references'));
    }

    public function test_copilot_conversation_is_tenant_scoped(): void
    {
        config()->set('features.ai_surface_enabled', true);
        config()->set('services.openai.api_key', null);

        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $listA = TaskList::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id]);

        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);
        $listB = TaskList::factory()->create(['tenant_id' => $tenantB->id, 'user_id' => $userB->id]);

        Task::factory()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'list_id' => $listA->id,
            'title' => 'Tenant A planning task',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        Task::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'list_id' => $listB->id,
            'title' => 'Tenant B hidden task',
            'status' => 'todo',
            'priority' => 'urgent',
        ]);

        Sanctum::actingAs($userA);

        $response = $this->postJson('/api/v1/ai/copilot/conversation', [
            'message' => 'What should I do now?',
            'context' => [
                'as_of' => '2026-03-31T09:00:00Z',
            ],
        ])->assertOk();

        $references = collect($response->json('data.source_references'));
        $titles = $references->pluck('title')->filter()->all();

        $this->assertContains('Tenant A planning task', $titles);
        $this->assertNotContains('Tenant B hidden task', $titles);
    }
}
