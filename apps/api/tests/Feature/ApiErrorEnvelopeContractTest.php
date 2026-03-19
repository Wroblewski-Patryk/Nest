<?php

namespace Tests\Feature;

use App\Models\IntegrationSyncFailure;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiErrorEnvelopeContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_request_uses_machine_readable_error_envelope(): void
    {
        $this->getJson('/api/v1/lists')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'auth_required')
            ->assertJsonPath('error.retryable', false)
            ->assertJsonPath('error.http_status', 401)
            ->assertJsonPath('meta.contract_version', '2026-03-19.error.v1');
    }

    public function test_validation_error_uses_machine_readable_error_envelope(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/lists', [])
            ->assertUnprocessable()
            ->assertJsonPath('error.code', 'validation_failed')
            ->assertJsonPath('error.retryable', false)
            ->assertJsonPath('error.http_status', 422)
            ->assertJsonPath('meta.contract_version', '2026-03-19.error.v1')
            ->assertJsonStructure([
                'errors' => ['name'],
            ]);
    }

    public function test_forbidden_error_uses_machine_readable_error_envelope(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $listA = TaskList::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id]);
        $taskA = Task::factory()->create(['tenant_id' => $tenantA->id, 'user_id' => $userA->id, 'list_id' => $listA->id]);

        $failure = IntegrationSyncFailure::query()->create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA->id,
            'provider' => 'trello',
            'idempotency_key' => 'trello:task:policy-envelope',
            'payload' => [
                'tenant_id' => $tenantA->id,
                'user_id' => $userA->id,
                'provider' => 'trello',
                'internal_entity_type' => 'task',
                'internal_entity_id' => $taskA->id,
                'external_id' => 'trello-task-policy-envelope',
                'sync_hash' => 'hash-policy-envelope',
                'idempotency_key' => 'trello:task:policy-envelope',
            ],
            'error_message' => 'Provider timeout',
            'attempts' => 5,
            'failed_at' => now()->subMinute(),
        ]);

        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);
        Sanctum::actingAs($userB);

        $this->postJson("/api/v1/integrations/failures/{$failure->id}/replay")
            ->assertForbidden()
            ->assertJsonPath('error.code', 'forbidden')
            ->assertJsonPath('error.retryable', false)
            ->assertJsonPath('error.http_status', 403)
            ->assertJsonPath('meta.contract_version', '2026-03-19.error.v1');
    }

    public function test_not_found_error_uses_machine_readable_error_envelope(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/lists/00000000-0000-0000-0000-000000000000')
            ->assertNotFound()
            ->assertJsonPath('error.code', 'resource_not_found')
            ->assertJsonPath('error.retryable', false)
            ->assertJsonPath('error.http_status', 404)
            ->assertJsonPath('meta.contract_version', '2026-03-19.error.v1');
    }
}
