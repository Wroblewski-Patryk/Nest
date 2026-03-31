<?php

namespace Tests\Feature;

use App\Models\BillingPlan;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingDunningCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_dunning_command_creates_attempts_and_cancels_after_max_attempts(): void
    {
        config()->set('billing.dunning.max_attempts', 2);
        config()->set('billing.dunning.attempt_interval_hours', 0);

        $tenant = Tenant::factory()->create();
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
            'status' => 'past_due',
            'provider' => 'stripe',
            'provider_subscription_id' => 'sub_dunning_1',
            'current_period_starts_at' => now()->subMonth(),
            'current_period_ends_at' => now()->subDay(),
        ]);

        $this->artisan("billing:dunning:run --tenant={$tenant->id} --json")
            ->expectsOutputToContain('"attempts_created": 1')
            ->assertExitCode(0);

        $this->artisan("billing:dunning:run --tenant={$tenant->id} --json")
            ->expectsOutputToContain('"attempts_created": 1')
            ->assertExitCode(0);

        $this->artisan("billing:dunning:run --tenant={$tenant->id} --json")
            ->expectsOutputToContain('"subscriptions_canceled": 1')
            ->assertExitCode(0);

        $this->assertDatabaseHas('billing_dunning_attempts', [
            'tenant_id' => $tenant->id,
            'subscription_id' => $subscription->id,
            'attempt_number' => 1,
            'status' => 'notice_sent',
        ]);
        $this->assertDatabaseHas('billing_dunning_attempts', [
            'tenant_id' => $tenant->id,
            'subscription_id' => $subscription->id,
            'attempt_number' => 2,
            'status' => 'notice_sent',
        ]);
        $this->assertDatabaseHas('tenant_subscriptions', [
            'id' => $subscription->id,
            'status' => 'canceled',
        ]);
        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'event_name' => 'billing.dunning.subscription_canceled',
        ]);
    }

    public function test_dunning_command_supports_dry_run_mode(): void
    {
        $tenant = Tenant::factory()->create();
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
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'past_due',
            'provider' => 'stripe',
            'provider_subscription_id' => 'sub_dunning_2',
            'current_period_starts_at' => now()->subMonth(),
            'current_period_ends_at' => now()->subDay(),
        ]);

        $this->artisan("billing:dunning:run --tenant={$tenant->id} --json --dry-run")
            ->expectsOutputToContain('"dry_run": true')
            ->assertExitCode(0);

        $this->assertDatabaseCount('billing_dunning_attempts', 0);
    }
}
