<?php

use App\Notifications\Services\MobilePushReminderService;
use App\Observability\IntegrationSyncSloService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('integrations:sync-slo-check {--json}', function (): int {
    $snapshot = app(IntegrationSyncSloService::class)->evaluateCurrentWindow();
    $severity = (string) ($snapshot['alert']['severity'] ?? 'ok');

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
        $this->line('Success rate: '.$snapshot['current']['success_rate_percent'].'%');
        $this->line('P95 latency: '.$snapshot['current']['p95_latency_ms'].' ms');
        $this->line('Error budget burn: '.$snapshot['current']['error_budget_burn_percent'].'%');

        $reasons = (array) ($snapshot['alert']['reasons'] ?? []);
        if ($reasons !== []) {
            $this->line('Reasons: '.implode(', ', $reasons));
        }
    }

    return $severity === 'critical' ? self::FAILURE : self::SUCCESS;
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
