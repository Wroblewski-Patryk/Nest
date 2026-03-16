<?php

namespace App\Http\Controllers\Api;

use App\Analytics\Services\AnalyticsEventIngestionService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsIngestionController extends Controller
{
    public function ingest(Request $request, AnalyticsEventIngestionService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'events' => ['required', 'array', 'min:1', 'max:'.(int) config('analytics.max_batch_size', 100)],
            'events.*.event_name' => ['required', 'string', 'max:120'],
            'events.*.event_version' => ['required', 'string', 'max:16'],
            'events.*.occurred_at' => ['required', 'date'],
            'events.*.platform' => ['required', 'string', 'max:24'],
            'events.*.module' => ['required', 'string', 'max:32'],
            'events.*.session_id' => ['nullable', 'string', 'max:120'],
            'events.*.trace_id' => ['nullable', 'string', 'max:120'],
            'events.*.properties' => ['nullable', 'array'],
        ]);

        $result = $service->ingestForUser(
            user: $user,
            events: $payload['events'],
            traceId: (string) $request->attributes->get('trace_id', ''),
        );

        return response()->json([
            'data' => $result,
        ], 202);
    }
}
