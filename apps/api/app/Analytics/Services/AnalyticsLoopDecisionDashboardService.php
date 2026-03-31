<?php

namespace App\Analytics\Services;

use App\Models\AnalyticsEvent;
use App\Models\TenantBillingEvent;
use App\Models\TenantSubscription;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class AnalyticsLoopDecisionDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function snapshot(User $user, ?int $windowDays = null): array
    {
        $safeWindowDays = $this->normalizeWindowDays($windowDays);
        $windowEnd = CarbonImmutable::now()->endOfDay();
        $windowStart = $windowEnd->subDays($safeWindowDays - 1)->startOfDay();

        $funnel = $this->funnelMetrics($user, $windowStart, $windowEnd);
        $retention = $this->retentionMetrics($user);
        $monetization = $this->monetizationMetrics($user, $windowStart, $windowEnd);
        $experiments = $this->experimentSummaries($user, $windowStart, $windowEnd);

        return [
            'data' => [
                'generated_at' => CarbonImmutable::now()->toISOString(),
                'window_days' => $safeWindowDays,
                'window_start' => $windowStart->toISOString(),
                'window_end' => $windowEnd->toISOString(),
                'funnel' => $funnel,
                'retention' => $retention,
                'monetization' => $monetization,
                'experiments' => $experiments,
                'weekly_actions' => $this->weeklyActions(
                    $funnel,
                    $retention,
                    $monetization,
                    $experiments
                ),
            ],
        ];
    }

    /**
     * @return array<string, int|float>
     */
    private function funnelMetrics(User $user, CarbonImmutable $windowStart, CarbonImmutable $windowEnd): array
    {
        $signups = User::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereBetween('created_at', [$windowStart, $windowEnd])
            ->count();

        $onboardingCompleted = User::query()
            ->where('tenant_id', $user->tenant_id)
            ->get(['settings'])
            ->filter(function (User $tenantUser) use ($windowStart, $windowEnd): bool {
                $settings = is_array($tenantUser->settings) ? $tenantUser->settings : [];
                $completedAt = $settings['onboarding_completed_at'] ?? null;
                if (! is_string($completedAt) || $completedAt === '') {
                    return false;
                }

                $timestamp = CarbonImmutable::parse($completedAt);

                return $timestamp->betweenIncluded($windowStart, $windowEnd);
            })
            ->count();

        $trialStarted = TenantBillingEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('event_name', 'billing.subscription.trial_started')
            ->whereBetween('occurred_at', [$windowStart, $windowEnd])
            ->count();

        $activated = TenantBillingEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('event_name', 'billing.subscription.activated')
            ->whereBetween('occurred_at', [$windowStart, $windowEnd])
            ->count();

        return [
            'signups' => $signups,
            'onboarding_completed' => $onboardingCompleted,
            'trial_started' => $trialStarted,
            'activated' => $activated,
            'onboarding_completion_rate_percent' => $this->percent($onboardingCompleted, $signups),
            'trial_conversion_rate_percent' => $this->percent($trialStarted, $onboardingCompleted),
            'activation_rate_percent' => $this->percent($activated, $trialStarted),
        ];
    }

    /**
     * @return array<string, int|float>
     */
    private function retentionMetrics(User $user): array
    {
        $now = CarbonImmutable::now()->endOfDay();
        $currentStart = $now->subDays(6)->startOfDay();
        $previousEnd = $currentStart->subSecond();
        $previousStart = $previousEnd->subDays(6)->startOfDay();

        $currentIds = $this->activeUserIds($user, $currentStart, $now);
        $previousIds = $this->activeUserIds($user, $previousStart, $previousEnd);

        $retained = array_values(array_intersect($previousIds, $currentIds));
        $churned = array_values(array_diff($previousIds, $currentIds));

        return [
            'current_active_users' => count($currentIds),
            'previous_active_users' => count($previousIds),
            'retained_users' => count($retained),
            'churned_users' => count($churned),
            'retention_rate_percent' => $this->percent(count($retained), count($previousIds)),
        ];
    }

    /**
     * @return list<string>
     */
    private function activeUserIds(
        User $user,
        CarbonImmutable $windowStart,
        CarbonImmutable $windowEnd
    ): array {
        return AnalyticsEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereBetween('occurred_at', [$windowStart, $windowEnd])
            ->distinct()
            ->pluck('user_id')
            ->map(fn ($userId): string => (string) $userId)
            ->values()
            ->all();
    }

    /**
     * @return array<string, int|float>
     */
    private function monetizationMetrics(User $user, CarbonImmutable $windowStart, CarbonImmutable $windowEnd): array
    {
        /** @var Collection<int, TenantSubscription> $subscriptions */
        $subscriptions = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $user->tenant_id)
            ->get();

        $activeSubscriptions = $subscriptions->where('status', 'active')->count();
        $pastDueSubscriptions = $subscriptions->where('status', 'past_due')->count();
        $canceledSubscriptions = $subscriptions->where('status', 'canceled')->count();

        $estimatedMrrMinor = $subscriptions
            ->where('status', 'active')
            ->sum(function (TenantSubscription $subscription): int {
                $plan = $subscription->plan;
                if ($plan === null) {
                    return 0;
                }

                $price = (int) $plan->price_minor;

                return $plan->billing_interval === 'yearly'
                    ? (int) round($price / 12)
                    : $price;
            });

        $pastDueEvents = TenantBillingEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('event_name', 'billing.subscription.past_due')
            ->whereBetween('occurred_at', [$windowStart, $windowEnd])
            ->count();

        $recoveredEvents = TenantBillingEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('event_name', 'billing.subscription.recovered')
            ->whereBetween('occurred_at', [$windowStart, $windowEnd])
            ->count();

        return [
            'active_subscriptions' => $activeSubscriptions,
            'past_due_subscriptions' => $pastDueSubscriptions,
            'canceled_subscriptions' => $canceledSubscriptions,
            'estimated_mrr_minor' => $estimatedMrrMinor,
            'past_due_events' => $pastDueEvents,
            'recovered_events' => $recoveredEvents,
            'recovery_rate_percent' => $this->percent($recoveredEvents, $pastDueEvents),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function experimentSummaries(
        User $user,
        CarbonImmutable $windowStart,
        CarbonImmutable $windowEnd
    ): array {
        /** @var Collection<int, AnalyticsEvent> $events */
        $events = AnalyticsEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('event_name', [
                'experiments.onboarding.exposed',
                'experiments.onboarding.converted',
                'experiments.pricing.exposed',
                'experiments.pricing.converted',
            ])
            ->whereBetween('occurred_at', [$windowStart, $windowEnd])
            ->orderBy('occurred_at')
            ->get();

        /** @var array<string, array<string, array<string, array{exposed:int,converted:int}>>> $aggregate */
        $aggregate = [];

        foreach ($events as $event) {
            $properties = is_array($event->properties) ? $event->properties : [];
            $experimentKey = isset($properties['experiment_key']) && is_string($properties['experiment_key'])
                ? $properties['experiment_key']
                : 'unknown_experiment';
            $variantKey = isset($properties['variant_key']) && is_string($properties['variant_key'])
                ? $properties['variant_key']
                : 'unknown_variant';

            $parts = explode('.', (string) $event->event_name);
            $context = $parts[1] ?? 'unknown';
            $action = $parts[2] ?? 'exposed';

            if (! isset($aggregate[$context][$experimentKey][$variantKey])) {
                $aggregate[$context][$experimentKey][$variantKey] = [
                    'exposed' => 0,
                    'converted' => 0,
                ];
            }

            if ($action === 'converted') {
                $aggregate[$context][$experimentKey][$variantKey]['converted']++;
            } else {
                $aggregate[$context][$experimentKey][$variantKey]['exposed']++;
            }
        }

        $summaries = [];
        foreach ($aggregate as $context => $experiments) {
            foreach ($experiments as $experimentKey => $variants) {
                $variantRows = [];

                foreach ($variants as $variantKey => $counts) {
                    $variantRows[] = [
                        'variant_key' => $variantKey,
                        'exposed' => $counts['exposed'],
                        'converted' => $counts['converted'],
                        'conversion_rate_percent' => $this->percent($counts['converted'], $counts['exposed']),
                    ];
                }

                usort($variantRows, function (array $left, array $right): int {
                    if ($left['conversion_rate_percent'] === $right['conversion_rate_percent']) {
                        return $right['exposed'] <=> $left['exposed'];
                    }

                    return $right['conversion_rate_percent'] <=> $left['conversion_rate_percent'];
                });

                $summaries[] = [
                    'context' => $context,
                    'experiment_key' => $experimentKey,
                    'variants' => $variantRows,
                    'winner_variant_key' => $variantRows[0]['variant_key'] ?? null,
                ];
            }
        }

        usort($summaries, function (array $left, array $right): int {
            $contextCompare = strcmp((string) $left['context'], (string) $right['context']);
            if ($contextCompare !== 0) {
                return $contextCompare;
            }

            return strcmp((string) $left['experiment_key'], (string) $right['experiment_key']);
        });

        return $summaries;
    }

    /**
     * @param  array<string, int|float>  $funnel
     * @param  array<string, int|float>  $retention
     * @param  array<string, int|float>  $monetization
     * @param  list<array<string, mixed>>  $experiments
     * @return list<string>
     */
    private function weeklyActions(
        array $funnel,
        array $retention,
        array $monetization,
        array $experiments
    ): array {
        $actions = [];

        if ((float) $funnel['onboarding_completion_rate_percent'] < 70.0) {
            $actions[] = 'Onboarding completion is below 70%; test shorter first-run copy and fewer required fields.';
        }

        if ((float) $funnel['activation_rate_percent'] < 45.0) {
            $actions[] = 'Trial-to-activation conversion is below 45%; review pricing and value messaging at checkout.';
        }

        if ((float) $retention['retention_rate_percent'] < 40.0) {
            $actions[] = '7-day retention is below 40%; prioritize re-engagement nudges and first-week habit loops.';
        }

        if ((int) $monetization['past_due_events'] > 0 && (float) $monetization['recovery_rate_percent'] < 60.0) {
            $actions[] = 'Payment recovery is below 60%; tighten dunning cadence and recovery messaging sequence.';
        }

        foreach ($experiments as $experiment) {
            $winner = $experiment['winner_variant_key'] ?? null;
            if (! is_string($winner) || $winner === '') {
                continue;
            }

            $variants = is_array($experiment['variants']) ? $experiment['variants'] : [];
            $winnerRow = collect($variants)
                ->first(fn (array $row): bool => (string) ($row['variant_key'] ?? '') === $winner);
            if ($winnerRow === null) {
                continue;
            }

            $winnerExposed = (int) ($winnerRow['exposed'] ?? 0);
            $winnerRate = (float) ($winnerRow['conversion_rate_percent'] ?? 0.0);
            if ($winnerExposed < 5) {
                continue;
            }

            $actions[] = sprintf(
                'Experiment %s/%s: keep variant "%s" as leader (%.2f%% conversion, n=%d) and continue sampling.',
                (string) ($experiment['context'] ?? 'unknown'),
                (string) ($experiment['experiment_key'] ?? 'unknown'),
                $winner,
                $winnerRate,
                $winnerExposed
            );
        }

        if ($actions === []) {
            return ['No critical growth-loop alerts this week; continue experiment cadence and monitor trend deltas.'];
        }

        return array_values(array_unique($actions));
    }

    private function normalizeWindowDays(?int $windowDays): int
    {
        $value = $windowDays ?? 28;

        return max(7, min($value, 90));
    }

    private function percent(int $numerator, int $denominator): float
    {
        if ($denominator <= 0) {
            return 0.0;
        }

        return round(($numerator / $denominator) * 100, 2);
    }
}
