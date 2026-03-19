<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantBillingEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BillingEventsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_billing_events_and_filter_by_event_name(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        TenantBillingEvent::query()->create([
            'tenant_id' => $tenant->id,
            'subscription_id' => null,
            'plan_code' => 'plus',
            'event_name' => 'billing.invoice.paid',
            'event_version' => '1.0',
            'provider' => 'stripe',
            'provider_event_id' => 'evt_paid_1',
            'payload' => [],
            'occurred_at' => now()->subMinute(),
        ]);
        TenantBillingEvent::query()->create([
            'tenant_id' => $tenant->id,
            'subscription_id' => null,
            'plan_code' => 'plus',
            'event_name' => 'billing.invoice.payment_failed',
            'event_version' => '1.0',
            'provider' => 'stripe',
            'provider_event_id' => 'evt_failed_1',
            'payload' => [],
            'occurred_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/billing/events')
            ->assertOk()
            ->assertJsonPath('meta.total', 2);

        $this->getJson('/api/v1/billing/events?event_name=billing.invoice.paid')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.event_name', 'billing.invoice.paid');
    }

    public function test_billing_events_are_tenant_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();

        TenantBillingEvent::query()->create([
            'tenant_id' => $tenantB->id,
            'subscription_id' => null,
            'plan_code' => 'plus',
            'event_name' => 'billing.invoice.paid',
            'event_version' => '1.0',
            'provider' => 'stripe',
            'provider_event_id' => 'evt_other_tenant',
            'payload' => [],
            'occurred_at' => now(),
        ]);

        Sanctum::actingAs($userA);
        $this->getJson('/api/v1/billing/events')
            ->assertOk()
            ->assertJsonPath('meta.total', 0);
    }

    public function test_guest_cannot_access_billing_events_route(): void
    {
        $this->getJson('/api/v1/billing/events')->assertUnauthorized();
    }
}
