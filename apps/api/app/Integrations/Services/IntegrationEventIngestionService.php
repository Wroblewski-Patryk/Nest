<?php

namespace App\Integrations\Services;

use App\Jobs\ProcessIntegrationSyncJob;
use App\Models\IntegrationEventIngestion;
use App\Models\User;
use App\Observability\MetricCounter;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class IntegrationEventIngestionService
{
    /**
     * @var list<string>
     */
    private const SUPPORTED_EVENT_PROVIDERS = [
        'trello',
        'todoist',
        'google_calendar',
        'clickup',
        'microsoft_todo',
    ];

    public function __construct(
        private readonly MetricCounter $metrics,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function ingestForUser(User $user, string $provider, array $payload): array
    {
        $provider = $this->validateProvider($provider);
        $eventId = (string) $payload['event_id'];

        $existing = IntegrationEventIngestion::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->where('event_id', $eventId)
            ->first();

        if ($existing !== null) {
            $this->metrics->increment('integration.events.duplicate');
            $this->metrics->increment('integration.events.dropped');

            return [
                'status' => 'duplicate',
                'provider' => $provider,
                'event_id' => $eventId,
                'ingestion_id' => (string) $existing->id,
                'replay_protected' => true,
                'queued' => false,
            ];
        }

        $eventOccurredAt = CarbonImmutable::parse((string) $payload['event_occurred_at']);
        $receivedAt = now();
        $lagMs = (int) max(0, $eventOccurredAt->diffInMilliseconds($receivedAt));
        $entityPayload = is_array($payload['entity_payload'] ?? null) ? $payload['entity_payload'] : [];

        $ingestion = IntegrationEventIngestion::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'provider' => $provider,
            'event_id' => $eventId,
            'event_type' => (string) $payload['event_type'],
            'internal_entity_type' => (string) $payload['internal_entity_type'],
            'internal_entity_id' => (string) $payload['internal_entity_id'],
            'external_id' => isset($payload['external_id']) ? (string) $payload['external_id'] : null,
            'status' => 'queued',
            'lag_ms' => $lagMs,
            'drop_reason' => null,
            'replay_count' => 0,
            'event_occurred_at' => $eventOccurredAt,
            'received_at' => $receivedAt,
            'queued_at' => $receivedAt,
            'processed_at' => null,
            'payload' => $entityPayload,
            'queue_job_id' => null,
        ]);

        $syncPayload = [
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'provider' => $provider,
            'internal_entity_type' => (string) $payload['internal_entity_type'],
            'internal_entity_id' => (string) $payload['internal_entity_id'],
            'external_id' => isset($payload['external_id']) ? (string) $payload['external_id'] : "{$provider}-event-{$eventId}",
            'idempotency_key' => "event:{$provider}:{$eventId}",
            'entity_payload' => $entityPayload,
            'sync_hash' => hash('sha256', json_encode($entityPayload, JSON_THROW_ON_ERROR)),
            'sync_request_id' => (string) $ingestion->id,
            'job_reference' => (string) Str::ulid(),
            'trace_id' => (string) Str::uuid(),
        ];

        try {
            $queueJobId = Queue::connection('database')->pushOn(
                'integrations',
                new ProcessIntegrationSyncJob($syncPayload)
            );
            $ingestion->queue_job_id = is_scalar($queueJobId) ? (string) $queueJobId : null;
            $ingestion->save();

            $this->metrics->increment('integration.events.received');
            $this->recordLagMetrics($lagMs);

            return [
                'status' => 'queued',
                'provider' => $provider,
                'event_id' => $eventId,
                'ingestion_id' => (string) $ingestion->id,
                'replay_protected' => true,
                'queued' => true,
                'lag_ms' => $lagMs,
                'queue_job_id' => $ingestion->queue_job_id,
            ];
        } catch (\Throwable $exception) {
            $ingestion->status = 'dropped';
            $ingestion->drop_reason = 'queue_enqueue_failed';
            $ingestion->save();

            $this->metrics->increment('integration.events.received');
            $this->metrics->increment('integration.events.dropped');
            $this->recordLagMetrics($lagMs);

            throw $exception;
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listIngestionsForUser(
        User $user,
        ?string $provider = null,
        ?string $status = null,
        int $perPage = 50
    ): array {
        $safePerPage = min(max($perPage, 1), 200);
        $query = IntegrationEventIngestion::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->orderByDesc('received_at');

        if ($provider !== null && $provider !== '') {
            $query->where('provider', $provider);
        }

        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        return $query
            ->limit($safePerPage)
            ->get()
            ->map(fn (IntegrationEventIngestion $item): array => [
                'id' => (string) $item->id,
                'provider' => (string) $item->provider,
                'event_id' => (string) $item->event_id,
                'event_type' => (string) $item->event_type,
                'internal_entity_type' => (string) $item->internal_entity_type,
                'internal_entity_id' => (string) $item->internal_entity_id,
                'status' => (string) $item->status,
                'lag_ms' => $item->lag_ms !== null ? (int) $item->lag_ms : null,
                'drop_reason' => $item->drop_reason !== null ? (string) $item->drop_reason : null,
                'replay_count' => (int) $item->replay_count,
                'event_occurred_at' => $item->event_occurred_at?->toISOString(),
                'received_at' => $item->received_at?->toISOString(),
                'queued_at' => $item->queued_at?->toISOString(),
                'processed_at' => $item->processed_at?->toISOString(),
                'queue_job_id' => $item->queue_job_id !== null ? (string) $item->queue_job_id : null,
            ])
            ->values()
            ->all();
    }

    private function validateProvider(string $provider): string
    {
        validator(
            ['provider' => $provider],
            ['provider' => ['required', Rule::in(self::SUPPORTED_EVENT_PROVIDERS)]]
        )->validate();

        return $provider;
    }

    private function recordLagMetrics(int $lagMs): void
    {
        $this->metrics->increment('integration.events.lag.count');
        $this->metrics->increment('integration.events.lag.sum_ms', $lagMs);

        $buckets = [1000, 5000, 15000, 60000, 300000];
        foreach ($buckets as $bucket) {
            if ($lagMs <= $bucket) {
                $this->metrics->increment("integration.events.lag.bucket_{$bucket}");

                return;
            }
        }

        $this->metrics->increment('integration.events.lag.bucket_overflow');
    }
}
