<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OAuthProviderAuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_oauth_exchange_creates_new_account_and_links_identity(): void
    {
        [$secret, $jwk] = $this->generateSymmetricJwk();
        config()->set('oauth.providers.google.jwks', ['keys' => [$jwk]]);
        config()->set('oauth.providers.google.audiences', ['google-client-id']);

        $token = $this->buildIdToken(
            $secret,
            'google-test-kid',
            [
                'iss' => 'https://accounts.google.com',
                'aud' => 'google-client-id',
                'sub' => 'google-user-123',
                'email' => 'oauth-new@example.com',
                'email_verified' => true,
                'name' => 'OAuth New',
            ]
        );

        $response = $this->postJson('/api/v1/auth/oauth/google/exchange', [
            'id_token' => $token,
        ])->assertOk();

        $this->assertNotNull($response->json('data.token'));
        $this->assertTrue((bool) $response->json('data.created'));
        $this->assertDatabaseHas('oauth_identities', [
            'provider' => 'google',
            'provider_user_id' => 'google-user-123',
            'email' => 'oauth-new@example.com',
        ]);
    }

    public function test_google_oauth_exchange_links_to_existing_user_by_tenant_slug(): void
    {
        [$secret, $jwk] = $this->generateSymmetricJwk();
        config()->set('oauth.providers.google.jwks', ['keys' => [$jwk]]);
        config()->set('oauth.providers.google.audiences', ['google-client-id']);

        $tenant = Tenant::factory()->create(['slug' => 'alpha-workspace']);
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'existing@example.com',
        ]);

        $token = $this->buildIdToken(
            $secret,
            'google-test-kid',
            [
                'iss' => 'https://accounts.google.com',
                'aud' => 'google-client-id',
                'sub' => 'google-existing-1',
                'email' => 'existing@example.com',
                'email_verified' => true,
                'name' => 'Existing User',
            ]
        );

        $this->postJson('/api/v1/auth/oauth/google/exchange', [
            'id_token' => $token,
            'tenant_slug' => 'alpha-workspace',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.created', false);

        $this->assertDatabaseHas('oauth_identities', [
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => 'google-existing-1',
        ]);
    }

    public function test_oauth_exchange_rejects_ambiguous_email_linking_without_tenant_slug(): void
    {
        [$secret, $jwk] = $this->generateSymmetricJwk();
        config()->set('oauth.providers.google.jwks', ['keys' => [$jwk]]);
        config()->set('oauth.providers.google.audiences', ['google-client-id']);

        $sharedEmail = 'shared@example.com';
        User::factory()->create(['tenant_id' => Tenant::factory()->create()->id, 'email' => $sharedEmail]);
        User::factory()->create(['tenant_id' => Tenant::factory()->create()->id, 'email' => $sharedEmail]);

        $token = $this->buildIdToken(
            $secret,
            'google-test-kid',
            [
                'iss' => 'https://accounts.google.com',
                'aud' => 'google-client-id',
                'sub' => 'google-shared-1',
                'email' => $sharedEmail,
                'email_verified' => true,
                'name' => 'Shared User',
            ]
        );

        $this->postJson('/api/v1/auth/oauth/google/exchange', [
            'id_token' => $token,
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Multiple tenant accounts share this email. Provide tenant_slug to link safely.');
    }

    public function test_oauth_exchange_rejects_unverified_email(): void
    {
        [$secret, $jwk] = $this->generateSymmetricJwk();
        config()->set('oauth.providers.apple.jwks', ['keys' => [$jwk]]);
        config()->set('oauth.providers.apple.audiences', ['apple-client-id']);

        $token = $this->buildIdToken(
            $secret,
            'google-test-kid',
            [
                'iss' => 'https://appleid.apple.com',
                'aud' => 'apple-client-id',
                'sub' => 'apple-user-1',
                'email' => 'apple-user@example.com',
                'email_verified' => false,
                'name' => 'Apple User',
            ]
        );

        $this->postJson('/api/v1/auth/oauth/apple/exchange', [
            'id_token' => $token,
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'OAuth account email must be verified.');
    }

    /**
     * @return array{string, array<string, string>}
     */
    private function generateSymmetricJwk(): array
    {
        $secret = 'oauth-test-secret-1234567890-abcdefghijklmnopqrstuvwxyz';

        $jwk = [
            'kty' => 'oct',
            'alg' => 'HS256',
            'use' => 'sig',
            'kid' => 'google-test-kid',
            'k' => $this->base64UrlEncode($secret),
        ];

        return [$secret, $jwk];
    }

    /**
     * @param  array<string, mixed>  $claims
     */
    private function buildIdToken(string $secret, string $kid, array $claims): string
    {
        $payload = [
            ...$claims,
            'iat' => now()->timestamp,
            'exp' => now()->addHour()->timestamp,
        ];

        return JWT::encode($payload, $secret, 'HS256', $kid);
    }

    public function test_oauth_exchange_rejects_unsupported_provider(): void
    {
        $this->postJson('/api/v1/auth/oauth/facebook/exchange', [
            'id_token' => 'dummy-token',
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Unsupported OAuth provider.');
    }

    private function base64UrlEncode(string $input): string
    {
        return rtrim(strtr(base64_encode($input), '+/', '-_'), '=');
    }
}
