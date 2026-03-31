<?php

namespace App\Integrations\Services;

use App\Models\IntegrationCredential;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class IntegrationConnectionService
{
    /**
     * @var list<string>
     */
    public const SUPPORTED_PROVIDERS = [
        'trello',
        'google_tasks',
        'todoist',
        'clickup',
        'microsoft_todo',
        'google_calendar',
        'obsidian',
    ];

    public function __construct(
        private readonly IntegrationCredentialVault $vault,
    ) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function listForUser(User $user): array
    {
        $credentials = IntegrationCredential::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->whereIn('provider', self::SUPPORTED_PROVIDERS)
            ->get()
            ->keyBy('provider');

        return array_map(function (string $provider) use ($credentials): array {
            $credential = $credentials->get($provider);

            return $this->toConnectionPayload($provider, $credential);
        }, self::SUPPORTED_PROVIDERS);
    }

    /**
     * @param  list<string>  $scopes
     * @return array<string, mixed>
     */
    public function connectForUser(
        User $user,
        string $provider,
        string $accessToken,
        ?string $refreshToken,
        array $scopes,
        ?string $expiresAt,
    ): array {
        $credential = $this->vault->store(
            user: $user,
            provider: $provider,
            accessToken: $accessToken,
            refreshToken: $refreshToken,
            scopes: $scopes,
            expiresAt: $expiresAt !== null ? Carbon::parse($expiresAt) : null,
        );

        return $this->toConnectionPayload($provider, $credential);
    }

    /**
     * @return array<string, mixed>
     */
    public function revokeForUser(User $user, string $provider): array
    {
        $this->vault->revoke($user, $provider);

        $credential = IntegrationCredential::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->first();

        return $this->toConnectionPayload($provider, $credential);
    }

    /**
     * @return array<string, mixed>
     */
    private function toConnectionPayload(string $provider, ?IntegrationCredential $credential): array
    {
        if ($credential === null) {
            return [
                'provider' => $provider,
                'status' => 'not_connected',
                'is_connected' => false,
                'scopes' => [],
                'expires_at' => null,
                'revoked_at' => null,
                'connected_at' => null,
                'updated_at' => null,
            ];
        }

        $isConnected = $credential->revoked_at === null;

        return [
            'provider' => $provider,
            'status' => $isConnected ? 'connected' : 'revoked',
            'is_connected' => $isConnected,
            'scopes' => is_array($credential->scopes) ? $credential->scopes : [],
            'expires_at' => $this->asIso($credential->expires_at),
            'revoked_at' => $this->asIso($credential->revoked_at),
            'connected_at' => $this->asIso($credential->created_at),
            'updated_at' => $this->asIso($credential->updated_at),
        ];
    }

    private function asIso(?CarbonInterface $value): ?string
    {
        return $value?->toISOString();
    }
}
