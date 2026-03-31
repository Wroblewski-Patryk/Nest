<?php

namespace Database\Factories;

use App\Models\NotificationChannelDelivery;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationChannelDelivery>
 */
class NotificationChannelDeliveryFactory extends Factory
{
    protected $model = NotificationChannelDelivery::class;

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
            'channel' => 'in_app',
            'event_type' => 'task_assigned',
            'status' => 'sent',
            'failure_reason' => null,
            'title' => fake()->sentence(3),
            'payload' => null,
            'metadata' => null,
            'delivered_at' => now(),
        ];
    }
}
