<?php

namespace App\Http\Controllers\Api;

use App\Analytics\Services\AnalyticsExperimentHookService;
use App\Analytics\Services\AnalyticsLoopDecisionDashboardService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsLoopController extends Controller
{
    public function decisionDashboard(Request $request, AnalyticsLoopDecisionDashboardService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'window_days' => ['sometimes', 'integer', 'min:7', 'max:90'],
        ]);

        $snapshot = $service->snapshot(
            user: $user,
            windowDays: isset($payload['window_days']) ? (int) $payload['window_days'] : null
        );

        return response()->json($snapshot);
    }

    public function trackExperimentHook(Request $request, AnalyticsExperimentHookService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'context' => ['required', 'in:onboarding,pricing'],
            'action' => ['required', 'in:exposed,converted'],
            'experiment_key' => ['required', 'string', 'max:120'],
            'variant_key' => ['required', 'string', 'max:64'],
            'platform' => ['sometimes', 'in:web,mobile,api,system'],
            'session_id' => ['nullable', 'string', 'max:120'],
            'trace_id' => ['nullable', 'string', 'max:120'],
            'occurred_at' => ['nullable', 'date'],
            'properties' => ['nullable', 'array'],
        ]);

        $event = $service->track(
            user: $user,
            payload: $payload,
            traceId: (string) $request->attributes->get('trace_id', '')
        );

        return response()->json([
            'data' => $event,
        ], 201);
    }
}
