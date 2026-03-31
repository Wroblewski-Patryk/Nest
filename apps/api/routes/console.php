<?php

use App\AI\Evaluation\CopilotSafetyEvaluationService;
use App\Billing\Services\BillingDunningService;
use App\Jobs\DeleteTenantDataJob;
use App\Notifications\Services\MobilePushReminderService;
use App\Observability\IntegrationSyncSloService;
use App\Observability\MetricCounter;
use App\Security\Services\SecretRotationService;
use App\Security\Services\SecurityControlVerificationService;
use App\Tenancy\Services\TenantDataDeletionService;
use App\Tenancy\Services\TenantDataRetentionService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('ai:copilot-safety-eval {--json} {--strict} {--min-score=}', function (): int {
    $rawMinScore = $this->option('min-score');
    $minScore = is_numeric($rawMinScore) ? (float) $rawMinScore : null;
    $strict = (bool) $this->option('strict');
    $scorecard = app(CopilotSafetyEvaluationService::class)->evaluate($minScore);
    $status = (string) data_get($scorecard, 'summary.status', 'fail');
    $score = (float) data_get($scorecard, 'summary.score_percent', 0);
    $threshold = (float) data_get($scorecard, 'threshold.min_score_percent', 0);

    if ($this->option('json')) {
        $this->line((string) json_encode($scorecard, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info("AI copilot safety eval status: {$status}");
        $this->line("Score: {$score}%");
        $this->line("Minimum required score: {$threshold}%");
        $this->line('Strict mode: '.($strict ? 'enabled' : 'disabled'));
        $this->line('Policy score: '.data_get($scorecard, 'categories.policy.score_percent', 0).'%');
        $this->line('Hallucination score: '.data_get($scorecard, 'categories.hallucination.score_percent', 0).'%');
        $this->line('Action safety score: '.data_get($scorecard, 'categories.action_safety.score_percent', 0).'%');
    }

    if ($status !== 'pass') {
        return self::FAILURE;
    }

    if ($strict) {
        $allCategoriesAtHundred = collect((array) data_get($scorecard, 'categories', []))
            ->every(static fn (array $category): bool => (float) ($category['score_percent'] ?? 0) >= 100.0);

        if (! $allCategoriesAtHundred) {
            return self::FAILURE;
        }
    }

    return self::SUCCESS;
})->purpose('Evaluate policy, hallucination grounding, and action safety for AI copilot release gates');

Artisan::command('integrations:sync-slo-check {--json} {--strict}', function (): int {
    $snapshot = app(IntegrationSyncSloService::class)->evaluateCurrentWindow();
    $severity = (string) ($snapshot['alert']['severity'] ?? 'ok');
    $strict = (bool) $this->option('strict');

    if ($severity === 'critical') {
        Log::error('Integration sync SLO critical alert', $snapshot);
    } elseif ($severity === 'warning') {
        Log::warning('Integration sync SLO warning alert', $snapshot);
    } else {
        Log::info('Integration sync SLO check is healthy', $snapshot);
    }

    if ($this->option('json')) {
        $this->line((string) json_encode($snapshot, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info("Integration sync SLO status: {$severity}");
        $this->line('Strict mode: '.($strict ? 'enabled' : 'disabled'));
        $this->line('Success rate: '.$snapshot['current']['success_rate_percent'].'%');
        $this->line('P95 latency: '.$snapshot['current']['p95_latency_ms'].' ms');
        $this->line('Error budget burn: '.$snapshot['current']['error_budget_burn_percent'].'%');

        $reasons = (array) ($snapshot['alert']['reasons'] ?? []);
        if ($reasons !== []) {
            $this->line('Reasons: '.implode(', ', $reasons));
        }
    }

    if ($severity === 'critical') {
        return self::FAILURE;
    }

    if ($strict && $severity === 'warning') {
        return self::FAILURE;
    }

    return self::SUCCESS;
})->purpose('Evaluate current integration sync SLO window and emit alert signal');

Artisan::command('integrations:event-ingestion-stats {--json} {--strict}', function (): int {
    $strict = (bool) $this->option('strict');
    $metrics = app(MetricCounter::class);
    $received = $metrics->getCurrentCount('integration.events.received');
    $duplicates = $metrics->getCurrentCount('integration.events.duplicate');
    $dropped = $metrics->getCurrentCount('integration.events.dropped');
    $lagCount = max(0, $metrics->getCurrentCount('integration.events.lag.count'));
    $lagSumMs = max(0, $metrics->getCurrentCount('integration.events.lag.sum_ms'));
    $avgLagMs = $lagCount > 0 ? (int) round($lagSumMs / $lagCount) : 0;
    $totalSignals = $received + $duplicates;
    $dropRate = $totalSignals > 0 ? round(($dropped / $totalSignals) * 100, 2) : 0.0;

    $warning = (array) config('observability.integration_event_ingestion.alerts.warning', []);
    $critical = (array) config('observability.integration_event_ingestion.alerts.critical', []);

    $severity = 'ok';
    $reasons = [];

    if (
        $dropRate > (float) ($critical['drop_rate_above_percent'] ?? 10.0)
        || $avgLagMs > (int) ($critical['avg_lag_ms_above'] ?? 180000)
    ) {
        $severity = 'critical';
    } elseif (
        $dropRate > (float) ($warning['drop_rate_above_percent'] ?? 5.0)
        || $avgLagMs > (int) ($warning['avg_lag_ms_above'] ?? 60000)
    ) {
        $severity = 'warning';
    }

    if ($dropRate > 0) {
        $reasons[] = 'drop_rate_above_zero';
    }
    if ($avgLagMs > 0) {
        $reasons[] = 'avg_lag_detected';
    }

    $snapshot = [
        'window' => [
            'received' => $received,
            'duplicates' => $duplicates,
            'dropped' => $dropped,
            'lag_count' => $lagCount,
            'lag_sum_ms' => $lagSumMs,
        ],
        'current' => [
            'drop_rate_percent' => $dropRate,
            'average_lag_ms' => $avgLagMs,
        ],
        'alert' => [
            'severity' => $severity,
            'reasons' => $reasons,
        ],
    ];

    if ($this->option('json')) {
        $this->line((string) json_encode($snapshot, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info("Integration event ingestion status: {$severity}");
        $this->line('Strict mode: '.($strict ? 'enabled' : 'disabled'));
        $this->line("Drop rate: {$dropRate}%");
        $this->line("Average lag: {$avgLagMs} ms");
    }

    if ($severity === 'critical') {
        return self::FAILURE;
    }

    if ($strict && $severity === 'warning') {
        return self::FAILURE;
    }

    return self::SUCCESS;
})->purpose('Evaluate near-real-time integration event ingestion lag and dropped-event rates');

Artisan::command('notifications:send-mobile-reminders {--tenant=} {--json}', function (): int {
    $tenantId = $this->option('tenant');
    $summary = app(MobilePushReminderService::class)->sendKeyReminders(
        is_string($tenantId) && $tenantId !== '' ? $tenantId : null
    );

    if ($this->option('json')) {
        $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info('Mobile push reminders processed.');
        $this->line('Devices: '.$summary['processed_devices']);
        $this->line('Sent: '.$summary['notifications_sent']);
        $this->line('Failed: '.$summary['notifications_failed']);
    }

    return self::SUCCESS;
})->purpose('Send baseline mobile push reminders for due tasks and upcoming calendar events');

Artisan::command('analytics:prune-events {--days=}', function (): int {
    $configured = (int) config('analytics.retention_days', 180);
    $days = (int) ($this->option('days') ?: $configured);
    $cutoff = now()->subDays($days);

    $deleted = DB::table('analytics_events')
        ->where('occurred_at', '<', $cutoff)
        ->delete();

    $this->info('Analytics retention prune completed.');
    $this->line("Retention days: {$days}");
    $this->line("Deleted events: {$deleted}");

    return self::SUCCESS;
})->purpose('Prune analytics events older than configured retention window');

Artisan::command('billing:dunning:run {--tenant=} {--dry-run} {--json}', function (): int {
    $tenantId = $this->option('tenant');
    $summary = app(BillingDunningService::class)->run(
        is_string($tenantId) && $tenantId !== '' ? $tenantId : null,
        (bool) $this->option('dry-run')
    );

    if ($this->option('json')) {
        $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info('Billing dunning run completed.');
        $this->line('Processed subscriptions: '.$summary['processed_subscriptions']);
        $this->line('Attempts created: '.$summary['attempts_created']);
        $this->line('Subscriptions canceled: '.$summary['subscriptions_canceled']);
        $this->line('Skipped not due: '.$summary['skipped_not_due']);
        $this->line('Dry run: '.($summary['dry_run'] ? 'yes' : 'no'));
    }

    return self::SUCCESS;
})->purpose('Execute billing dunning attempts for past_due subscriptions');

Artisan::command('tenants:retention-prune {--tenant=} {--dry-run} {--json}', function (): int {
    $tenantId = $this->option('tenant');
    $summary = app(TenantDataRetentionService::class)->run(
        is_string($tenantId) && $tenantId !== '' ? $tenantId : null,
        (bool) $this->option('dry-run')
    );

    if ($this->option('json')) {
        $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info('Tenant retention workflow completed.');
        $this->line('Rows affected: '.$summary['rows_affected']);
        $this->line('Dry run: '.($summary['dry_run'] ? 'yes' : 'no'));
    }

    return self::SUCCESS;
})->purpose('Run tenant-scoped retention policies with audit output');

Artisan::command('tenants:delete-data {tenant} {--dry-run} {--queue} {--json}', function (string $tenant): int {
    $dryRun = (bool) $this->option('dry-run');
    $queue = (bool) $this->option('queue');

    if ($queue) {
        DeleteTenantDataJob::dispatch($tenant, $dryRun);
        $summary = [
            'workflow' => 'deletion',
            'tenant_id' => $tenant,
            'queued' => true,
            'dry_run' => $dryRun,
        ];
    } else {
        $summary = app(TenantDataDeletionService::class)->run($tenant, $dryRun);
        $summary['queued'] = false;
    }

    if ($this->option('json')) {
        $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info('Tenant deletion workflow processed.');
        $this->line('Tenant: '.$tenant);
        $this->line('Queued: '.($summary['queued'] ? 'yes' : 'no'));
        $this->line('Dry run: '.($summary['dry_run'] ? 'yes' : 'no'));
        if (array_key_exists('rows_affected', $summary)) {
            $this->line('Rows affected: '.$summary['rows_affected']);
        }
    }

    return self::SUCCESS;
})->purpose('Run or queue tenant-scoped data deletion workflow with audit output');

Artisan::command('secrets:rotate {--tenant=} {--dry-run} {--json}', function (): int {
    $tenantId = $this->option('tenant');
    $summary = app(SecretRotationService::class)->rotate(
        is_string($tenantId) && $tenantId !== '' ? $tenantId : null,
        (bool) $this->option('dry-run')
    );

    if ($this->option('json')) {
        $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info('Secret rotation workflow completed.');
        $this->line('Tenant: '.($summary['tenant_id'] ?? 'all'));
        $this->line('Dry run: '.($summary['dry_run'] ? 'yes' : 'no'));
        $this->line('Integration credentials rotated: '.$summary['integration_credentials_rotated']);
        $this->line('Mobile push tokens rotated: '.$summary['mobile_push_tokens_rotated']);
        $this->line('Organization SSO secrets rotated: '.$summary['organization_sso_secrets_rotated']);
        $this->line('Total affected: '.$summary['affected_records']);
    }

    return self::SUCCESS;
})->purpose('Rotate encrypted secrets by re-encrypting credential and token records');

Artisan::command('secrets:credentials:revoke {--tenant=} {--provider=} {--user=} {--dry-run} {--json}', function (): int {
    $tenantId = $this->option('tenant');
    $provider = $this->option('provider');
    $userId = $this->option('user');

    $summary = app(SecretRotationService::class)->revokeCredentials(
        is_string($tenantId) && $tenantId !== '' ? $tenantId : null,
        is_string($provider) && $provider !== '' ? $provider : null,
        is_string($userId) && $userId !== '' ? $userId : null,
        (bool) $this->option('dry-run')
    );

    if ($this->option('json')) {
        $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info('Credential revoke workflow completed.');
        $this->line('Tenant: '.($summary['tenant_id'] ?? 'all'));
        $this->line('Provider: '.($summary['provider'] ?? 'all'));
        $this->line('User: '.($summary['user_id'] ?? 'all'));
        $this->line('Dry run: '.($summary['dry_run'] ? 'yes' : 'no'));
        $this->line('Affected records: '.$summary['affected_records']);
    }

    return self::SUCCESS;
})->purpose('Revoke integration credentials by tenant/provider/user scope');

Artisan::command('security:controls:verify {--json} {--strict}', function (): int {
    $snapshot = app(SecurityControlVerificationService::class)->verify();
    $severity = (string) ($snapshot['severity'] ?? 'ok');
    $strict = (bool) $this->option('strict');

    if ($this->option('json')) {
        $this->line((string) json_encode($snapshot, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $this->info("Security controls status: {$severity}");
        $this->line('Total checks: '.$snapshot['checks_total']);
        $this->line('Failed checks: '.$snapshot['checks_failed']);

        /** @var array<int, array<string, mixed>> $failed */
        $failed = (array) ($snapshot['failed_checks'] ?? []);
        if ($failed !== []) {
            $this->line('Failed control IDs: '.implode(', ', array_map(
                static fn (array $check): string => (string) ($check['id'] ?? 'unknown'),
                $failed
            )));
        }
    }

    if ($severity === 'critical') {
        return self::FAILURE;
    }

    if ($strict && $severity === 'warning') {
        return self::FAILURE;
    }

    return self::SUCCESS;
})->purpose('Verify recurring security controls for CI and staging gates');
