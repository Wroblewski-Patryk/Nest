<?php

namespace Tests\Feature;

use App\Models\InAppNotification;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiBriefingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_briefing_creates_summary_and_notification_with_insights_deep_link(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $list = TaskList::factory()->create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);
        Task::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'list_id' => $list->id,
            'title' => 'Finish weekly review',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/briefings/generate', [
            'cadence' => 'daily',
            'scope_modules' => ['tasks', 'goals', 'insights'],
            'window_days' => 2,
            'as_of' => '2026-03-31T09:00:00Z',
        ])->assertCreated();

        $response
            ->assertJsonPath('data.cadence', 'daily')
            ->assertJsonPath('data.scope_modules.0', 'tasks')
            ->assertJsonPath('data.scope_modules.1', 'goals')
            ->assertJsonPath('data.scope_modules.2', 'insights');

        $briefingId = (string) $response->json('data.id');

        $notification = InAppNotification::query()
            ->where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)
            ->where('event_type', 'ai_briefing_generated')
            ->latest('created_at')
            ->first();

        $this->assertNotNull($notification);
        $this->assertSame('/insights', $notification?->deep_link);
        $this->assertSame($briefingId, (string) ($notification?->payload['briefing_id'] ?? ''));
    }

    public function test_briefing_preferences_can_be_updated_and_enforced(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->patchJson('/api/v1/ai/briefings/preferences', [
            'daily_enabled' => false,
            'weekly_enabled' => true,
            'scope_modules' => ['tasks', 'calendar'],
            'timezone' => 'Europe/Warsaw',
        ])
            ->assertOk()
            ->assertJsonPath('data.daily_enabled', false)
            ->assertJsonPath('data.weekly_enabled', true)
            ->assertJsonPath('data.scope_modules.0', 'tasks')
            ->assertJsonPath('data.scope_modules.1', 'calendar')
            ->assertJsonPath('data.timezone', 'Europe/Warsaw');

        $this->postJson('/api/v1/ai/briefings/generate', [
            'cadence' => 'daily',
        ])
            ->assertStatus(422)
            ->assertJsonPath('errors.cadence.0', 'Daily briefing is disabled in preferences.');
    }

    public function test_briefing_records_are_tenant_scoped(): void
    {
        config()->set('features.ai_surface_enabled', true);

        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);

        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        Sanctum::actingAs($userA);
        $briefingId = (string) $this->postJson('/api/v1/ai/briefings/generate', [
            'cadence' => 'weekly',
            'as_of' => '2026-03-31T09:00:00Z',
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($userB);
        $this->getJson("/api/v1/ai/briefings/{$briefingId}")->assertNotFound();
    }
}
