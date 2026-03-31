<?php

namespace App\Billing\Services;

use App\Models\BillingDunningAttempt;
use App\Models\TenantBillingEvent;
use App\Models\TenantSubscription;
use Illuminate\Support\Collection;

class BillingDunningService
{
    /**
     * @return array<string, mixed>
     */
    public function run(?string $tenantId = null, bool $dryRun = false): array
    {
        $maxAttempts = (int) config('billing.dunning.max_attempts', 3);
        $attemptIntervalHours = (int) config('billing.dunning.attempt_interval_hours', 24);

        /** @var Collection<int, TenantSubscription> $subscriptions */
        $subscriptions = TenantSubscription::query()
            ->with('plan')
            ->where('status', 'past_due')
            ->when($tenantId !== null && $tenantId !== '', fn ($query) => $query->where('tenant_id', $tenantId))
            ->get();

        $summary = [
            'dry_run' => $dryRun,
            'max_attempts' => $maxAttempts,
            'attempt_interval_hours' => $attemptIntervalHours,
            'processed_subscriptions' => 0,
            'attempts_created' => 0,
            'subscriptions_canceled' => 0,
            'skipped_not_due' => 0,
        ];

        foreach ($subscriptions as $subscription) {
            $summary['processed_subscriptions']++;

            $latestAttempt = BillingDunningAttempt::query()
                ->where('tenant_id', $subscription->tenant_id)
                ->where('subscription_id', $subscription->id)
                ->orderByDesc('attempt_number')
                ->first();

            $nextAttemptNumber = $latestAttempt !== null
                ? ((int) $latestAttempt->attempt_number) + 1
                : 1;

            if (
                $latestAttempt !== null
                && $latestAttempt->processed_at !== null
                && $latestAttempt->processed_at->gt(now()->subHours($attemptIntervalHours))
            ) {
                $summary['skipped_not_due']++;

                continue;
            }

            if ($nextAttemptNumber > $maxAttempts) {
                if (! $dryRun) {
                    $subscription->status = 'canceled';
                    $subscription->canceled_at = now();
                    $subscription->save();

                    TenantBillingEvent::query()->create([
                        'tenant_id' => $subscription->tenant_id,
                        'subscription_id' => $subscription->id,
                        'plan_code' => $subscription->plan->plan_code ?? null,
                        'event_name' => 'billing.dunning.subscription_canceled',
                        'event_version' => '1.0',
                        'provider' => 'stripe',
                        'provider_event_id' => null,
                        'payload' => [
                            'reason' => 'dunning_max_attempts_exceeded',
                            'max_attempts' => $maxAttempts,
                        ],
                        'occurred_at' => now(),
                    ]);
                }

                $summary['subscriptions_canceled']++;

                continue;
            }

            if ($dryRun) {
                $summary['attempts_created']++;

                continue;
            }

            $attempt = BillingDunningAttempt::query()->create([
                'tenant_id' => $subscription->tenant_id,
                'subscription_id' => $subscription->id,
                'attempt_number' => $nextAttemptNumber,
                'status' => 'notice_sent',
                'channel' => 'email',
                'failure_reason' => null,
                'scheduled_at' => now(),
                'processed_at' => now(),
                'metadata' => [
                    'attempt_interval_hours' => $attemptIntervalHours,
                    'max_attempts' => $maxAttempts,
                ],
            ]);

            $event = TenantBillingEvent::query()->create([
                'tenant_id' => $subscription->tenant_id,
                'subscription_id' => $subscription->id,
                'plan_code' => $subscription->plan->plan_code ?? null,
                'event_name' => 'billing.dunning.notice_sent',
                'event_version' => '1.0',
                'provider' => 'stripe',
                'provider_event_id' => (string) $attempt->id,
                'payload' => [
                    'attempt_number' => $nextAttemptNumber,
                    'channel' => 'email',
                ],
                'occurred_at' => now(),
            ]);

            $attempt->billing_event_id = $event->id;
            $attempt->save();

            $summary['attempts_created']++;
        }

        return $summary;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listAttemptsForTenant(string $tenantId, int $limit = 30): array
    {
        $safeLimit = min(max($limit, 1), 200);

        return BillingDunningAttempt::query()
            ->where('tenant_id', $tenantId)
            ->with('subscription')
            ->orderByDesc('processed_at')
            ->limit($safeLimit)
            ->get()
            ->map(fn (BillingDunningAttempt $attempt): array => [
                'id' => (string) $attempt->id,
                'subscription_id' => (string) $attempt->subscription_id,
                'attempt_number' => (int) $attempt->attempt_number,
                'status' => (string) $attempt->status,
                'channel' => (string) $attempt->channel,
                'failure_reason' => $attempt->failure_reason !== null ? (string) $attempt->failure_reason : null,
                'scheduled_at' => $attempt->scheduled_at?->toISOString(),
                'processed_at' => $attempt->processed_at?->toISOString(),
                'recovered_at' => $attempt->recovered_at?->toISOString(),
                'billing_event_id' => $attempt->billing_event_id !== null ? (string) $attempt->billing_event_id : null,
            ])
            ->values()
            ->all();
    }
}
