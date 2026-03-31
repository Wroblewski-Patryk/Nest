<?php

namespace Tests\Feature;

use App\Models\AnalyticsEvent;
use App\Models\BillingPlan;
use App\Models\Tenant;
use App\Models\TenantBillingEvent;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsLoopDecisionDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_decision_dashboard_returns_funnel_retention_monetization_and_experiment_metrics(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'settings' => [
                'onboarding_completed_at' => now()->subDay()->toIso8601String(),
            ],
        ]);
        $secondUser = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

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

        $subscription = TenantSubscription::query()->create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'provider' => 'stripe',
            'provider_subscription_id' => 'sub_loop_1',
            'current_period_starts_at' => now()->subDays(5),
            'current_period_ends_at' => now()->addDays(25),
        ]);

        TenantBillingEvent::query()->create([
            'tenant_id' => $tenant->id,
            'subscription_id' => $subscription->id,
            'plan_code' => 'plus',
            'event_name' => 'billing.subscription.trial_started',
            'event_version' => '1.0',
            'provider' => 'stripe',
            'payload' => [],
            'occurred_at' => now()->subDays(4),
        ]);
        TenantBillingEvent::query()->create([
            'tenant_id' => $tenant->id,
            'subscription_id' => $subscription->id,
            'plan_code' => 'plus',
            'event_name' => 'billing.subscription.activated',
            'event_version' => '1.0',
            'provider' => 'stripe',
            'payload' => [],
            'occurred_at' => now()->subDays(3),
        ]);
        TenantBillingEvent::query()->create([
            'tenant_id' => $tenant->id,
            'subscription_id' => $subscription->id,
            'plan_code' => 'plus',
            'event_name' => 'billing.subscription.past_due',
            'event_version' => '1.0',
            'provider' => 'stripe',
            'payload' => [],
            'occurred_at' => now()->subDays(2),
        ]);
        TenantBillingEvent::query()->create([
            'tenant_id' => $tenant->id,
            'subscription_id' => $subscription->id,
            'plan_code' => 'plus',
            'event_name' => 'billing.subscription.recovered',
            'event_version' => '1.0',
            'provider' => 'stripe',
            'payload' => [],
            'occurred_at' => now()->subDay(),
        ]);

        AnalyticsEvent::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'tasks.task.created',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'tasks',
            'properties' => [],
            'occurred_at' => now()->subDays(2),
            'received_at' => now()->subDays(2),
        ]);
        AnalyticsEvent::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'tasks.task.created',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'tasks',
            'properties' => [],
            'occurred_at' => now()->subDays(10),
            'received_at' => now()->subDays(10),
        ]);
        AnalyticsEvent::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $secondUser->id,
            'event_name' => 'tasks.task.created',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'tasks',
            'properties' => [],
            'occurred_at' => now()->subDays(10),
            'received_at' => now()->subDays(10),
        ]);

        AnalyticsEvent::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'experiments.onboarding.exposed',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'analytics',
            'properties' => ['experiment_key' => 'onboarding-copy-v2', 'variant_key' => 'control'],
            'occurred_at' => now()->subHours(8),
            'received_at' => now()->subHours(8),
        ]);
        AnalyticsEvent::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'experiments.onboarding.converted',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'analytics',
            'properties' => ['experiment_key' => 'onboarding-copy-v2', 'variant_key' => 'control'],
            'occurred_at' => now()->subHours(6),
            'received_at' => now()->subHours(6),
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/analytics/loops/decision-dashboard?window_days=28')
            ->assertOk()
            ->assertJsonPath('data.window_days', 28)
            ->assertJsonPath('data.funnel.signups', 2)
            ->assertJsonPath('data.funnel.onboarding_completed', 1)
            ->assertJsonPath('data.funnel.trial_started', 1)
            ->assertJsonPath('data.funnel.activated', 1)
            ->assertJsonPath('data.retention.previous_active_users', 2)
            ->assertJsonPath('data.retention.current_active_users', 1)
            ->assertJsonPath('data.retention.retained_users', 1)
            ->assertJsonPath('data.retention.churned_users', 1)
            ->assertJsonPath('data.monetization.active_subscriptions', 1)
            ->assertJsonPath('data.monetization.estimated_mrr_minor', 9900)
            ->assertJsonPath('data.monetization.past_due_events', 1)
            ->assertJsonPath('data.monetization.recovered_events', 1)
            ->assertJsonPath('data.experiments.0.context', 'onboarding')
            ->assertJsonPath('data.experiments.0.experiment_key', 'onboarding-copy-v2')
            ->assertJsonPath('data.experiments.0.winner_variant_key', 'control');
    }

    public function test_user_can_track_experiment_hook_event(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/analytics/experiments/hook', [
            'context' => 'pricing',
            'action' => 'exposed',
            'experiment_key' => 'pricing-paywall-v3',
            'variant_key' => 'variant_a',
            'platform' => 'web',
            'properties' => [
                'entrypoint' => 'billing_page',
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.context', 'pricing')
            ->assertJsonPath('data.action', 'exposed')
            ->assertJsonPath('data.experiment_key', 'pricing-paywall-v3')
            ->assertJsonPath('data.variant_key', 'variant_a');

        $this->assertDatabaseHas('analytics_events', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'experiments.pricing.exposed',
            'module' => 'analytics',
        ]);
    }

    public function test_guest_cannot_access_growth_loop_analytics_endpoints(): void
    {
        $this->getJson('/api/v1/analytics/loops/decision-dashboard')->assertUnauthorized();
        $this->postJson('/api/v1/analytics/experiments/hook', [
            'context' => 'onboarding',
            'action' => 'exposed',
            'experiment_key' => 'onboarding-copy-v2',
            'variant_key' => 'control',
        ])->assertUnauthorized();
    }
}
