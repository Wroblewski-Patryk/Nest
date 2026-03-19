<?php

namespace App\Auth\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

class JwkSetFetcher
{
    /**
     * @return array<string, mixed>
     */
    public function fetch(string $provider): array
    {
        /** @var array<string, mixed>|null $inline */
        $inline = config("oauth.providers.{$provider}.jwks");
        if (is_array($inline) && array_key_exists('keys', $inline)) {
            return $inline;
        }

        $url = (string) config("oauth.providers.{$provider}.jwks_url", '');
        if ($url === '') {
            throw new InvalidArgumentException("Missing OAuth JWK URL for provider [{$provider}].");
        }

        $cacheKey = "oauth:jwks:{$provider}:".md5($url);

        /** @var array<string, mixed> $jwks */
        $jwks = Cache::remember($cacheKey, now()->addHours(6), function () use ($url, $provider): array {
            $response = Http::acceptJson()->timeout(10)->get($url);

            if (! $response->ok()) {
                throw new InvalidArgumentException(
                    "Unable to fetch OAuth JWK set for provider [{$provider}] (HTTP {$response->status()})."
                );
            }

            /** @var array<string, mixed> $json */
            $json = (array) $response->json();
            if (! array_key_exists('keys', $json) || ! is_array($json['keys'])) {
                throw new InvalidArgumentException("Invalid OAuth JWK set payload for provider [{$provider}].");
            }

            return $json;
        });

        return $jwks;
    }
}
