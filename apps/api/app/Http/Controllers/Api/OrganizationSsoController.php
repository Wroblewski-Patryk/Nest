<?php

namespace App\Http\Controllers\Api;

use App\Auth\Services\OrganizationSsoAccountService;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationSsoProvider;
use App\Models\User;
use App\Organization\Services\OrganizationRbacService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class OrganizationSsoController extends Controller
{
    public function __construct(
        private readonly OrganizationRbacService $rbac
    ) {}

    public function index(Request $request, string $organizationId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organization = $this->resolveOrganization($user, $organizationId);

        if (! $this->rbac->can($user, $organization, 'org.sso.manage')) {
            abort(403);
        }

        $providers = OrganizationSsoProvider::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('organization_id', $organization->id)
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $providers]);
    }

    public function store(Request $request, string $organizationId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organization = $this->resolveOrganization($user, $organizationId);

        if (! $this->rbac->can($user, $organization, 'org.sso.manage')) {
            abort(403);
        }

        $payload = $request->validate([
            'protocol' => ['required', 'in:oidc,saml'],
            'display_name' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'in:active,inactive'],
            'oidc_issuer' => ['nullable', 'url', 'max:255'],
            'oidc_client_id' => ['nullable', 'string', 'max:255'],
            'oidc_jwks_url' => ['nullable', 'url', 'max:500'],
            'saml_entity_id' => ['nullable', 'string', 'max:255'],
            'saml_acs_url' => ['nullable', 'url', 'max:500'],
            'saml_x509_certificate' => ['nullable', 'string'],
            'saml_assertion_signing_secret' => ['nullable', 'string', 'min:32', 'max:512'],
            'attribute_mapping' => ['nullable', 'array'],
            'allowed_email_domains' => ['nullable', 'array'],
            'allowed_email_domains.*' => ['string', 'max:120'],
            'auto_provision_users' => ['nullable', 'boolean'],
            'require_verified_email' => ['nullable', 'boolean'],
            'require_signed_assertions' => ['nullable', 'boolean'],
        ]);

        $this->validateProtocolConfiguration($payload);

        $provider = OrganizationSsoProvider::query()->create([
            'tenant_id' => $user->tenant_id,
            'organization_id' => $organization->id,
            'created_by_user_id' => $user->id,
            'protocol' => $payload['protocol'],
            'slug' => $payload['slug'] ?? Str::slug((string) $payload['display_name']),
            'display_name' => $payload['display_name'],
            'status' => $payload['status'] ?? 'active',
            'oidc_issuer' => $payload['oidc_issuer'] ?? null,
            'oidc_client_id' => $payload['oidc_client_id'] ?? null,
            'oidc_jwks_url' => $payload['oidc_jwks_url'] ?? null,
            'saml_entity_id' => $payload['saml_entity_id'] ?? null,
            'saml_acs_url' => $payload['saml_acs_url'] ?? null,
            'saml_x509_certificate' => $payload['saml_x509_certificate'] ?? null,
            'saml_assertion_signing_secret' => $payload['saml_assertion_signing_secret'] ?? null,
            'attribute_mapping' => $payload['attribute_mapping'] ?? [],
            'allowed_email_domains' => $payload['allowed_email_domains'] ?? [],
            'auto_provision_users' => (bool) ($payload['auto_provision_users'] ?? false),
            'require_verified_email' => (bool) ($payload['require_verified_email'] ?? true),
            'require_signed_assertions' => (bool) ($payload['require_signed_assertions'] ?? true),
        ]);

        return response()->json(['data' => $provider], 201);
    }

    public function update(Request $request, string $organizationId, string $providerId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organization = $this->resolveOrganization($user, $organizationId);

        if (! $this->rbac->can($user, $organization, 'org.sso.manage')) {
            abort(403);
        }

        $payload = $request->validate([
            'display_name' => ['sometimes', 'string', 'max:160'],
            'status' => ['sometimes', 'in:active,inactive'],
            'oidc_issuer' => ['sometimes', 'nullable', 'url', 'max:255'],
            'oidc_client_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'oidc_jwks_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'saml_entity_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'saml_acs_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'saml_x509_certificate' => ['sometimes', 'nullable', 'string'],
            'saml_assertion_signing_secret' => ['sometimes', 'nullable', 'string', 'min:32', 'max:512'],
            'attribute_mapping' => ['sometimes', 'nullable', 'array'],
            'allowed_email_domains' => ['sometimes', 'nullable', 'array'],
            'allowed_email_domains.*' => ['string', 'max:120'],
            'auto_provision_users' => ['sometimes', 'boolean'],
            'require_verified_email' => ['sometimes', 'boolean'],
            'require_signed_assertions' => ['sometimes', 'boolean'],
        ]);

        $provider = OrganizationSsoProvider::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('organization_id', $organization->id)
            ->where('id', $providerId)
            ->firstOrFail();

        $provider->fill($payload);
        $provider->save();

        return response()->json(['data' => $provider->fresh()]);
    }

    public function exchange(
        Request $request,
        string $organizationSlug,
        string $providerSlug,
        OrganizationSsoAccountService $accounts
    ): JsonResponse {
        $payload = $request->validate([
            'id_token' => ['nullable', 'string'],
            'saml_assertion_jwt' => ['nullable', 'string'],
        ]);

        /** @var Organization $organization */
        $organization = Organization::query()
            ->where('slug', $organizationSlug)
            ->where('status', 'active')
            ->firstOrFail();

        /** @var OrganizationSsoProvider $provider */
        $provider = OrganizationSsoProvider::query()
            ->where('organization_id', $organization->id)
            ->where('slug', $providerSlug)
            ->where('status', 'active')
            ->firstOrFail();

        try {
            $result = $accounts->exchange($organization, $provider, $payload);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        $user = $result['user'];
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'tenant_id' => $user->tenant_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'timezone' => $user->timezone,
                    'settings' => $user->settings ?? [],
                ],
                'organization_id' => $organization->id,
                'provider' => $provider->slug,
                'created' => $result['created'],
            ],
        ]);
    }

    private function resolveOrganization(User $user, string $organizationId): Organization
    {
        return Organization::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('id', $organizationId)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function validateProtocolConfiguration(array $payload): void
    {
        $protocol = (string) $payload['protocol'];

        if ($protocol === 'oidc') {
            if (
                ! isset($payload['oidc_issuer'], $payload['oidc_client_id'], $payload['oidc_jwks_url']) ||
                (string) $payload['oidc_issuer'] === '' ||
                (string) $payload['oidc_client_id'] === '' ||
                (string) $payload['oidc_jwks_url'] === ''
            ) {
                throw ValidationException::withMessages([
                    'protocol' => ['OIDC provider requires issuer, client_id, and jwks_url.'],
                ]);
            }
        }

        if ($protocol === 'saml') {
            if (
                ! isset($payload['saml_entity_id'], $payload['saml_acs_url']) ||
                (string) $payload['saml_entity_id'] === '' ||
                (string) $payload['saml_acs_url'] === ''
            ) {
                throw ValidationException::withMessages([
                    'protocol' => ['SAML provider requires entity_id and acs_url.'],
                ]);
            }

            if (
                ! isset($payload['saml_assertion_signing_secret']) ||
                (string) $payload['saml_assertion_signing_secret'] === ''
            ) {
                throw ValidationException::withMessages([
                    'protocol' => ['SAML provider requires assertion signing secret.'],
                ]);
            }
        }
    }
}
