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

class BillingSubscriptionLifecycleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscription_lifecycle_supports_trial_active_past_due_and_canceled(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $plan = BillingPlan::query()->create([
            'plan_code' => 'plus',
            'display_name' => 'Plus',
            'billing_interval' => 'monthly',
            'price_minor' => 9900,
            'currency' => 'USD',
            'trial_days' => 14,
            'is_public' => true,
            'is_active' => true,
        ]);
        BillingPlanEntitlement::query()->create([
            'plan_id' => $plan->id,
            'key' => 'automation.rules.max',
            'type' => 'limit',
            'value' => '500',
            'soft_limit' => 450,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/billing/subscription/start-trial', [
            'plan_code' => 'plus',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'trialing');

        $this->postJson('/api/v1/billing/subscription/activate')
            ->assertOk()
            ->assertJsonPath('data.status', 'active');

        $this->postJson('/api/v1/billing/subscription/past-due')
            ->assertOk()
            ->assertJsonPath('data.status', 'past_due');

        $this->postJson('/api/v1/billing/subscription/cancel')
            ->assertOk()
            ->assertJsonPath('data.status', 'canceled');

        $this->getJson('/api/v1/billing/subscription')
            ->assertOk()
            ->assertJsonPath('data.plan.plan_code', 'plus')
            ->assertJsonPath('data.status', 'canceled');

        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'event_name' => 'billing.subscription.trial_started',
        ]);
        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'event_name' => 'billing.subscription.activated',
        ]);
        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'event_name' => 'billing.subscription.past_due',
        ]);
        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'event_name' => 'billing.subscription.canceled',
        ]);
    }

    public function test_subscription_lifecycle_is_tenant_scoped_and_invalid_transitions_are_rejected(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);
        $plan = BillingPlan::query()->create([
            'plan_code' => 'family',
            'display_name' => 'Family',
            'billing_interval' => 'monthly',
            'price_minor' => 14900,
            'currency' => 'USD',
            'trial_days' => 7,
            'is_public' => true,
            'is_active' => true,
        ]);

        TenantSubscription::query()->create([
            'tenant_id' => $tenantA->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'provider' => 'internal',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
        ]);

        Sanctum::actingAs($userB);
        $this->postJson('/api/v1/billing/subscription/activate')
            ->assertStatus(422)
            ->assertJsonPath('message', 'Tenant subscription not found.');

        Sanctum::actingAs($userA);
        $this->postJson('/api/v1/billing/subscription/activate')
            ->assertStatus(422)
            ->assertJsonPath('message', 'Invalid subscription transition for [activate] from state [active].');
    }

    public function test_guest_cannot_access_billing_lifecycle_routes(): void
    {
        $this->getJson('/api/v1/billing/subscription')->assertUnauthorized();
        $this->postJson('/api/v1/billing/subscription/start-trial', ['plan_code' => 'plus'])->assertUnauthorized();
        $this->postJson('/api/v1/billing/subscription/activate')->assertUnauthorized();
        $this->postJson('/api/v1/billing/subscription/past-due')->assertUnauthorized();
        $this->postJson('/api/v1/billing/subscription/cancel')->assertUnauthorized();
    }
}
