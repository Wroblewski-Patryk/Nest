<?php

namespace App\Http\Controllers\Api;

use App\AI\Services\AiBriefingService;
use App\Http\Controllers\Controller;
use App\Models\AiBriefing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiBriefingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'cadence' => ['sometimes', 'string', 'in:daily,weekly'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) ($payload['per_page'] ?? 20);
        $query = AiBriefing::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->orderByDesc('generated_at');

        if (isset($payload['cadence'])) {
            $query->where('cadence', (string) $payload['cadence']);
        }

        $briefings = $query->limit($perPage)->get();

        return response()->json([
            'data' => $briefings->map(fn (AiBriefing $briefing): array => $this->serialize($briefing))->all(),
            'meta' => [
                'total' => $briefings->count(),
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Request $request, string $briefingId): JsonResponse
    {
        $briefing = $this->findUserBriefing($request, $briefingId);

        return response()->json([
            'data' => $this->serialize($briefing),
        ]);
    }

    public function generate(Request $request, AiBriefingService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'cadence' => ['required', 'string', 'in:daily,weekly'],
            'scope_modules' => ['sometimes', 'array'],
            'scope_modules.*' => ['string', 'in:tasks,calendar,habits,goals,journal,insights'],
            'window_days' => ['sometimes', 'integer', 'min:1', 'max:30'],
            'as_of' => ['sometimes', 'date'],
        ]);

        $briefing = $service->generateBriefing(
            user: $user,
            cadence: (string) $payload['cadence'],
            payload: $payload
        );

        return response()->json([
            'data' => $this->serialize($briefing),
        ], 201);
    }

    private function findUserBriefing(Request $request, string $briefingId): AiBriefing
    {
        /** @var User $user */
        $user = $request->user();

        return AiBriefing::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($briefingId);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(AiBriefing $briefing): array
    {
        return [
            'id' => (string) $briefing->id,
            'cadence' => (string) $briefing->cadence,
            'scope_modules' => $briefing->scope_modules ?? [],
            'summary' => (string) $briefing->summary,
            'sections' => $briefing->sections ?? [],
            'context_fingerprint' => $briefing->context_fingerprint,
            'generated_at' => $briefing->generated_at?->toISOString(),
            'created_at' => $briefing->created_at?->toISOString(),
            'updated_at' => $briefing->updated_at?->toISOString(),
        ];
    }
}
