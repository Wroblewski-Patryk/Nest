<?php

namespace App\Billing\Services;

use App\Models\BillingDunningAttempt;
use App\Models\BillingPlan;
use App\Models\BillingSelfServeSession;
use App\Models\TenantBillingEvent;
use App\Models\TenantSubscription;
use Illuminate\Support\Str;
use InvalidArgumentException;

class BillingSelfServeService
{
    /**
     * @return array<string, mixed>
     */
    public function createCheckoutSession(
        string $tenantId,
        string $planCode,
        ?string $successUrl = null,
        ?string $cancelUrl = null
    ): array {
        $plan = BillingPlan::query()
            ->where('plan_code', $planCode)
            ->where('is_active', true)
            ->first();

        if ($plan === null) {
            throw new InvalidArgumentException('Unknown or inactive billing plan.');
        }

        $subscription = TenantSubscription::query()
            ->where('tenant_id', $tenantId)
            ->first();

        $providerSessionId = 'cs_'.Str::lower((string) Str::ulid());
        $session = BillingSelfServeSession::query()->create([
            'tenant_id' => $tenantId,
            'subscription_id' => $subscription?->id,
            'session_type' => 'checkout',
            'plan_code' => $planCode,
            'provider' => 'stripe',
            'provider_session_id' => $providerSessionId,
            'url' => $this->sessionUrl('checkout', $providerSessionId),
            'status' => 'created',
            'expires_at' => now()->addMinutes(30),
            'metadata' => [
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'currency' => $plan->currency,
                'price_minor' => $plan->price_minor,
                'billing_interval' => $plan->billing_interval,
            ],
        ]);

        $event = $this->recordBillingEvent(
            tenantId: $tenantId,
            subscription: $subscription,
            eventName: 'billing.checkout.session_created',
            providerEventId: $providerSessionId,
            planCodeOverride: $planCode,
            payload: [
                'session_id' => (string) $session->id,
                'session_type' => 'checkout',
                'plan_code' => $planCode,
                'url' => $session->url,
            ],
        );

        return [
            'id' => (string) $session->id,
            'session_type' => 'checkout',
            'provider' => 'stripe',
            'provider_session_id' => $providerSessionId,
            'plan_code' => $planCode,
            'url' => (string) $session->url,
            'status' => (string) $session->status,
            'expires_at' => $session->expires_at?->toISOString(),
            'billing_event_id' => (string) $event->id,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function createPortalSession(string $tenantId, ?string $returnUrl = null): array
    {
        $subscription = $this->requireSubscription($tenantId);
        $providerSessionId = 'bps_'.Str::lower((string) Str::ulid());

        $session = BillingSelfServeSession::query()->create([
            'tenant_id' => $tenantId,
            'subscription_id' => $subscription->id,
            'session_type' => 'portal',
            'plan_code' => $subscription->plan->plan_code ?? null,
            'provider' => 'stripe',
            'provider_session_id' => $providerSessionId,
            'url' => $this->sessionUrl('portal', $providerSessionId),
            'status' => 'created',
            'expires_at' => now()->addMinutes(30),
            'metadata' => [
                'return_url' => $returnUrl,
                'subscription_status' => $subscription->status,
            ],
        ]);

        $event = $this->recordBillingEvent(
            tenantId: $tenantId,
            subscription: $subscription,
            eventName: 'billing.portal.session_created',
            providerEventId: $providerSessionId,
            payload: [
                'session_id' => (string) $session->id,
                'session_type' => 'portal',
                'url' => $session->url,
            ],
        );

        return [
            'id' => (string) $session->id,
            'session_type' => 'portal',
            'provider' => 'stripe',
            'provider_session_id' => $providerSessionId,
            'plan_code' => $subscription->plan->plan_code ?? null,
            'url' => (string) $session->url,
            'status' => (string) $session->status,
            'expires_at' => $session->expires_at?->toISOString(),
            'billing_event_id' => (string) $event->id,
        ];
    }

    public function recoverPastDueSubscription(string $tenantId): TenantSubscription
    {
        $subscription = $this->requireSubscription($tenantId);
        if ($subscription->status !== 'past_due') {
            throw new InvalidArgumentException('Subscription is not in past_due state.');
        }

        $now = now();
        $subscription->status = 'active';
        $subscription->current_period_starts_at = $now;
        $subscription->current_period_ends_at = $now->copy()->addMonth();
        $subscription->canceled_at = null;
        $subscription->save();

        BillingDunningAttempt::query()
            ->where('tenant_id', $tenantId)
            ->where('subscription_id', $subscription->id)
            ->whereNull('recovered_at')
            ->update([
                'status' => 'recovered',
                'recovered_at' => now(),
            ]);

        $this->recordBillingEvent(
            tenantId: $tenantId,
            subscription: $subscription,
            eventName: 'billing.subscription.recovered',
            providerEventId: null,
            payload: [
                'status' => 'active',
                'recovery_source' => 'self_serve',
            ],
        );

        return $subscription->fresh(['plan.entitlements']);
    }

    /**
     * @return array<string, mixed>
     */
    public function reconciliationSnapshot(string $tenantId): array
    {
        $subscription = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $tenantId)
            ->first();

        $events = TenantBillingEvent::query()
            ->where('tenant_id', $tenantId)
            ->orderByDesc('occurred_at')
            ->get();

        $dunningAttempts = BillingDunningAttempt::query()
            ->where('tenant_id', $tenantId)
            ->orderByDesc('processed_at')
            ->get();

        $expectedStatusEvent = $subscription !== null ? match ((string) $subscription->status) {
            'trialing' => 'billing.subscription.trial_started',
            'active' => 'billing.subscription.activated',
            'past_due' => 'billing.subscription.past_due',
            'canceled' => 'billing.subscription.canceled',
            default => null,
        } : null;

        $hasStatusEvent = $expectedStatusEvent !== null
            ? $events->contains(fn (TenantBillingEvent $event): bool => $event->event_name === $expectedStatusEvent)
            : true;

        $dunningWithoutEvent = $dunningAttempts
            ->filter(fn (BillingDunningAttempt $attempt): bool => $attempt->billing_event_id === null)
            ->count();

        return [
            'subscription' => $subscription !== null ? [
                'id' => (string) $subscription->id,
                'status' => (string) $subscription->status,
                'provider' => (string) $subscription->provider,
                'provider_subscription_id' => $subscription->provider_subscription_id,
                'plan_code' => $subscription->plan->plan_code ?? null,
            ] : null,
            'events' => [
                'total' => $events->count(),
                'latest_event' => $events->first()?->event_name,
                'latest_event_at' => $events->first()?->occurred_at?->toISOString(),
                'status_event_expected' => $expectedStatusEvent,
                'status_event_present' => $hasStatusEvent,
            ],
            'dunning' => [
                'attempts_total' => $dunningAttempts->count(),
                'attempts_without_event_link' => $dunningWithoutEvent,
            ],
            'is_reconciled' => $hasStatusEvent && $dunningWithoutEvent === 0,
        ];
    }

    private function requireSubscription(string $tenantId): TenantSubscription
    {
        $subscription = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $tenantId)
            ->first();

        if ($subscription === null) {
            throw new InvalidArgumentException('Tenant subscription not found.');
        }

        return $subscription;
    }

    private function sessionUrl(string $sessionType, string $providerSessionId): string
    {
        return "https://billing.nest.local/{$sessionType}/{$providerSessionId}";
    }

    /**
     * @param  array<string, mixed>|null  $payload
     */
    private function recordBillingEvent(
        string $tenantId,
        ?TenantSubscription $subscription,
        string $eventName,
        ?string $providerEventId,
        ?array $payload,
        ?string $planCodeOverride = null
    ): TenantBillingEvent {
        return TenantBillingEvent::query()->create([
            'tenant_id' => $tenantId,
            'subscription_id' => $subscription?->id,
            'plan_code' => $planCodeOverride ?? $subscription?->plan?->plan_code,
            'event_name' => $eventName,
            'event_version' => '1.0',
            'provider' => 'stripe',
            'provider_event_id' => $providerEventId,
            'payload' => $payload,
            'occurred_at' => now(),
        ]);
    }
}
