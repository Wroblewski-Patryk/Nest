<?php

namespace App\Jobs;

use App\Integrations\Services\IntegrationSyncService;
use App\Models\IntegrationSyncFailure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class ProcessIntegrationSyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    /**
     * @var array<int, int>
     */
    public array $backoff = [15, 60, 300, 900];

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly array $payload
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(IntegrationSyncService $syncService): array
    {
        return $syncService->sync($this->payload);
    }

    public function failed(Throwable $exception): void
    {
        IntegrationSyncFailure::query()->updateOrCreate(
            [
                'provider' => (string) ($this->payload['provider'] ?? 'unknown'),
                'idempotency_key' => (string) ($this->payload['idempotency_key'] ?? 'missing'),
            ],
            [
                'tenant_id' => $this->payload['tenant_id'] ?? null,
                'user_id' => $this->payload['user_id'] ?? null,
                'payload' => $this->payload,
                'error_message' => $exception->getMessage(),
                'attempts' => $this->attempts(),
                'failed_at' => now(),
            ]
        );
    }
}
