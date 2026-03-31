<?php

namespace App\Http\Controllers\Api;

use App\Billing\Services\BillingDunningService;
use App\Billing\Services\BillingSelfServeService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class BillingSelfServeController extends Controller
{
    public function checkoutSession(Request $request, BillingSelfServeService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'plan_code' => ['required', 'string', 'max:64'],
            'success_url' => ['nullable', 'string', 'max:2048'],
            'cancel_url' => ['nullable', 'string', 'max:2048'],
        ]);

        try {
            $session = $service->createCheckoutSession(
                tenantId: (string) $user->tenant_id,
                planCode: (string) $payload['plan_code'],
                successUrl: isset($payload['success_url']) ? (string) $payload['success_url'] : null,
                cancelUrl: isset($payload['cancel_url']) ? (string) $payload['cancel_url'] : null,
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json([
            'data' => $session,
        ], 201);
    }

    public function portalSession(Request $request, BillingSelfServeService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'return_url' => ['nullable', 'string', 'max:2048'],
        ]);

        try {
            $session = $service->createPortalSession(
                tenantId: (string) $user->tenant_id,
                returnUrl: isset($payload['return_url']) ? (string) $payload['return_url'] : null,
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json([
            'data' => $session,
        ], 201);
    }

    public function recover(Request $request, BillingSelfServeService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $subscription = $service->recoverPastDueSubscription((string) $user->tenant_id);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json([
            'data' => $subscription,
        ]);
    }

    public function dunningAttempts(Request $request, BillingDunningService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ]);

        $items = $service->listAttemptsForTenant(
            tenantId: (string) $user->tenant_id,
            limit: (int) ($payload['per_page'] ?? 30)
        );

        return response()->json([
            'data' => $items,
            'meta' => [
                'total' => count($items),
            ],
        ]);
    }

    public function reconciliation(Request $request, BillingSelfServeService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $snapshot = $service->reconciliationSnapshot((string) $user->tenant_id);

        return response()->json([
            'data' => $snapshot,
        ]);
    }
}
