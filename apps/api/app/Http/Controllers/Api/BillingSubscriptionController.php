<?php

namespace App\Http\Controllers\Api;

use App\Billing\Services\SubscriptionLifecycleService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class BillingSubscriptionController extends Controller
{
    public function show(Request $request, SubscriptionLifecycleService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $subscription = $service->snapshot((string) $user->tenant_id);

        return response()->json([
            'data' => $subscription,
        ]);
    }

    public function startTrial(Request $request, SubscriptionLifecycleService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'plan_code' => ['required', 'string', 'max:64'],
        ]);

        try {
            $subscription = $service->startTrial((string) $user->tenant_id, (string) $payload['plan_code']);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['data' => $subscription], 201);
    }

    public function activate(Request $request, SubscriptionLifecycleService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $subscription = $service->activate((string) $user->tenant_id);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['data' => $subscription]);
    }

    public function markPastDue(Request $request, SubscriptionLifecycleService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $subscription = $service->markPastDue((string) $user->tenant_id);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['data' => $subscription]);
    }

    public function cancel(Request $request, SubscriptionLifecycleService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $subscription = $service->cancel((string) $user->tenant_id);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['data' => $subscription]);
    }
}
