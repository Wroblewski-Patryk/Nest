<?php

namespace App\Http\Controllers\Api;

use App\Auth\DelegatedCredentialScopeCatalog;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AiAgentAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertHumanPrincipal($user);

        $agents = User::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('owner_user_id', $user->id)
            ->where('principal_type', User::PRINCIPAL_AI_AGENT)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $agents->map(fn (User $agent): array => $this->serializeAgent($agent))->values()->all(),
            'meta' => [
                'total' => $agents->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertHumanPrincipal($user);

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);

        $settings = is_array($user->settings) ? $user->settings : [];
        $language = in_array($settings['language'] ?? null, ['en', 'pl'], true) ? $settings['language'] : 'en';
        $locale = is_string($settings['locale'] ?? null) && $settings['locale'] !== ''
            ? $settings['locale']
            : ($language === 'pl' ? 'pl-PL' : 'en-US');

        $agent = User::query()->create([
            'tenant_id' => $user->tenant_id,
            'principal_type' => User::PRINCIPAL_AI_AGENT,
            'owner_user_id' => $user->id,
            'agent_status' => User::AGENT_STATUS_ACTIVE,
            'name' => (string) $payload['name'],
            'email' => sprintf(
                'ai-agent-%s-%s@agents.nest.local',
                Str::slug((string) $payload['name']),
                Str::lower((string) Str::ulid())
            ),
            'password' => Str::password(32),
            'timezone' => $user->timezone,
            'settings' => [
                'language' => $language,
                'locale' => $locale,
            ],
        ]);

        return response()->json([
            'data' => $this->serializeAgent($agent),
        ], 201);
    }

    public function issueCredential(Request $request, string $agentId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertHumanPrincipal($user);

        $agent = $this->findOwnedAgent($user, $agentId);
        if ($agent->agent_status === User::AGENT_STATUS_REVOKED) {
            throw ValidationException::withMessages([
                'agent' => ['Cannot issue credential for revoked AI agent.'],
            ]);
        }

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'scopes' => ['required', 'array', 'min:1'],
            'scopes.*' => ['required', 'string', Rule::in(DelegatedCredentialScopeCatalog::AVAILABLE_SCOPES)],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $scopes = DelegatedCredentialScopeCatalog::normalizeScopes((array) $payload['scopes']);
        $expiresAt = isset($payload['expires_at'])
            ? CarbonImmutable::parse((string) $payload['expires_at'])
            : null;

        $tokenResult = $agent->createToken(
            name: (string) $payload['name'],
            abilities: array_values(array_unique([
                DelegatedCredentialScopeCatalog::AI_AGENT_MARKER_SCOPE,
                ...$scopes,
            ])),
            expiresAt: $expiresAt
        );

        $token = $tokenResult->accessToken;
        $token->forceFill([
            'revoked_at' => null,
        ])->save();

        return response()->json([
            'data' => [
                'agent' => $this->serializeAgent($agent),
                'credential' => $this->serializeCredential($token),
                'plain_text_token' => $tokenResult->plainTextToken,
            ],
        ], 201);
    }

    public function listCredentials(Request $request, string $agentId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertHumanPrincipal($user);

        $agent = $this->findOwnedAgent($user, $agentId);
        $credentials = PersonalAccessToken::query()
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $agent->id)
            ->orderByDesc('id')
            ->get()
            ->filter(fn (PersonalAccessToken $token): bool => DelegatedCredentialScopeCatalog::isAiAgentToken($token))
            ->values();

        return response()->json([
            'data' => $credentials->map(
                fn (PersonalAccessToken $token): array => $this->serializeCredential($token)
            )->values()->all(),
            'meta' => [
                'total' => $credentials->count(),
            ],
        ]);
    }

    public function revokeCredential(Request $request, string $agentId, int $credentialId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertHumanPrincipal($user);

        $agent = $this->findOwnedAgent($user, $agentId);

        $token = PersonalAccessToken::query()
            ->whereKey($credentialId)
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $agent->id)
            ->firstOrFail();

        if (! DelegatedCredentialScopeCatalog::isAiAgentToken($token)) {
            abort(404);
        }

        $this->revokeToken($token);

        return response()->json([
            'data' => $this->serializeCredential($token),
        ]);
    }

    public function deactivate(Request $request, string $agentId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertHumanPrincipal($user);

        $agent = $this->findOwnedAgent($user, $agentId);
        $agent->forceFill([
            'agent_status' => User::AGENT_STATUS_REVOKED,
        ])->save();

        PersonalAccessToken::query()
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $agent->id)
            ->get()
            ->filter(fn (PersonalAccessToken $token): bool => DelegatedCredentialScopeCatalog::isAiAgentToken($token))
            ->each(fn (PersonalAccessToken $token): PersonalAccessToken => $this->revokeToken($token));

        return response()->json([
            'data' => $this->serializeAgent($agent),
        ]);
    }

    private function assertHumanPrincipal(User $user): void
    {
        if (! $user->isHumanPrincipal()) {
            throw new AuthorizationException('AI agent principals cannot manage AI agent accounts.');
        }
    }

    private function findOwnedAgent(User $owner, string $agentId): User
    {
        return User::query()
            ->where('tenant_id', $owner->tenant_id)
            ->where('owner_user_id', $owner->id)
            ->where('principal_type', User::PRINCIPAL_AI_AGENT)
            ->findOrFail($agentId);
    }

    private function revokeToken(PersonalAccessToken $token): PersonalAccessToken
    {
        $now = now();
        $token->forceFill([
            'revoked_at' => $token->getAttribute('revoked_at') ?? $now,
            'expires_at' => $token->expires_at === null || $token->expires_at->isFuture()
                ? $now
                : $token->expires_at,
        ])->save();

        return $token->refresh();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeAgent(User $agent): array
    {
        $latestCredentialUsage = PersonalAccessToken::query()
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $agent->id)
            ->whereNotNull('last_used_at')
            ->orderByDesc('last_used_at')
            ->value('last_used_at');

        return [
            'id' => $agent->id,
            'name' => $agent->name,
            'email' => $agent->email,
            'agent_status' => $agent->agent_status ?? User::AGENT_STATUS_ACTIVE,
            'created_at' => $this->asIso($agent->created_at),
            'last_used_at' => $this->asIso($this->asCarbon($latestCredentialUsage)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeCredential(PersonalAccessToken $token): array
    {
        $expiresAt = $this->asCarbon($token->expires_at);
        $revokedAt = $this->asCarbon($token->getAttribute('revoked_at'));

        $status = 'active';
        if ($revokedAt !== null) {
            $status = 'revoked';
        } elseif ($expiresAt !== null && $expiresAt->isPast()) {
            $status = 'expired';
        }

        return [
            'id' => (string) $token->id,
            'name' => (string) $token->name,
            'scopes' => DelegatedCredentialScopeCatalog::delegatedScopesForToken($token),
            'status' => $status,
            'last_used_at' => $this->asIso($this->asCarbon($token->last_used_at)),
            'expires_at' => $this->asIso($expiresAt),
            'revoked_at' => $this->asIso($revokedAt),
            'created_at' => $this->asIso($this->asCarbon($token->created_at)),
        ];
    }

    private function asCarbon(mixed $value): ?CarbonInterface
    {
        if ($value instanceof CarbonInterface) {
            return $value;
        }

        if (is_string($value) && $value !== '') {
            return CarbonImmutable::parse($value);
        }

        return null;
    }

    private function asIso(?CarbonInterface $value): ?string
    {
        return $value?->toISOString();
    }
}
