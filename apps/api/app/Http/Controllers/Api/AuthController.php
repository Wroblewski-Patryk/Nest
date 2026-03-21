<?php

namespace App\Http\Controllers\Api;

use App\Auth\Services\OAuthAccountLinkingService;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class AuthController extends Controller
{
    public function localizationOptions(Request $request): JsonResponse
    {
        $acceptLanguage = (string) $request->header('Accept-Language', '');
        $detectedLanguage = Str::startsWith(Str::lower($acceptLanguage), 'pl') ? 'pl' : 'en';

        return response()->json([
            'data' => [
                'detected_language' => $detectedLanguage,
                'supported_languages' => [
                    ['code' => 'en', 'label' => 'English'],
                    ['code' => 'pl', 'label' => 'Polski'],
                ],
            ],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
            'timezone' => ['nullable', 'timezone'],
            'language' => ['nullable', Rule::in(['en', 'pl'])],
            'locale' => ['nullable', 'string', 'max:16'],
        ]);

        $tenant = Tenant::query()->create([
            'name' => sprintf('%s Workspace', $payload['name']),
            'slug' => Str::slug((string) Str::before($payload['email'], '@')).'-'.Str::lower(Str::random(6)),
            'is_active' => true,
        ]);

        $user = User::query()->create([
            'tenant_id' => $tenant->id,
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => $payload['password'],
            'timezone' => $payload['timezone'] ?? 'UTC',
            'settings' => [
                'language' => $payload['language'] ?? 'en',
                'locale' => $payload['locale'] ?? (($payload['language'] ?? 'en') === 'pl' ? 'pl-PL' : 'en-US'),
            ],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => $this->serializeUser($user),
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $payload['email'])->first();

        if ($user === null || ! Hash::check($payload['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => $this->serializeUser($user),
            ],
        ]);
    }

    public function oauthExchange(
        Request $request,
        string $provider,
        OAuthAccountLinkingService $oauth
    ): JsonResponse {
        $payload = $request->validate([
            'id_token' => ['required', 'string'],
            'tenant_slug' => ['nullable', 'string', 'max:190'],
        ]);

        try {
            $result = $oauth->authenticate(
                provider: $provider,
                idToken: (string) $payload['id_token'],
                tenantSlug: $payload['tenant_slug'] ?? null
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $user = $result['user'];
        if (! $user->tenant->is_active) {
            return response()->json([
                'message' => 'Tenant is inactive.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => $this->serializeUser($user),
                'provider' => $provider,
                'linked' => $result['linked'],
                'created' => $result['created'],
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([], 204);
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
