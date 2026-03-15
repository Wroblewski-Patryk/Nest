<?php

namespace App\Integrations\Services;

use App\Models\IntegrationCredential;
use App\Models\User;
use Carbon\CarbonInterface;

class IntegrationCredentialVault
{
    /**
     * @param  list<string>  $scopes
     */
    public function store(
        User $user,
        string $provider,
        string $accessToken,
        ?string $refreshToken = null,
        array $scopes = [],
        ?CarbonInterface $expiresAt = null,
    ): IntegrationCredential {
        return IntegrationCredential::query()->updateOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'provider' => $provider,
            ],
            [
                'scopes' => $scopes,
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at' => $expiresAt,
                'revoked_at' => null,
            ]
        );
    }

    public function activeFor(User $user, string $provider): ?IntegrationCredential
    {
        return IntegrationCredential::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->whereNull('revoked_at')
            ->first();
    }

    public function revoke(User $user, string $provider): void
    {
        IntegrationCredential::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->update([
                'revoked_at' => now(),
            ]);
    }
}
