<?php

namespace App\Integrations\Services;

use App\Models\IntegrationEventIngestion;
use App\Models\IntegrationSyncAudit;
use App\Models\IntegrationSyncFailure;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Validation\Rule;

class IntegrationHealthCenterService
{
    public const DEFAULT_WINDOW_HOURS = 24;

    /**
     * @var list<string>
     */
    private const SUPPORTED_REMEDIATION_ACTIONS = [
        'replay_latest_failure',
        'reconnect_provider',
    ];

    public function __construct(
        private readonly IntegrationMarketplaceService $marketplaceService,
        private readonly IntegrationSyncReplayService $replayService,
    ) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function listForUser(User $user, int $windowHours = self::DEFAULT_WINDOW_HOURS): array
    {
        $safeWindowHours = min(max($windowHours, 1), 168);
        $windowStart = now()->subHours($safeWindowHours);

        /** @var array<string, array<string, mixed>> $catalog */
        $catalog = collect($this->marketplaceService->listCatalogForUser($user))
            ->keyBy('provider')
            ->all();

        $items = [];
        foreach ($catalog as $provider => $catalogItem) {
            $failureBase = IntegrationSyncFailure::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('user_id', $user->id)
                ->where('provider', $provider);

            $failureCount = (clone $failureBase)->count();
            $latestFailure = (clone $failureBase)
                ->orderByDesc('failed_at')
                ->first();

            $syncBase = IntegrationSyncAudit::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('user_id', $user->id)
                ->where('provider', $provider)
                ->where('occurred_at', '>=', $windowStart);

            $successCount = (clone $syncBase)->where('status', 'success')->count();
            $failedCount = (clone $syncBase)->where('status', 'failed')->count();
            $totalSyncCount = max(0, $successCount + $failedCount);
            $successRatePercent = $totalSyncCount > 0
                ? round(($successCount / $totalSyncCount) * 100, 2)
                : 100.0;

            $lastSuccessAt = (clone $syncBase)
                ->where('status', 'success')
                ->max('occurred_at');
            $lastFailureAt = (clone $syncBase)
                ->where('status', 'failed')
                ->max('occurred_at');

            $supportsWebhook = (bool) data_get($catalogItem, 'supports_webhook', false);
            $eventStats = $this->buildEventStats(
                user: $user,
                provider: $provider,
                windowStart: $windowStart,
                supportsWebhook: $supportsWebhook,
            );

            $connectionStatus = (string) data_get($catalogItem, 'connection.status', 'not_connected');
            $isConnected = (bool) data_get($catalogItem, 'connection.is_connected', false);
            [$healthStatus, $riskLevel, $summary] = $this->resolveHealth(
                isConnected: $isConnected,
                failureCount: $failureCount,
                dropRatePercent: (float) ($eventStats['drop_rate_percent'] ?? 0.0),
                successRatePercent: $successRatePercent,
            );

            $oneClickActions = [
                [
                    'action' => 'replay_latest_failure',
                    'label' => 'Replay latest failed sync',
                    'enabled' => $latestFailure !== null,
                ],
            ];

            $guidedFlows = [];
            if ($connectionStatus !== 'connected') {
                $guidedFlows[] = [
                    'action' => 'reconnect_provider',
                    'label' => 'Reconnect provider credentials',
                    'steps' => [
                        'Open Provider Connections.',
                        'Connect or reconnect using least-privilege scopes.',
                        'Run manual force sync and review health status.',
                    ],
                ];
            }

            if ($supportsWebhook && (int) ($eventStats['dropped_count'] ?? 0) > 0) {
                $guidedFlows[] = [
                    'action' => 'verify_webhook_delivery',
                    'label' => 'Verify webhook signature and delivery pipeline',
                    'steps' => [
                        'Confirm provider webhook signature secret configuration.',
                        'Validate webhook endpoint auth and payload schema fields.',
                        'Re-send failed webhook sample and verify ingestion lag/drop recovery.',
                    ],
                ];
            }

            $items[] = [
                'provider' => $provider,
                'display_name' => (string) data_get($catalogItem, 'display_name', $provider),
                'category' => (string) data_get($catalogItem, 'category', 'general'),
                'connection' => data_get($catalogItem, 'connection', [
                    'status' => 'not_connected',
                    'is_connected' => false,
                    'scopes' => [],
                    'expires_at' => null,
                    'updated_at' => null,
                ]),
                'health' => [
                    'status' => $healthStatus,
                    'risk_level' => $riskLevel,
                    'summary' => $summary,
                    'window_hours' => $safeWindowHours,
                ],
                'sync_window' => [
                    'success_count' => $successCount,
                    'failed_count' => $failedCount,
                    'success_rate_percent' => $successRatePercent,
                    'last_success_at' => $this->toIso($lastSuccessAt),
                    'last_failure_at' => $this->toIso($lastFailureAt),
                ],
                'failures' => [
                    'open_count' => $failureCount,
                    'latest' => $latestFailure !== null ? [
                        'id' => (string) $latestFailure->id,
                        'error_message' => (string) $latestFailure->error_message,
                        'failed_at' => $latestFailure->failed_at?->toISOString(),
                        'attempts' => (int) $latestFailure->attempts,
                        'replay_count' => (int) $latestFailure->replay_count,
                        'last_replay_status' => $latestFailure->last_replay_status !== null
                            ? (string) $latestFailure->last_replay_status
                            : null,
                    ] : null,
                ],
                'events' => $eventStats,
                'remediation' => [
                    'one_click_actions' => $oneClickActions,
                    'guided_flows' => $guidedFlows,
                    'runbook_ref' => "docs/operations/integration_health_center_provider_incident_playbooks_v2.md#provider-{$provider}",
                ],
            ];
        }

        return $items;
    }

