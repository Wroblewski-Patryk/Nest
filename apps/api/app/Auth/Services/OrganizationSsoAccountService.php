<?php

namespace App\Auth\Services;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\OrganizationSsoIdentity;
use App\Models\OrganizationSsoProvider;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class OrganizationSsoAccountService
{
    public function __construct(
        private readonly OrganizationSsoAssertionService $assertions
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array{user: User, created: bool}
     */
    public function exchange(Organization $organization, OrganizationSsoProvider $provider, array $payload): array
    {
        $claims = $this->assertions->verify($provider, $payload);
        $subject = $claims['subject'];
        $email = $claims['email'];
        $name = $claims['name'] !== '' ? $claims['name'] : Str::before($email, '@');
        $emailVerified = (bool) $claims['email_verified'];

        if ($provider->require_verified_email && ! $emailVerified) {
            throw new InvalidArgumentException('Organization SSO identity must provide verified email.');
        }

        $this->enforceAllowedDomains($provider, $email);

        /** @var OrganizationSsoIdentity|null $identity */
        $identity = OrganizationSsoIdentity::query()
            ->with('user')
            ->where('provider_id', $provider->id)
            ->where('external_subject', $subject)
            ->first();

        if ($identity !== null && $identity->user !== null) {
            $this->ensureOrganizationMembership($organization, $identity->user, $provider);

            return [
                'user' => $identity->user,
                'created' => false,
            ];
        }

        [$user, $created] = DB::transaction(function () use ($organization, $provider, $subject, $email, $name): array {
            $user = User::query()
                ->where('tenant_id', $organization->tenant_id)
                ->where('email', $email)
                ->first();

            $created = false;
            if ($user === null) {
                if (! $provider->auto_provision_users) {
                    throw new InvalidArgumentException('No user found for organization SSO identity.');
                }

                $user = User::query()->create([
                    'tenant_id' => $organization->tenant_id,
                    'name' => $name,
                    'email' => $email,
                    'password' => Str::random(64),
                    'timezone' => 'UTC',
                    'email_verified_at' => now(),
                    'settings' => [],
                ]);
                $created = true;
            }

            $this->ensureOrganizationMembership($organization, $user, $provider);

            OrganizationSsoIdentity::query()->updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'external_subject' => $subject,
                ],
                [
                    'tenant_id' => $organization->tenant_id,
                    'organization_id' => $organization->id,
                    'user_id' => $user->id,
                    'email' => $email,
                    'linked_at' => now(),
                ]
            );

            return [$user, $created];
        });

        return [
            'user' => $user,
            'created' => $created,
        ];
    }

    private function ensureOrganizationMembership(
        Organization $organization,
        User $user,
        OrganizationSsoProvider $provider
    ): void {
        $membership = OrganizationMember::query()
            ->where('organization_id', $organization->id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($membership !== null) {
            return;
        }

        if (! $provider->auto_provision_users) {
            throw new InvalidArgumentException('User is not an active member of this organization.');
        }

        OrganizationMember::query()->updateOrCreate(
            [
                'tenant_id' => $organization->tenant_id,
                'organization_id' => $organization->id,
                'user_id' => $user->id,
            ],
            [
                'role' => 'member',
                'status' => 'active',
            ]
        );
    }

    private function enforceAllowedDomains(OrganizationSsoProvider $provider, string $email): void
    {
        /** @var array<int, string> $allowedDomains */
        $allowedDomains = array_values(array_filter(
            array_map(static fn (mixed $value): string => strtolower((string) $value), $provider->allowed_email_domains ?? [])
        ));

        if ($allowedDomains === []) {
            return;
        }

        $domain = strtolower((string) Str::of($email)->after('@'));
        if ($domain === '' || ! in_array($domain, $allowedDomains, true)) {
            throw new InvalidArgumentException('Email domain is not allowed for this organization SSO provider.');
        }
    }
}
