<?php

namespace App\Jobs;

use App\Integrations\Services\IntegrationSyncService;
use App\Models\IntegrationEventIngestion;
use App\Models\IntegrationSyncAudit;
use App\Models\IntegrationSyncFailure;
use App\Observability\MetricCounter;
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
        $result = $syncService->sync($this->payload);

        $ingestion = $this->resolveEventIngestion();
        if ($ingestion !== null) {
            $ingestion->status = 'processed';
            $ingestion->processed_at = now();
            $ingestion->save();
        }

        return $result;
    }

    public function failed(Throwable $exception): void
    {
        $metrics = app(MetricCounter::class);
        $metrics->increment('integration.sync.failed');
        $auditPayload = [
            'tenant_id' => $this->payload['tenant_id'] ?? null,
            'user_id' => $this->payload['user_id'] ?? null,
            'provider' => (string) ($this->payload['provider'] ?? 'unknown'),
            'idempotency_key' => (string) ($this->payload['idempotency_key'] ?? 'missing'),
            'internal_entity_type' => $this->payload['internal_entity_type'] ?? null,
            'internal_entity_id' => $this->payload['internal_entity_id'] ?? null,
            'trace_id' => $this->payload['trace_id'] ?? null,
        ];

        IntegrationSyncAudit::query()->create([
            ...$auditPayload,
            'status' => 'failed',
            'sync_hash' => $this->payload['sync_hash'] ?? null,
            'metadata' => [
                'error_message' => $exception->getMessage(),
                'attempts' => $this->attempts(),
            ],
            'occurred_at' => now(),
        ]);

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

        $ingestion = $this->resolveEventIngestion();
        if ($ingestion !== null) {
            $ingestion->status = 'dropped';
            $ingestion->drop_reason = 'queue_job_failed';
            $ingestion->processed_at = now();
            $ingestion->save();

            $metrics->increment('integration.events.dropped');
        }
    }

    private function resolveEventIngestion(): ?IntegrationEventIngestion
    {
        $syncRequestId = $this->payload['sync_request_id'] ?? null;
        if (! is_string($syncRequestId) || $syncRequestId === '') {
            return null;
        }

        $provider = $this->payload['provider'] ?? null;
        $tenantId = $this->payload['tenant_id'] ?? null;
        $userId = $this->payload['user_id'] ?? null;

        if (
            ! is_string($provider) || $provider === ''
            || ! is_string($tenantId) || $tenantId === ''
            || ! is_string($userId) || $userId === ''
        ) {
            return null;
        }

        return IntegrationEventIngestion::query()
            ->whereKey($syncRequestId)
            ->where('provider', $provider)
            ->where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->first();
    }
}
