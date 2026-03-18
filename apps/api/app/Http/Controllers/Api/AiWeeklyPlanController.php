<?php

namespace App\Http\Controllers\Api;

use App\AI\Policy\AiPlanningPolicyService;
use App\AI\Services\WeeklyPlanningAssistantService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiWeeklyPlanController extends Controller
{
    public function propose(
        Request $request,
        WeeklyPlanningAssistantService $service,
        AiPlanningPolicyService $policyService
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'constraints' => ['sometimes', 'array'],
            'constraints.available_hours' => ['sometimes', 'integer', 'min:1', 'max:80'],
            'constraints.max_items' => ['sometimes', 'integer', 'min:1', 'max:25'],
            'constraints.include_weekend' => ['sometimes', 'boolean'],
            'constraints.min_confidence' => ['sometimes', 'numeric', 'min:0.1', 'max:0.95'],
            'constraints.prioritize' => ['sometimes', 'array', 'min:1'],
            'constraints.prioritize.*' => ['string', 'in:tasks,habits,goals'],
            'planner_context' => ['sometimes', 'string', 'max:1000'],
        ]);

        /** @var array<string, mixed> $constraints */
        $constraints = $payload['constraints'] ?? [];
        $policy = $policyService->evaluateWeeklyPlanningContext($payload['planner_context'] ?? null);
        if (! $policy['allowed']) {
            return response()->json([
                'message' => 'Planner context violates AI policy guardrails.',
                'errors' => [
                    'planner_context' => ['Planner context violates AI policy guardrails.'],
                ],
                'policy' => $policy,
            ], 422);
        }

        $result = $service->proposeWeeklyPlan($user, $constraints);
        $result['data']['policy'] = $policy;

        return response()->json($result);
    }
}
