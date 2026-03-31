<?php

namespace Database\Factories;

use App\Models\NotificationPreference;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationPreference>
 */
class NotificationPreferenceFactory extends Factory
{
    protected $model = NotificationPreference::class;

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
            'channels' => [
                'push' => true,
                'email' => false,
                'in_app' => true,
            ],
            'event_channels' => [],
            'quiet_hours_enabled' => false,
            'quiet_hours_start' => null,
            'quiet_hours_end' => null,
            'quiet_hours_timezone' => 'UTC',
            'locale' => 'en-US',
        ];
    }
}
