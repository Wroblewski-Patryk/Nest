<?php

use App\Observability\IntegrationSyncSloService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
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
