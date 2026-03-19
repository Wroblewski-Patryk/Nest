<?php

namespace Tests\Feature;

use App\Models\BillingPlan;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingWebhookApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_stripe_webhook_updates_subscription_and_is_idempotent(): void
    {
        [$tenant, $subscription] = $this->seedStripeSubscription();

        $payload = [
            'id' => 'evt_test_failed_1',
            'type' => 'invoice.payment_failed',
            'data' => [
                'object' => [
                    'subscription' => $subscription->provider_subscription_id,
                ],
            ],
        ];

        $this->postJson('/api/v1/billing/providers/stripe/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('data.status', 'processed')
            ->assertJsonPath('data.subscription_status', 'past_due');

        $this->assertDatabaseHas('tenant_subscriptions', [
            'id' => $subscription->id,
            'status' => 'past_due',
        ]);
        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'provider_event_id' => 'evt_test_failed_1',
            'event_name' => 'billing.invoice.payment_failed',
        ]);

        $this->postJson('/api/v1/billing/providers/stripe/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('data.status', 'duplicate_ignored');
    }

    public function test_stripe_webhook_rejects_invalid_signature_when_secret_is_configured(): void
    {
        [, $subscription] = $this->seedStripeSubscription();
        config()->set('billing.stripe.webhook_secret', 'secret_123');

        $payload = [
            'id' => 'evt_test_signed_1',
            'type' => 'invoice.paid',
            'data' => [
                'object' => [
                    'subscription' => $subscription->provider_subscription_id,
                ],
            ],
        ];

        $raw = (string) json_encode($payload, JSON_THROW_ON_ERROR);
        $timestamp = (string) now()->timestamp;
        $validSignature = hash_hmac('sha256', "{$timestamp}.{$raw}", 'secret_123');

        $this->call(
            'POST',
            '/api/v1/billing/providers/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$validSignature}",
            ],
            $raw
        )->assertOk();

        $this->call(
            'POST',
            '/api/v1/billing/providers/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1=invalid",
            ],
            $raw
        )
            ->assertStatus(400)
            ->assertJsonPath('message', 'Invalid Stripe webhook signature.');
    }

    public function test_stripe_webhook_is_recorded_as_ignored_when_subscription_cannot_be_resolved(): void
    {
        $payload = [
            'id' => 'evt_test_unknown_1',
            'type' => 'invoice.paid',
            'data' => [
                'object' => [
                    'subscription' => 'sub_missing_123',
                ],
            ],
        ];

        $this->postJson('/api/v1/billing/providers/stripe/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('data.status', 'ignored');

        $this->assertDatabaseHas('billing_webhook_receipts', [
            'provider' => 'stripe',
            'provider_event_id' => 'evt_test_unknown_1',
            'status' => 'ignored',
        ]);
    }

    /**
     * @return array{Tenant, TenantSubscription}
     */
    private function seedStripeSubscription(): array
    {
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
            'status' => 'active',
            'provider' => 'stripe',
            'provider_subscription_id' => 'sub_123',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
        ]);

        return [$tenant, $subscription];
    }
}
