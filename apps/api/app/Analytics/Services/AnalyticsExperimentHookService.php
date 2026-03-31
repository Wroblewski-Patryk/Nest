<?php

namespace App\Analytics\Services;

use App\Models\AnalyticsEvent;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;

class AnalyticsExperimentHookService
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function track(User $user, array $payload, ?string $traceId = null): array
    {
        $context = (string) $payload['context'];
        $action = (string) $payload['action'];
        $experimentKey = (string) $payload['experiment_key'];
        $variantKey = (string) $payload['variant_key'];
        $platform = isset($payload['platform']) && is_string($payload['platform'])
            ? $payload['platform']
            : 'web';
        $occurredAt = isset($payload['occurred_at']) && is_string($payload['occurred_at'])
            ? CarbonImmutable::parse($payload['occurred_at'])
            : CarbonImmutable::now();

        $event = AnalyticsEvent::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'event_name' => "experiments.{$context}.{$action}",
            'event_version' => '1.0',
            'platform' => $platform,
            'module' => 'analytics',
            'session_id' => Arr::get($payload, 'session_id'),
            'trace_id' => is_string(Arr::get($payload, 'trace_id'))
                ? (string) Arr::get($payload, 'trace_id')
                : $traceId,
            'properties' => array_merge(
                [
                    'experiment_key' => $experimentKey,
                    'variant_key' => $variantKey,
                ],
                is_array(Arr::get($payload, 'properties')) ? Arr::get($payload, 'properties') : []
            ),
            'occurred_at' => $occurredAt->toISOString(),
            'received_at' => now(),
        ]);

        return [
            'id' => (string) $event->id,
            'event_name' => (string) $event->event_name,
            'context' => $context,
            'action' => $action,
            'experiment_key' => $experimentKey,
            'variant_key' => $variantKey,
            'platform' => $platform,
            'occurred_at' => $occurredAt->toISOString(),
        ];
    }
}
