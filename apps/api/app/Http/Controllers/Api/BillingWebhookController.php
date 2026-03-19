<?php

namespace App\Http\Controllers\Api;

use App\Billing\Services\BillingWebhookService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class BillingWebhookController extends Controller
{
    public function stripe(Request $request, BillingWebhookService $service): JsonResponse
    {
        $rawPayload = (string) $request->getContent();
        $signature = $request->header('Stripe-Signature');

        try {
            $result = $service->handleStripe($rawPayload, is_string($signature) ? $signature : null);
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 400);
        }

        return response()->json([
            'data' => $result,
        ]);
    }
}
