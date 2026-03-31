<?php

namespace App\Http\Controllers\Api;

use App\Auth\DelegatedCredentialScopeCatalog;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;

class DelegatedCredentialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $credentials = $this->delegatedTokensForUser($user);

        return response()->json([
            'data' => array_map(
                fn (PersonalAccessToken $token): array => $this->serializeCredential($token),
                $credentials
            ),
            'meta' => [
                'total' => count($credentials),
                'available_scopes' => DelegatedCredentialScopeCatalog::AVAILABLE_SCOPES,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

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

        $tokenResult = $user->createToken(
            name: (string) $payload['name'],
            abilities: array_values(array_unique([
                DelegatedCredentialScopeCatalog::MARKER_SCOPE,
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
                'credential' => $this->serializeCredential($token),
                'plain_text_token' => $tokenResult->plainTextToken,
            ],
        ], 201);
    }

    public function revoke(Request $request, int $credentialId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $token = PersonalAccessToken::query()
            ->whereKey($credentialId)
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->id)
            ->firstOrFail();

        if (! DelegatedCredentialScopeCatalog::isDelegatedToken($token)) {
            abort(404);
        }

        $now = now();
        $token->forceFill([
            'revoked_at' => $token->getAttribute('revoked_at') ?? $now,
            'expires_at' => $token->expires_at === null || $token->expires_at->isFuture()
                ? $now
                : $token->expires_at,
        ])->save();

        return response()->json([
            'data' => $this->serializeCredential($token),
        ]);
    }

    /**
     * @return array<int, PersonalAccessToken>
     */
    private function delegatedTokensForUser(User $user): array
    {
        return PersonalAccessToken::query()
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->id)
            ->orderByDesc('id')
            ->get()
            ->filter(fn (PersonalAccessToken $token): bool => DelegatedCredentialScopeCatalog::isDelegatedToken($token))
            ->values()
            ->all();
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

