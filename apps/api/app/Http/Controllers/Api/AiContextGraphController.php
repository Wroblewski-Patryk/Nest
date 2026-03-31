<?php

namespace App\Http\Controllers\Api;

use App\AI\Services\AiContextGraphService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiContextGraphController extends Controller
{
    public function show(Request $request, AiContextGraphService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'window_days' => ['sometimes', 'integer', 'min:1', 'max:60'],
            'entity_limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'as_of' => ['sometimes', 'date'],
        ]);

        return response()->json($service->buildForUser($user, $payload));
    }
}
