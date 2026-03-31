<?php

namespace Tests\Feature;

use App\Models\BillingPlan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BillingSelfServeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_checkout_and_portal_sessions_and_recover_past_due_subscription(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        BillingPlan::query()->create([
            'plan_code' => 'plus',
            'display_name' => 'Plus',
            'billing_interval' => 'monthly',
            'price_minor' => 9900,
            'currency' => 'USD',
            'trial_days' => 14,
            'is_public' => true,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/billing/subscription/start-trial', [
            'plan_code' => 'plus',
        ])->assertCreated();

        $this->postJson('/api/v1/billing/subscription/activate')
            ->assertOk()
            ->assertJsonPath('data.status', 'active');

        $this->postJson('/api/v1/billing/checkout/session', [
            'plan_code' => 'plus',
            'success_url' => 'https://nest.local/billing/success',
            'cancel_url' => 'https://nest.local/billing/cancel',
        ])
            ->assertCreated()
            ->assertJsonPath('data.session_type', 'checkout')
            ->assertJsonPath('data.plan_code', 'plus');

        $this->postJson('/api/v1/billing/portal/session', [
            'return_url' => 'https://nest.local/billing',
        ])
            ->assertCreated()
            ->assertJsonPath('data.session_type', 'portal');

        $this->postJson('/api/v1/billing/subscription/past-due')
            ->assertOk()
            ->assertJsonPath('data.status', 'past_due');

        $this->postJson('/api/v1/billing/subscription/recover')
            ->assertOk()
            ->assertJsonPath('data.status', 'active');

        $this->getJson('/api/v1/billing/dunning/attempts')
            ->assertOk()
            ->assertJsonPath('meta.total', 0);

        $this->getJson('/api/v1/billing/audit/reconciliation')
            ->assertOk()
            ->assertJsonPath('data.subscription.status', 'active')
            ->assertJsonPath('data.is_reconciled', true);

        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'event_name' => 'billing.checkout.session_created',
        ]);
        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'event_name' => 'billing.portal.session_created',
        ]);
        $this->assertDatabaseHas('tenant_billing_events', [
            'tenant_id' => $tenant->id,
            'event_name' => 'billing.subscription.recovered',
        ]);
    }

    public function test_guest_cannot_access_self_serve_billing_endpoints(): void
    {
        $this->postJson('/api/v1/billing/checkout/session', [
            'plan_code' => 'plus',
        ])->assertUnauthorized();
        $this->postJson('/api/v1/billing/portal/session')->assertUnauthorized();
        $this->postJson('/api/v1/billing/subscription/recover')->assertUnauthorized();
        $this->getJson('/api/v1/billing/dunning/attempts')->assertUnauthorized();
        $this->getJson('/api/v1/billing/audit/reconciliation')->assertUnauthorized();
    }
}
