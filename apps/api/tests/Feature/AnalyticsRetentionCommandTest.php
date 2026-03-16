<?php

namespace Tests\Feature;

use App\Models\AnalyticsEvent;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsRetentionCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_analytics_prune_command_deletes_events_older_than_retention_window(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        AnalyticsEvent::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'tasks.task.created',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'tasks',
            'session_id' => 'old-session',
            'trace_id' => 'old-trace',
            'properties' => ['task_id' => 'old-task'],
            'occurred_at' => now()->subDays(30),
            'received_at' => now()->subDays(30),
        ]);

        AnalyticsEvent::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'event_name' => 'tasks.task.created',
            'event_version' => '1.0',
            'platform' => 'web',
            'module' => 'tasks',
            'session_id' => 'new-session',
            'trace_id' => 'new-trace',
            'properties' => ['task_id' => 'new-task'],
            'occurred_at' => now()->subDays(1),
            'received_at' => now()->subDays(1),
        ]);

        $this->artisan('analytics:prune-events --days=7')
            ->expectsOutputToContain('Deleted events: 1')
            ->assertExitCode(0);

        $this->assertDatabaseCount('analytics_events', 1);
        $this->assertDatabaseHas('analytics_events', [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'session_id' => 'new-session',
        ]);
    }
}
