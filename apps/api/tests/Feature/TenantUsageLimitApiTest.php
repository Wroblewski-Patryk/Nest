<?php

namespace Tests\Feature;

use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantUsageLimitApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_list_limit_is_enforced_per_tenant_with_clear_error(): void
    {
        config()->set('tenant_usage_limits.resources.task_lists.limit', 1);

        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        TaskList::factory()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'name' => 'Tenant A existing',
        ]);

        Sanctum::actingAs($userA);
        $this->postJson('/api/v1/lists', [
            'name' => 'Tenant A blocked',
        ])
            ->assertStatus(429)
            ->assertJsonPath('error.code', 'tenant_quota_exceeded')
            ->assertJsonPath('error.resource', 'task_lists')
            ->assertJsonPath('error.limit', 1);

        Sanctum::actingAs($userB);
        $this->postJson('/api/v1/lists', [
            'name' => 'Tenant B allowed',
        ])->assertCreated();
    }

    public function test_automation_rule_limit_is_enforced_with_consistent_error_payload(): void
    {
        config()->set('tenant_usage_limits.resources.automation_rules.limit', 1);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $payload = [
            'name' => 'Rule 1',
            'status' => 'active',
            'trigger' => ['type' => 'event', 'event_name' => 'tasks.task.created'],
            'conditions' => [
                [
                    'field' => 'event_name',
                    'operator' => 'equals',
                    'value' => 'tasks.task.created',
                ],
            ],
            'actions' => [
                [
                    'type' => 'send_notification',
                    'payload' => ['message' => 'x'],
                ],
            ],
        ];

        $this->postJson('/api/v1/automations/rules', $payload)->assertCreated();

        $this->postJson('/api/v1/automations/rules', [
            ...$payload,
            'name' => 'Rule 2',
        ])
            ->assertStatus(429)
            ->assertJsonPath('error.code', 'tenant_quota_exceeded')
            ->assertJsonPath('error.resource', 'automation_rules')
            ->assertJsonPath('error.limit', 1);
    }
}
