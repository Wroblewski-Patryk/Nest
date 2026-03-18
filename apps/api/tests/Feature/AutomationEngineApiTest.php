<?php

namespace Tests\Feature;

use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AutomationEngineApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_execute_rule_and_view_audit_run(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $createRule = $this->postJson('/api/v1/automations/rules', [
            'name' => 'Auto Journal From Task',
            'status' => 'active',
            'trigger' => [
                'type' => 'event',
                'event_name' => 'tasks.task.completed',
            ],
            'conditions' => [
                [
                    'field' => 'event.module',
                    'operator' => 'equals',
                    'value' => 'tasks',
                ],
            ],
            'actions' => [
                [
                    'type' => 'create_journal_entry',
                    'payload' => [
                        'title' => 'Review {{event.task_title}}',
                        'body' => 'Automated weekly reflection.',
                    ],
                ],
            ],
        ])->assertCreated();

        $ruleId = $createRule->json('data.id');

        $execute = $this->postJson("/api/v1/automations/rules/{$ruleId}/execute", [
            'trigger_payload' => [
                'event' => [
                    'module' => 'tasks',
                    'task_title' => 'Deep Work Sprint',
                ],
            ],
        ])->assertOk()
            ->assertJsonPath('data.status', 'success');

        $this->assertDatabaseHas('journal_entries', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Review Deep Work Sprint',
        ]);

        $runId = $execute->json('data.id');
        $this->assertDatabaseHas('automation_runs', [
            'id' => $runId,
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'status' => 'success',
        ]);

        $this->getJson('/api/v1/automations/runs')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $runId);
    }

    public function test_rule_execution_is_skipped_when_conditions_do_not_match(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $ruleId = $this->postJson('/api/v1/automations/rules', [
            'name' => 'Conditioned rule',
            'status' => 'active',
            'trigger' => [
                'type' => 'event',
                'event_name' => 'tasks.task.completed',
            ],
            'conditions' => [
                [
                    'field' => 'event.module',
                    'operator' => 'equals',
                    'value' => 'goals',
                ],
            ],
            'actions' => [
                [
                    'type' => 'create_journal_entry',
                    'payload' => [
                        'title' => 'Should not create',
                        'body' => 'Should not create',
                    ],
                ],
            ],
        ])->json('data.id');

        $this->postJson("/api/v1/automations/rules/{$ruleId}/execute", [
            'trigger_payload' => [
                'event' => [
                    'module' => 'tasks',
                ],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'skipped')
            ->assertJsonPath('data.error_code', 'conditions_not_met');

        $this->assertDatabaseMissing('journal_entries', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'title' => 'Should not create',
        ]);
    }

    public function test_automation_rule_validation_rejects_unsupported_action_type(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/automations/rules', [
            'name' => 'Bad rule',
            'status' => 'active',
            'trigger' => [
                'type' => 'event',
                'event_name' => 'tasks.task.completed',
            ],
            'conditions' => [],
            'actions' => [
                [
                    'type' => 'drop_database',
                    'payload' => [],
                ],
            ],
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['actions.0.type']);
    }

    public function test_automation_rules_are_tenant_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        Sanctum::actingAs($userB);
        $ruleIdB = $this->postJson('/api/v1/automations/rules', [
            'name' => 'Tenant B rule',
            'status' => 'active',
            'trigger' => ['type' => 'event', 'event_name' => 'tasks.task.completed'],
            'conditions' => [
                [
                    'field' => 'event.module',
                    'operator' => 'equals',
                    'value' => 'tasks',
                ],
            ],
            'actions' => [
                [
                    'type' => 'send_notification',
                    'payload' => ['message' => 'x'],
                ],
            ],
        ])
            ->assertCreated()
            ->json('data.id');
        $this->assertNotNull($ruleIdB);

        Sanctum::actingAs($userA);
        $listA = TaskList::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id]);

        $ruleIdA = $this->postJson('/api/v1/automations/rules', [
            'name' => 'Tenant A task rule',
            'status' => 'active',
            'trigger' => ['type' => 'event', 'event_name' => 'tasks.task.completed'],
            'conditions' => [
                [
                    'field' => 'event.module',
                    'operator' => 'equals',
                    'value' => 'tasks',
                ],
            ],
            'actions' => [
                [
                    'type' => 'create_task',
                    'payload' => [
                        'list_id' => $listA->id,
                        'title' => 'A-only task',
                    ],
                ],
            ],
        ])
            ->assertCreated()
            ->json('data.id');
        $this->assertNotNull($ruleIdA);

        $this->getJson("/api/v1/automations/rules/{$ruleIdB}")->assertNotFound();
        $this->postJson("/api/v1/automations/rules/{$ruleIdA}/execute", [
            'trigger_payload' => [
                'event' => [
                    'module' => 'tasks',
                ],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('tasks', [
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'title' => 'A-only task',
        ]);
    }

    public function test_guest_cannot_access_automation_engine_endpoints(): void
    {
        $this->getJson('/api/v1/automations/rules')->assertUnauthorized();
        $this->postJson('/api/v1/automations/rules', [])->assertUnauthorized();
        $this->getJson('/api/v1/automations/runs')->assertUnauthorized();
    }
}
