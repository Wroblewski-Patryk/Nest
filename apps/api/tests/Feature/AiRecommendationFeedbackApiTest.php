<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiRecommendationFeedbackApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_feedback_endpoint_returns_not_found_when_ai_surface_is_disabled(): void
    {
        config()->set('features.ai_surface_enabled', false);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/feedback', [
            'recommendation_type' => 'weekly_plan_item',
            'recommendation_id' => 'item-1',
            'decision' => 'accept',
        ])->assertNotFound();
    }

    public function test_user_can_submit_accept_and_edit_feedback(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/feedback', [
            'recommendation_type' => 'weekly_plan_item',
            'recommendation_id' => 'item-accept',
            'decision' => 'accept',
            'reason_codes' => ['fits_schedule'],
        ])
            ->assertCreated()
            ->assertJsonPath('data.decision', 'accept');

        $this->assertDatabaseHas('ai_recommendation_feedback', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'recommendation_id' => 'item-accept',
            'decision' => 'accept',
        ]);

        $this->postJson('/api/v1/ai/feedback', [
            'recommendation_type' => 'weekly_plan_item',
            'recommendation_id' => 'item-edit',
            'decision' => 'edit',
            'edited_payload' => [
                'scheduled_for' => now()->addDay()->toDateString(),
                'estimated_minutes' => 60,
            ],
            'reason_codes' => ['too_long'],
            'note' => 'Reduced duration to match calendar.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.decision', 'edit');
    }

    public function test_edit_feedback_requires_edited_payload(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/feedback', [
            'recommendation_type' => 'weekly_plan_item',
            'recommendation_id' => 'item-edit-invalid',
            'decision' => 'edit',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['edited_payload']);
    }

    public function test_feedback_is_saved_with_authenticated_tenant_user_scope(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        Sanctum::actingAs($userA);

        $this->postJson('/api/v1/ai/feedback', [
            'recommendation_type' => 'weekly_plan_item',
            'recommendation_id' => 'scope-check',
            'decision' => 'reject',
            'reason_codes' => ['not_relevant'],
            'note' => 'Not suitable this week.',
        ])->assertCreated();

        $this->assertDatabaseHas('ai_recommendation_feedback', [
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'recommendation_id' => 'scope-check',
            'decision' => 'reject',
        ]);

        $this->assertDatabaseMissing('ai_recommendation_feedback', [
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id,
            'recommendation_id' => 'scope-check',
        ]);
    }

    public function test_guest_cannot_submit_feedback(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $this->postJson('/api/v1/ai/feedback', [
            'recommendation_type' => 'weekly_plan_item',
            'recommendation_id' => 'guest-item',
            'decision' => 'accept',
        ])->assertUnauthorized();
    }
}
