<?php

namespace App\Auth\Services;

use App\Models\OrganizationSsoProvider;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use Throwable;

class OrganizationSsoAssertionService
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{subject: string, email: string, name: string, email_verified: bool}
     */
    public function verify(OrganizationSsoProvider $provider, array $payload): array
    {
        return match ($provider->protocol) {
            'oidc' => $this->verifyOidc($provider, (string) ($payload['id_token'] ?? '')),
            'saml' => $this->verifySamlBridgeToken($provider, (string) ($payload['saml_assertion_jwt'] ?? '')),
            default => throw new InvalidArgumentException('Unsupported organization SSO protocol.'),
        };
    }

    /**
     * @return array{subject: string, email: string, name: string, email_verified: bool}
     */
    private function verifyOidc(OrganizationSsoProvider $provider, string $idToken): array
    {
        if ($idToken === '') {
            throw new InvalidArgumentException('Missing id_token for OIDC exchange.');
        }

        $jwksUrl = (string) $provider->oidc_jwks_url;
        if ($jwksUrl === '') {
            throw new InvalidArgumentException('OIDC provider missing jwks_url.');
        }

        $cacheKey = 'org-sso:oidc:jwks:'.md5($provider->id.'|'.$jwksUrl);
        /** @var array<string, mixed> $jwks */
        $jwks = Cache::remember($cacheKey, now()->addHours(6), function () use ($jwksUrl): array {
            $response = Http::acceptJson()->timeout(10)->get($jwksUrl);
            if (! $response->ok()) {
                throw new InvalidArgumentException('OIDC provider jwks fetch failed.');
            }

            /** @var array<string, mixed> $json */
            $json = (array) $response->json();
            if (! isset($json['keys']) || ! is_array($json['keys'])) {
                throw new InvalidArgumentException('OIDC provider returned invalid jwks payload.');
            }

            return $json;
        });

        try {
            $decoded = JWT::decode($idToken, JWK::parseKeySet($jwks));
        } catch (Throwable) {
            throw new InvalidArgumentException('OIDC id_token signature invalid.');
        }

        /** @var array<string, mixed> $claims */
        $claims = json_decode((string) json_encode($decoded, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);

        $issuer = (string) ($claims['iss'] ?? '');
        if ((string) $provider->oidc_issuer !== '' && $issuer !== (string) $provider->oidc_issuer) {
            throw new InvalidArgumentException('OIDC id_token issuer mismatch.');
        }

        $audience = $claims['aud'] ?? '';
        $clientId = (string) $provider->oidc_client_id;
        if ($clientId !== '') {
            $validAudience = is_array($audience)
                ? in_array($clientId, $audience, true)
                : (string) $audience === $clientId;
            if (! $validAudience) {
                throw new InvalidArgumentException('OIDC id_token audience mismatch.');
            }
        }

        $expiresAt = (int) ($claims['exp'] ?? 0);
        if ($expiresAt !== 0 && $expiresAt < now()->timestamp) {
            throw new InvalidArgumentException('OIDC id_token expired.');
        }

        $subject = (string) ($claims['sub'] ?? '');
        $email = strtolower((string) ($claims['email'] ?? ''));
        $name = (string) ($claims['name'] ?? '');
        $emailVerified = filter_var($claims['email_verified'] ?? false, FILTER_VALIDATE_BOOL);

        if ($subject === '' || $email === '') {
            throw new InvalidArgumentException('OIDC id_token missing required identity claims.');
        }

        return [
            'subject' => $subject,
            'email' => $email,
            'name' => $name,
            'email_verified' => $emailVerified,
        ];
    }

    /**
     * @return array{subject: string, email: string, name: string, email_verified: bool}
     */
    private function verifySamlBridgeToken(OrganizationSsoProvider $provider, string $assertionJwt): array
    {
        if ($assertionJwt === '') {
            throw new InvalidArgumentException('Missing saml_assertion_jwt for SAML exchange.');
        }

        $secret = (string) $provider->saml_assertion_signing_secret;
        if ($secret === '') {
            throw new InvalidArgumentException('SAML provider missing assertion signing secret.');
        }

        try {
            $decoded = JWT::decode($assertionJwt, new Key($secret, 'HS256'));
        } catch (Throwable) {
            throw new InvalidArgumentException('SAML assertion token signature invalid.');
        }

        /** @var array<string, mixed> $claims */
        $claims = json_decode((string) json_encode($decoded, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);

        $expiresAt = (int) ($claims['exp'] ?? 0);
        if ($expiresAt !== 0 && $expiresAt < now()->timestamp) {
            throw new InvalidArgumentException('SAML assertion token expired.');
        }

        $subject = (string) ($claims['sub'] ?? '');
        $email = strtolower((string) ($claims['email'] ?? ''));
        $name = (string) ($claims['name'] ?? '');
        $emailVerified = filter_var($claims['email_verified'] ?? true, FILTER_VALIDATE_BOOL);

        if ($subject === '' || $email === '') {
            throw new InvalidArgumentException('SAML assertion missing required identity claims.');
        }

        return [
            'subject' => $subject,
            'email' => $email,
            'name' => $name,
            'email_verified' => $emailVerified,
        ];
    }
}
