<?php

namespace App\Auth\Services;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use InvalidArgumentException;
use stdClass;
use Throwable;

class OAuthIdTokenVerifier
{
    public function __construct(
        private readonly JwkSetFetcher $jwks
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function verify(string $provider, string $idToken): array
    {
        if (! in_array($provider, ['google', 'apple'], true)) {
            throw new InvalidArgumentException('Unsupported OAuth provider.');
        }

        $jwks = $this->jwks->fetch($provider);

        try {
            /** @var stdClass $decoded */
            $decoded = JWT::decode($idToken, JWK::parseKeySet($jwks));
        } catch (Throwable $exception) {
            throw new InvalidArgumentException('Invalid OAuth id_token signature.');
        }

        $claims = $this->toArray($decoded);
        $this->validateStandardClaims($provider, $claims);

        return $claims;
    }

    /**
     * @param  array<string, mixed>  $claims
     */
    private function validateStandardClaims(string $provider, array $claims): void
    {
        $issuer = (string) ($claims['iss'] ?? '');
        /** @var list<string> $issuers */
        $issuers = (array) config("oauth.providers.{$provider}.issuers", []);
        if ($issuers !== [] && ! in_array($issuer, $issuers, true)) {
            throw new InvalidArgumentException('OAuth id_token issuer mismatch.');
        }

        $audience = (string) ($claims['aud'] ?? '');
        /** @var list<string> $audiences */
        $audiences = (array) config("oauth.providers.{$provider}.audiences", []);
        if ($audiences !== [] && ! in_array($audience, $audiences, true)) {
            throw new InvalidArgumentException('OAuth id_token audience mismatch.');
        }

        $expiresAt = (int) ($claims['exp'] ?? 0);
        if ($expiresAt > 0 && $expiresAt < now()->timestamp) {
            throw new InvalidArgumentException('OAuth id_token expired.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function toArray(stdClass $decoded): array
    {
        return json_decode((string) json_encode($decoded, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
    }
}
