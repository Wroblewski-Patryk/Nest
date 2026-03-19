<?php

namespace App\Billing\Services;

use App\Models\BillingPlan;
use App\Models\TenantBillingEvent;
use App\Models\TenantSubscription;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

class SubscriptionLifecycleService
{
    public function snapshot(string $tenantId): ?TenantSubscription
    {
        return TenantSubscription::query()
            ->with(['plan.entitlements'])
            ->where('tenant_id', $tenantId)
            ->first();
    }

    public function startTrial(string $tenantId, string $planCode): TenantSubscription
    {
        $plan = BillingPlan::query()
            ->where('plan_code', $planCode)
            ->where('is_active', true)
            ->first();

        if ($plan === null) {
            throw new InvalidArgumentException('Unknown or inactive billing plan.');
        }

        $now = now();
        $trialEndsAt = $plan->trial_days > 0 ? $now->copy()->addDays((int) $plan->trial_days) : null;

        $subscription = TenantSubscription::query()->updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'plan_id' => $plan->id,
                'status' => 'trialing',
                'provider' => 'internal',
                'trial_ends_at' => $trialEndsAt,
                'current_period_starts_at' => $now,
                'current_period_ends_at' => $now->copy()->addMonth(),
                'canceled_at' => null,
            ]
        );

        $this->recordEvent($tenantId, $subscription, 'billing.subscription.trial_started');

        return $subscription->fresh(['plan.entitlements']);
    }

    public function activate(string $tenantId): TenantSubscription
    {
        $subscription = $this->requireSubscription($tenantId);
        $this->assertTransitionAllowed($subscription->status, ['trialing', 'past_due'], 'activate');

        $now = now();
        $subscription->status = 'active';
        $subscription->current_period_starts_at = $now;
        $subscription->current_period_ends_at = $now->copy()->addMonth();
        $subscription->canceled_at = null;
        $subscription->save();

        $this->recordEvent($tenantId, $subscription, 'billing.subscription.activated');

        return $subscription->fresh(['plan.entitlements']);
    }

    public function markPastDue(string $tenantId): TenantSubscription
    {
        $subscription = $this->requireSubscription($tenantId);
        $this->assertTransitionAllowed($subscription->status, ['active'], 'mark_past_due');

        $subscription->status = 'past_due';
        $subscription->save();

        $this->recordEvent($tenantId, $subscription, 'billing.subscription.past_due');

        return $subscription->fresh(['plan.entitlements']);
    }

    public function cancel(string $tenantId): TenantSubscription
    {
        $subscription = $this->requireSubscription($tenantId);
        $this->assertTransitionAllowed($subscription->status, ['trialing', 'active', 'past_due'], 'cancel');

        $subscription->status = 'canceled';
        $subscription->canceled_at = now();
        $subscription->save();

        $this->recordEvent($tenantId, $subscription, 'billing.subscription.canceled');

        return $subscription->fresh(['plan.entitlements']);
    }

    private function requireSubscription(string $tenantId): TenantSubscription
    {
        $subscription = TenantSubscription::query()
            ->where('tenant_id', $tenantId)
            ->first();

        if ($subscription === null) {
            throw new InvalidArgumentException('Tenant subscription not found.');
        }

        return $subscription;
    }

    /**
     * @param  list<string>  $allowedFrom
     */
    private function assertTransitionAllowed(string $fromState, array $allowedFrom, string $operation): void
    {
        if (! in_array($fromState, $allowedFrom, true)) {
            throw new InvalidArgumentException(
                "Invalid subscription transition for [{$operation}] from state [{$fromState}]."
            );
        }
    }

    private function recordEvent(string $tenantId, TenantSubscription $subscription, string $eventName): void
    {
        TenantBillingEvent::query()->create([
            'tenant_id' => $tenantId,
            'subscription_id' => $subscription->id,
            'plan_code' => $subscription->plan->plan_code ?? null,
            'event_name' => $eventName,
            'event_version' => '1.0',
            'provider' => 'internal',
            'provider_event_id' => null,
            'payload' => [
                'status' => $subscription->status,
                'current_period_starts_at' => $this->toIso($subscription->current_period_starts_at),
                'current_period_ends_at' => $this->toIso($subscription->current_period_ends_at),
                'trial_ends_at' => $this->toIso($subscription->trial_ends_at),
                'canceled_at' => $this->toIso($subscription->canceled_at),
            ],
            'occurred_at' => now(),
        ]);
    }

    private function toIso(mixed $value): ?string
    {
        if (! $value instanceof Carbon) {
            return null;
        }

        return $value->toIso8601String();
    }
}
