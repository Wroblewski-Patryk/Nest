<?php

namespace App\Integrations\Services;

use App\Models\IntegrationSyncFailure;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class IntegrationSyncReplayService
{
    public function __construct(
        private readonly IntegrationSyncService $syncService,
    ) {}

    /**
     * @return LengthAwarePaginator<int, IntegrationSyncFailure>
     */
    public function listFailuresForUser(User $user, ?string $provider, int $perPage, int $page): LengthAwarePaginator
    {
        return IntegrationSyncFailure::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->when($provider !== null && $provider !== '', fn ($query) => $query->where('provider', $provider))
            ->orderByDesc('failed_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * @return array{failure:IntegrationSyncFailure,replay:array<string, mixed>}
     */
    public function replayFailureForUser(User $user, string $failureId): array
    {
        [$failure, $replayPayload, $replayIdempotencyKey] = DB::transaction(function () use ($user, $failureId): array {
            /** @var IntegrationSyncFailure $failure */
            $failure = IntegrationSyncFailure::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->findOrFail($failureId);

            $nextReplayCount = ((int) $failure->replay_count) + 1;
            $replayIdempotencyKey = "{$failure->idempotency_key}:replay:{$nextReplayCount}";
            $replayPayload = is_array($failure->payload) ? $failure->payload : [];
            $replayPayload['idempotency_key'] = $replayIdempotencyKey;
            $replayPayload['trace_id'] = (string) Str::uuid();

            $failure->update([
                'replay_count' => $nextReplayCount,
                'last_replay_idempotency_key' => $replayIdempotencyKey,
            ]);

            return [$failure->fresh(), $replayPayload, $replayIdempotencyKey];
        });

        try {
            $result = $this->syncService->sync($replayPayload);
            $status = (string) ($result['status'] ?? 'success');

            $failure->update([
                'last_replay_status' => $status,
                'last_replay_error' => null,
                'last_replayed_at' => now(),
            ]);

            return [
                'failure' => $failure->fresh(),
                'replay' => [
                    'status' => $status,
                    'idempotency_key' => $replayIdempotencyKey,
                ],
            ];
        } catch (Throwable $exception) {
            $failure->update([
                'last_replay_status' => 'failed',
                'last_replay_error' => $exception->getMessage(),
                'last_replayed_at' => now(),
            ]);

            return [
                'failure' => $failure->fresh(),
                'replay' => [
                    'status' => 'failed',
                    'idempotency_key' => $replayIdempotencyKey,
                    'error' => $exception->getMessage(),
                ],
            ];
        }
    }
}
