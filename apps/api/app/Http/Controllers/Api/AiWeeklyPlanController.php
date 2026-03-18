<?php

namespace App\Http\Controllers\Api;

use App\AI\Services\WeeklyPlanningAssistantService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiWeeklyPlanController extends Controller
{
    public function propose(Request $request, WeeklyPlanningAssistantService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'constraints' => ['sometimes', 'array'],
            'constraints.available_hours' => ['sometimes', 'integer', 'min:1', 'max:80'],
            'constraints.max_items' => ['sometimes', 'integer', 'min:1', 'max:25'],
            'constraints.include_weekend' => ['sometimes', 'boolean'],
            'constraints.prioritize' => ['sometimes', 'array', 'min:1'],
            'constraints.prioritize.*' => ['string', 'in:tasks,habits,goals'],
        ]);

        /** @var array<string, mixed> $constraints */
        $constraints = $payload['constraints'] ?? [];
        $result = $service->proposeWeeklyPlan($user, $constraints);

        return response()->json($result);
    }
}