    /**
     * @return array<string, mixed>
     */
    public function remediateForUser(User $user, string $provider, string $action): array
    {
        $provider = $this->validateProvider($provider);
        validator(
            ['action' => $action],
            ['action' => ['required', Rule::in(self::SUPPORTED_REMEDIATION_ACTIONS)]]
        )->validate();

        if ($action === 'reconnect_provider') {
            return [
                'provider' => $provider,
                'action' => $action,
                'status' => 'guided',
                'message' => 'Reconnect requires guided credential refresh flow.',
                'result' => [
                    'steps' => [
                        'Open Provider Connections.',
                        'Reconnect provider with least-privilege scopes.',
                        'Run force sync and verify health center status returns healthy.',
                    ],
                ],
            ];
        }

        /** @var IntegrationSyncFailure|null $latestFailure */
        $latestFailure = IntegrationSyncFailure::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->orderByDesc('failed_at')
            ->first();

        if ($latestFailure === null) {
            return [
                'provider' => $provider,
                'action' => $action,
                'status' => 'noop',
                'message' => 'No failure found for replay action.',
                'result' => null,
            ];
        }

        $replay = $this->replayService->replayFailureForUser($user, (string) $latestFailure->id);
        $replayStatus = (string) data_get($replay, 'replay.status', 'failed');

        return [
            'provider' => $provider,
            'action' => $action,
            'status' => $replayStatus === 'success' ? 'completed' : 'failed',
            'message' => $replayStatus === 'success'
                ? 'Latest failed sync replayed successfully.'
                : 'Latest failed sync replay did not complete successfully.',
            'result' => [
                'failure' => data_get($replay, 'failure'),
                'replay' => data_get($replay, 'replay'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildEventStats(
        User $user,
        string $provider,
        CarbonInterface $windowStart,
        bool $supportsWebhook,
    ): array {
        if (! $supportsWebhook) {
            return [
                'supports_webhook' => false,
                'received_count' => 0,
                'dropped_count' => 0,
                'drop_rate_percent' => 0.0,
                'average_lag_ms' => 0,
                'last_received_at' => null,
            ];
        }

        $eventBase = IntegrationEventIngestion::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->where('received_at', '>=', $windowStart);

        $receivedCount = (clone $eventBase)->count();
        $droppedCount = (clone $eventBase)->where('status', 'dropped')->count();
        $dropRatePercent = $receivedCount > 0
            ? round(($droppedCount / $receivedCount) * 100, 2)
            : 0.0;
        $averageLag = (int) round((float) ((clone $eventBase)->avg('lag_ms') ?? 0));
        $lastReceivedAt = (clone $eventBase)->max('received_at');

        return [
            'supports_webhook' => true,
            'received_count' => $receivedCount,
            'dropped_count' => $droppedCount,
            'drop_rate_percent' => $dropRatePercent,
            'average_lag_ms' => $averageLag,
            'last_received_at' => $this->toIso($lastReceivedAt),
        ];
    }

    /**
     * @return array{0:string,1:string,2:string}
     */
    private function resolveHealth(
        bool $isConnected,
        int $failureCount,
        float $dropRatePercent,
        float $successRatePercent,
    ): array {
        if (! $isConnected) {
            return ['disconnected', 'high', 'Provider is not connected.'];
        }

        if ($failureCount > 0 || $dropRatePercent > 0 || $successRatePercent < 95.0) {
            return ['degraded', 'medium', 'Sync health degraded. Remediation recommended.'];
        }

        return ['healthy', 'low', 'Provider sync health is stable.'];
    }

    private function validateProvider(string $provider): string
    {
        validator(
            ['provider' => $provider],
            ['provider' => ['required', Rule::in(IntegrationConnectionService::SUPPORTED_PROVIDERS)]]
        )->validate();

        return $provider;
    }

    private function toIso(mixed $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        return CarbonImmutable::parse($value)->toISOString();
    }
}
