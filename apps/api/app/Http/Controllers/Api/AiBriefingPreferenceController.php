<?php

namespace App\Http\Controllers\Api;

use App\AI\Services\AiBriefingService;
use App\Http\Controllers\Controller;
use App\Models\AiBriefingPreference;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiBriefingPreferenceController extends Controller
{
    public function show(Request $request, AiBriefingService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $preferences = $service->getPreferences($user);

        return response()->json([
            'data' => $this->serialize($preferences),
        ]);
    }

    public function update(Request $request, AiBriefingService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'daily_enabled' => ['sometimes', 'boolean'],
            'weekly_enabled' => ['sometimes', 'boolean'],
            'scope_modules' => ['sometimes', 'array'],
            'scope_modules.*' => ['string', 'in:tasks,calendar,habits,goals,journal,insights'],
            'timezone' => ['sometimes', 'timezone'],
        ]);

        $preferences = $service->updatePreferences($user, $payload);

        return response()->json([
            'data' => $this->serialize($preferences),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(AiBriefingPreference $preferences): array
    {
        return [
            'id' => (string) $preferences->id,
            'daily_enabled' => (bool) $preferences->daily_enabled,
            'weekly_enabled' => (bool) $preferences->weekly_enabled,
            'scope_modules' => $preferences->scope_modules ?? [],
            'timezone' => (string) $preferences->timezone,
            'created_at' => $preferences->created_at?->toISOString(),
            'updated_at' => $preferences->updated_at?->toISOString(),
        ];
    }
}
