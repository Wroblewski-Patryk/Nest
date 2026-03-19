<?php

namespace Tests\Feature;

use App\Models\BillingPlan;
use App\Models\BillingPlanEntitlement;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EntitlementEnforcementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_automation_rule_limit_entitlement_is_enforced(): void
    {
        [$tenant, $user] = $this->seedSubscribedTenantWithEntitlements([
            ['key' => 'automation.rules.max', 'type' => 'limit', 'value' => '1'],
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'name' => 'Rule A',
            'status' => 'active',
            'trigger' => ['type' => 'event', 'event_name' => 'tasks.task.completed'],
            'conditions' => [
                ['field' => 'event.module', 'operator' => 'equals', 'value' => 'tasks'],
            ],
            'actions' => [
                ['type' => 'send_notification', 'payload' => ['message' => 'x']],
            ],
        ];

        $this->postJson('/api/v1/automations/rules', $payload)->assertCreated();

        $this->postJson('/api/v1/automations/rules', [
            ...$payload,
            'name' => 'Rule B',
        ])
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'entitlement_limit_exceeded')
            ->assertJsonPath('error.entitlement', 'automation.rules.max')
            ->assertJsonPath('error.limit', 1);

        $this->assertDatabaseHas('automation_rules', [
            'tenant_id' => $tenant->id,
            'name' => 'Rule A',
        ]);
    }

    public function test_ai_entitlements_gate_weekly_planning_and_feedback_routes(): void
    {
        config()->set('features.ai_surface_enabled', true);
        [, $user] = $this->seedSubscribedTenantWithEntitlements([
            ['key' => 'ai.weekly_planning.enabled', 'type' => 'boolean', 'value' => 'false'],
            ['key' => 'ai.feedback.enabled', 'type' => 'boolean', 'value' => 'false'],
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/weekly-plan/propose', [
            'constraints' => ['available_hours' => 8],
        ])
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'entitlement_denied')
            ->assertJsonPath('error.entitlement', 'ai.weekly_planning.enabled');

        $this->postJson('/api/v1/ai/feedback', [
            'recommendation_id' => 'rec-1',
            'decision' => 'accept',
        ])
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'entitlement_denied')
            ->assertJsonPath('error.entitlement', 'ai.feedback.enabled');
    }

    /**
     * @param  array<int, array{key: string, type: string, value: string}>  $entitlements
     * @return array{Tenant, User}
     */
    private function seedSubscribedTenantWithEntitlements(array $entitlements): array
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $plan = BillingPlan::query()->create([
            'plan_code' => 'pro',
            'display_name' => 'Pro',
            'billing_interval' => 'monthly',
            'price_minor' => 19900,
            'currency' => 'USD',
            'trial_days' => 14,
            'is_public' => true,
            'is_active' => true,
        ]);

        foreach ($entitlements as $entitlement) {
            BillingPlanEntitlement::query()->create([
                'plan_id' => $plan->id,
                'key' => $entitlement['key'],
                'type' => $entitlement['type'],
                'value' => $entitlement['value'],
                'soft_limit' => null,
            ]);
        }

        TenantSubscription::query()->create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'provider' => 'internal',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
        ]);

        return [$tenant, $user];
    }
}
