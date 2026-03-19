<?php

namespace App\Auth\Services;

use App\Models\OAuthIdentity;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class OAuthAccountLinkingService
{
    public function __construct(
        private readonly OAuthIdTokenVerifier $verifier
    ) {}

    /**
     * @return array{user: User, linked: bool, created: bool}
     */
    public function authenticate(string $provider, string $idToken, ?string $tenantSlug = null): array
    {
        $claims = $this->verifier->verify($provider, $idToken);
        $providerUserId = (string) ($claims['sub'] ?? '');
        $email = strtolower((string) ($claims['email'] ?? ''));
        $name = (string) ($claims['name'] ?? Str::before($email, '@'));
        $emailVerified = filter_var($claims['email_verified'] ?? false, FILTER_VALIDATE_BOOL);

        if ($providerUserId === '' || $email === '') {
            throw new InvalidArgumentException('OAuth identity payload is missing required claims.');
        }

        if (! $emailVerified) {
            throw new InvalidArgumentException('OAuth account email must be verified.');
        }

        /** @var OAuthIdentity|null $identity */
        $identity = OAuthIdentity::query()
            ->with('user')
            ->where('provider', $provider)
            ->where('provider_user_id', $providerUserId)
            ->first();

        if ($identity !== null && $identity->user !== null) {
            return ['user' => $identity->user, 'linked' => true, 'created' => false];
        }

        [$user, $created] = DB::transaction(function () use ($provider, $providerUserId, $email, $name, $tenantSlug): array {
            $user = $this->resolveUserForEmail($email, $tenantSlug);
            $created = false;

            if ($user === null) {
                $tenant = Tenant::query()->create([
                    'name' => sprintf('%s Workspace', $name !== '' ? $name : Str::before($email, '@')),
                    'slug' => Str::slug((string) Str::before($email, '@')).'-'.Str::lower(Str::random(6)),
                    'is_active' => true,
                ]);

                $user = User::query()->create([
                    'tenant_id' => $tenant->id,
                    'name' => $name !== '' ? $name : Str::before($email, '@'),
                    'email' => $email,
                    'password' => Str::random(64),
                    'timezone' => 'UTC',
                    'email_verified_at' => now(),
                    'settings' => [],
                ]);
                $created = true;
            }

            OAuthIdentity::query()->updateOrCreate(
                [
                    'provider' => $provider,
                    'provider_user_id' => $providerUserId,
                ],
                [
                    'tenant_id' => $user->tenant_id,
                    'user_id' => $user->id,
                    'email' => $email,
                    'linked_at' => now(),
                ]
            );

            return [$user, $created];
        });

        return [
            'user' => $user,
            'linked' => true,
            'created' => $created,
        ];
    }

    private function resolveUserForEmail(string $email, ?string $tenantSlug): ?User
    {
        $query = User::query()->where('email', $email);

        if ($tenantSlug !== null && $tenantSlug !== '') {
            $query->whereHas('tenant', function ($tenantQuery) use ($tenantSlug): void {
                $tenantQuery->where('slug', $tenantSlug);
            });
        }

        $users = $query->get();
        if ($users->count() === 0) {
            return null;
        }

        if ($users->count() > 1) {
            throw new InvalidArgumentException(
                'Multiple tenant accounts share this email. Provide tenant_slug to link safely.'
            );
        }

        return $users->first();
    }
}
