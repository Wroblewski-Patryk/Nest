<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class UserSettingsController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => $this->serializeUser($user),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'timezone' => ['sometimes', 'timezone'],
            'settings' => ['sometimes', 'array'],
            'language' => ['sometimes', Rule::in(['en', 'pl'])],
            'locale' => ['sometimes', 'string', 'max:16'],
        ]);

        $settings = is_array($user->settings) ? $user->settings : [];
        if (array_key_exists('settings', $payload) && is_array($payload['settings'])) {
            $settings = array_merge($settings, $payload['settings']);
        }

        if (array_key_exists('language', $payload)) {
            $settings['language'] = $payload['language'];
        }

        if (array_key_exists('locale', $payload)) {
            $settings['locale'] = $payload['locale'];
        }

        $updateData = Arr::except($payload, ['settings', 'language', 'locale']);
        $updateData['settings'] = $settings;

        $user->fill($updateData);
        $user->save();

        return response()->json([
            'data' => $this->serializeUser($user->fresh()),
        ]);
    }

    public function completeOnboarding(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
            'language' => ['required', Rule::in(['en', 'pl'])],
            'locale' => ['nullable', 'string', 'max:16'],
        ]);

        $settings = is_array($user->settings) ? $user->settings : [];
        $settings['language'] = $payload['language'];
        $settings['locale'] = $payload['locale'] ?? ($payload['language'] === 'pl' ? 'pl-PL' : 'en-US');
        $settings['onboarding_completed_at'] = Carbon::now()->toIso8601String();

        $user->fill([
            'name' => $payload['display_name'],
            'settings' => $settings,
        ]);
        $user->save();

        return response()->json([
            'data' => $this->serializeUser($user->fresh()),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeUser(User $user): array
    {
        $settings = is_array($user->settings) ? $user->settings : [];
        $language = in_array($settings['language'] ?? null, ['en', 'pl'], true)
            ? $settings['language']
            : 'en';
        $locale = is_string($settings['locale'] ?? null) && $settings['locale'] !== ''
            ? $settings['locale']
            : ($language === 'pl' ? 'pl-PL' : 'en-US');
        $onboardingCompletedAt = $settings['onboarding_completed_at'] ?? null;

        return [
            'id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'name' => $user->name,
            'email' => $user->email,
            'timezone' => $user->timezone,
            'language' => $language,
            'locale' => $locale,
            'onboarding_required' => ! is_string($onboardingCompletedAt) || $onboardingCompletedAt === '',
            'settings' => array_merge($settings, [
                'language' => $language,
                'locale' => $locale,
            ]),
        ];
    }
}
