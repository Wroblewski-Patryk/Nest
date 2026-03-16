<?php

namespace App\Http\Controllers\Api;

use App\Analytics\Services\LifeAreaBalanceScoreService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LifeAreaBalanceScoreController extends Controller
{
    public function show(Request $request, LifeAreaBalanceScoreService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'window_days' => ['sometimes', 'integer', 'min:1', 'max:180'],
        ]);

        $windowDays = (int) ($payload['window_days'] ?? 30);
        $result = $service->scoreForUser($user, $windowDays);

        return response()->json([
            'data' => $result['data'],
            'meta' => [
                'window_days' => $result['window_days'],
                'window_start' => $result['window_start'],
                'window_end' => $result['window_end'],
                'global_balance_score' => $result['global_balance_score'],
            ],
        ]);
    }
}
