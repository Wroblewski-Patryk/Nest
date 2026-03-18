<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiRecommendationFeedback;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiRecommendationFeedbackController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'recommendation_type' => ['required', 'string', 'max:64'],
            'recommendation_id' => ['required', 'string', 'max:128'],
            'decision' => ['required', 'string', 'in:accept,reject,edit'],
            'edited_payload' => ['sometimes', 'array'],
            'reason_codes' => ['sometimes', 'array'],
            'reason_codes.*' => ['string', 'max:64'],
            'note' => ['sometimes', 'string', 'max:1000'],
        ]);

        if (($payload['decision'] ?? null) === 'edit' && ! array_key_exists('edited_payload', $payload)) {
            return response()->json([
                'message' => 'The edited_payload field is required when decision=edit.',
                'errors' => [
                    'edited_payload' => ['The edited_payload field is required when decision=edit.'],
                ],
            ], 422);
        }

        $feedback = AiRecommendationFeedback::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'recommendation_type' => $payload['recommendation_type'],
            'recommendation_id' => $payload['recommendation_id'],
            'decision' => $payload['decision'],
            'edited_payload' => $payload['edited_payload'] ?? null,
            'reason_codes' => $payload['reason_codes'] ?? [],
            'note' => $payload['note'] ?? null,
        ]);

        return response()->json([
            'data' => [
                'id' => $feedback->id,
                'recommendation_type' => $feedback->recommendation_type,
                'recommendation_id' => $feedback->recommendation_id,
                'decision' => $feedback->decision,
                'reason_codes' => $feedback->reason_codes ?? [],
                'created_at' => $feedback->created_at?->toISOString(),
            ],
        ], 201);
    }
}
