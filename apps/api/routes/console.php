<?php

use App\Jobs\DeleteTenantDataJob;
use App\Notifications\Services\MobilePushReminderService;
use App\Observability\IntegrationSyncSloService;
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
