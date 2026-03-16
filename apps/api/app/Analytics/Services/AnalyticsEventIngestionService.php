<?php

namespace App\Analytics\Services;

use App\Models\AnalyticsEvent;
use App\Models\User;
use App\Observability\MetricCounter;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class AnalyticsEventIngestionService
{
    public function __construct(
        private readonly MetricCounter $metrics,
    ) {}

    /**
     * @param  list<array<string, mixed>>  $events
     * @return array{accepted:int,rejected:int}
     */
    public function ingestForUser(User $user, array $events, ?string $traceId = null): array
    {
        $accepted = 0;
        $rejected = 0;

        foreach ($events as $index => $event) {
            $validationErrors = $this->validateEvent($event);
            if ($validationErrors !== []) {
                $rejected++;
                $this->metrics->increment('analytics.events.rejected');
                throw ValidationException::withMessages([
                    "events.{$index}" => $validationErrors,
                ]);
            }

            AnalyticsEvent::query()->create([
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'event_name' => (string) $event['event_name'],
                'event_version' => (string) $event['event_version'],
                'platform' => (string) $event['platform'],
                'module' => (string) $event['module'],
                'session_id' => Arr::get($event, 'session_id'),
                'trace_id' => Arr::get($event, 'trace_id', $traceId),
                'properties' => Arr::get($event, 'properties', []),
                'occurred_at' => (string) $event['occurred_at'],
                'received_at' => now(),
            ]);

            $accepted++;
            $this->metrics->increment('analytics.events.ingested');
        }

        return [
            'accepted' => $accepted,
            'rejected' => $rejected,
        ];
    }

    /**
     * @param  array<string, mixed>  $event
     * @return list<string>
     */
    private function validateEvent(array $event): array
    {
        $errors = [];
        $required = ['event_name', 'event_version', 'occurred_at', 'platform', 'module'];

        foreach ($required as $field) {
            if (! isset($event[$field]) || $event[$field] === '') {
                $errors[] = "Missing required field [{$field}].";
            }
        }

        $allowedEvents = (array) config('analytics.allowed_event_names', []);
        $allowedPlatforms = (array) config('analytics.allowed_platforms', []);
        $allowedModules = (array) config('analytics.allowed_modules', []);

        if (isset($event['event_name']) && ! in_array((string) $event['event_name'], $allowedEvents, true)) {
            $errors[] = 'Event name is not allowed by current taxonomy.';
        }

        if (isset($event['platform']) && ! in_array((string) $event['platform'], $allowedPlatforms, true)) {
            $errors[] = 'Platform is not allowed.';
        }

        if (isset($event['module']) && ! in_array((string) $event['module'], $allowedModules, true)) {
            $errors[] = 'Module is not allowed.';
        }

        return $errors;
    }
}
