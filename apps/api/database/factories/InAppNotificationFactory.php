<?php

namespace Database\Factories;

use App\Models\InAppNotification;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InAppNotification>
 */
class InAppNotificationFactory extends Factory
{
    protected $model = InAppNotification::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenant = Tenant::factory();
        $user = User::factory()->for($tenant, 'tenant');

        return [
            'tenant_id' => $tenant,
            'user_id' => $user,
            'event_type' => 'task_assigned',
            'title' => fake()->sentence(3),
            'body' => fake()->sentence(8),
            'module' => 'tasks',
            'entity_type' => 'task',
            'entity_id' => null,
            'deep_link' => '/tasks',
            'payload' => null,
            'is_read' => false,
            'read_at' => null,
            'snoozed_until' => null,
        ];
    }
}
