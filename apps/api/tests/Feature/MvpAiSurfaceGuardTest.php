<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MvpAiSurfaceGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_surface_feature_flag_is_disabled_by_default(): void
    {
        $this->assertFalse(config('features.ai_surface_enabled'));
    }

    public function test_api_has_no_public_ai_routes_in_mvp(): void
    {
        $aiRoutes = collect(Route::getRoutes())
            ->map(fn ($route): string => $route->uri())
            ->filter(fn (string $uri): bool => str_starts_with($uri, 'api/v1/ai'))
            ->values();

        $this->assertCount(0, $aiRoutes);
    }

    public function test_ai_endpoint_pattern_returns_not_found_for_authenticated_user(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/chat', [
            'message' => 'hello',
        ])->assertNotFound();
    }
}
