<?php

namespace App\Http\Controllers\Api;

use App\Analytics\Services\InsightsTrendService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InsightsTrendController extends Controller
{
    public function tasks(Request $request, InsightsTrendService $service): JsonResponse
    {
        return $this->respond($request, $service, 'tasks');
    }

    public function habits(Request $request, InsightsTrendService $service): JsonResponse
    {
        return $this->respond($request, $service, 'habits');
    }

    public function goals(Request $request, InsightsTrendService $service): JsonResponse
    {
        return $this->respond($request, $service, 'goals');
    }

    private function respond(Request $request, InsightsTrendService $service, string $module): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'period' => ['sometimes', 'in:weekly,monthly'],
            'points' => ['sometimes', 'integer', 'min:1', 'max:52'],
        ]);

        $period = (string) ($payload['period'] ?? 'weekly');
        $points = isset($payload['points']) ? (int) $payload['points'] : null;
        $result = $service->trendForUser($user, $module, $period, $points);

        return response()->json($result);
    }
}
