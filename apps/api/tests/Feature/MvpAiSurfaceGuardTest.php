<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MvpAiSurfaceGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_surface_feature_flag_is_disabled_by_default(): void
    {
        $this->assertFalse(config('features.ai_surface_enabled'));
    }

    public function test_ai_route_returns_not_found_when_feature_flag_is_disabled(): void
    {
        config()->set('features.ai_surface_enabled', false);
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/weekly-plan/propose', [
            'constraints' => ['available_hours' => 8],
        ])->assertNotFound();
    }
}
