<?php

namespace App\Observability;

class IntegrationSyncSloService
{
    public function __construct(
        private readonly MetricCounter $metrics,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function evaluateCurrentWindow(): array
    {
        $window = $this->currentWindowMetrics();
        $sloTarget = (float) config('observability.integration_sync.slo.success_rate_percent', 99.0);
        $latencyTarget = (int) config('observability.integration_sync.slo.p95_latency_ms', 2000);
        $allowedErrorRate = max(100 - $sloTarget, 0.0001);
        $errorRate = $window['total'] > 0 ? ($window['failed'] / $window['total']) * 100 : 0.0;
        $successRate = $window['total'] > 0 ? ($window['processed'] / $window['total']) * 100 : 100.0;
        $errorBudgetBurn = ($errorRate / $allowedErrorRate) * 100;
        $p95Latency = $this->approximateP95Latency($window['latency']);

        $snapshot = [
            'window' => $window,
            'slo' => [
                'success_rate_target_percent' => $sloTarget,
                'p95_latency_target_ms' => $latencyTarget,
            ],
            'current' => [
                'success_rate_percent' => round($successRate, 2),
                'error_rate_percent' => round($errorRate, 2),
                'error_budget_burn_percent' => round($errorBudgetBurn, 2),
                'p95_latency_ms' => $p95Latency,
            ],
        ];

        $snapshot['alert'] = $this->evaluateAlert($snapshot);

        return $snapshot;
    }

    /**
     * @param  array<string, mixed>  $snapshot
     * @return array<string, mixed>
     */
    private function evaluateAlert(array $snapshot): array
    {
        $severity = 'ok';
        $reasons = [];

        /** @var array<string, array<string, float|int>> $thresholds */
        $thresholds = (array) config('observability.integration_sync.alerts', []);

        foreach (['critical', 'warning'] as $candidate) {
            $candidateThresholds = $thresholds[$candidate] ?? null;
            if (! is_array($candidateThresholds)) {
                continue;
            }

            $candidateReasons = $this->thresholdViolations($snapshot, $candidateThresholds);
            if ($candidateReasons !== []) {
                $severity = $candidate;
                $reasons = $candidateReasons;
                break;
            }
        }

        return [
            'severity' => $severity,
            'reasons' => $reasons,
        ];
    }

    /**
     * @param  array<string, mixed>  $snapshot
     * @param  array<string, float|int>  $thresholds
     * @return list<string>
     */
    private function thresholdViolations(array $snapshot, array $thresholds): array
    {
        $violations = [];
        $successRate = (float) $snapshot['current']['success_rate_percent'];
        $p95Latency = (int) $snapshot['current']['p95_latency_ms'];
        $errorBudgetBurn = (float) $snapshot['current']['error_budget_burn_percent'];

        if (
            array_key_exists('success_rate_below_percent', $thresholds)
            && $successRate < (float) $thresholds['success_rate_below_percent']
        ) {
            $violations[] = 'success_rate_below_threshold';
        }

        if (
            array_key_exists('p95_latency_above_ms', $thresholds)
            && $p95Latency > (int) $thresholds['p95_latency_above_ms']
        ) {
            $violations[] = 'p95_latency_above_threshold';
        }

        if (
            array_key_exists('error_budget_burn_above_percent', $thresholds)
            && $errorBudgetBurn > (float) $thresholds['error_budget_burn_above_percent']
        ) {
            $violations[] = 'error_budget_burn_above_threshold';
        }

        return $violations;
    }

    /**
     * @param  array<string, int>  $latency
     */
    private function approximateP95Latency(array $latency): int
    {
        $count = max(0, (int) ($latency['count'] ?? 0));
        if ($count === 0) {
            return 0;
        }

        $threshold = (int) ceil($count * 0.95);
        $running = 0;
        $buckets = (array) config('observability.integration_sync.latency_buckets_ms', [100, 250, 500, 1000, 2000, 5000]);

        foreach ($buckets as $bucket) {
            $running += (int) ($latency["bucket_{$bucket}"] ?? 0);
            if ($running >= $threshold) {
                return (int) $bucket;
            }
        }

        return (int) (max($buckets) + 1);
    }

    /**
     * @return array<string, mixed>
     */
    private function currentWindowMetrics(): array
    {
        $latencyBuckets = [];
        $configuredBuckets = (array) config('observability.integration_sync.latency_buckets_ms', [100, 250, 500, 1000, 2000, 5000]);

        foreach ($configuredBuckets as $bucket) {
            $latencyBuckets["bucket_{$bucket}"] = $this->metrics->getCurrentCount("integration.sync.latency.bucket_{$bucket}");
        }

        return [
            'processed' => $this->metrics->getCurrentCount('integration.sync.processed'),
            'failed' => $this->metrics->getCurrentCount('integration.sync.failed'),
            'duplicate' => $this->metrics->getCurrentCount('integration.sync.duplicate'),
            'total' => $this->metrics->getCurrentCount('integration.sync.processed')
                + $this->metrics->getCurrentCount('integration.sync.failed'),
            'latency' => [
                'count' => $this->metrics->getCurrentCount('integration.sync.latency.count'),
                'sum_ms' => $this->metrics->getCurrentCount('integration.sync.latency.sum_ms'),
                ...$latencyBuckets,
                'bucket_overflow' => $this->metrics->getCurrentCount('integration.sync.latency.bucket_overflow'),
            ],
        ];
    }
}
