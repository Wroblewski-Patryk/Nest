<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_email_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'password' => 'secret-pass',
            'password_confirmation' => 'secret-pass',
            'timezone' => 'Europe/Berlin',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.email', 'alice@example.com')
            ->assertJsonPath('data.user.timezone', 'Europe/Berlin')
            ->assertJsonPath('data.user.language', 'en')
            ->assertJsonPath('data.user.locale', 'en-US');

        $this->assertDatabaseHas('users', [
            'email' => 'alice@example.com',
        ]);
    }

    public function test_user_can_register_with_explicit_localization_preferences(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ala',
            'email' => 'ala@example.com',
            'password' => 'secret-pass',
            'password_confirmation' => 'secret-pass',
            'language' => 'pl',
            'locale' => 'pl-PL',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.email', 'ala@example.com')
            ->assertJsonPath('data.user.language', 'pl')
            ->assertJsonPath('data.user.locale', 'pl-PL');
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $tenant = Tenant::factory()->create();
        User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.email', 'john@example.com');
    }

    public function test_authenticated_user_can_read_and_update_settings(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'timezone' => 'UTC',
            'settings' => ['theme' => 'light', 'language' => 'en', 'locale' => 'en-US'],
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.timezone', 'UTC')
            ->assertJsonPath('data.settings.theme', 'light')
            ->assertJsonPath('data.language', 'en')
            ->assertJsonPath('data.locale', 'en-US');

        $this->patchJson('/api/v1/auth/settings', [
            'timezone' => 'Europe/Warsaw',
            'settings' => ['theme' => 'dark', 'daily_digest' => true],
            'language' => 'pl',
            'locale' => 'pl-PL',
        ])
            ->assertOk()
            ->assertJsonPath('data.timezone', 'Europe/Warsaw')
            ->assertJsonPath('data.settings.theme', 'dark')
            ->assertJsonPath('data.settings.daily_digest', true)
            ->assertJsonPath('data.language', 'pl')
            ->assertJsonPath('data.locale', 'pl-PL');
    }

    public function test_guest_cannot_access_protected_profile_routes(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->patchJson('/api/v1/auth/settings', ['timezone' => 'UTC'])->assertUnauthorized();
        $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
    }
}
