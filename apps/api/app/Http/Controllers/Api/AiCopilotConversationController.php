<?php

namespace App\Http\Controllers\Api;

use App\AI\Services\CopilotConversationService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiCopilotConversationController extends Controller
{
    public function reply(Request $request, CopilotConversationService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'message' => ['required', 'string', 'min:2', 'max:1500'],
            'context' => ['sometimes', 'array'],
            'context.window_days' => ['sometimes', 'integer', 'min:1', 'max:60'],
            'context.entity_limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'context.as_of' => ['sometimes', 'date'],
        ]);

        /** @var array<string, mixed> $context */
        $context = $payload['context'] ?? [];

        return response()->json(
            $service->respond($user, (string) $payload['message'], $context)
        );
    }
}
