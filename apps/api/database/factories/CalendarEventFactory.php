<?php

namespace Database\Factories;

use App\Models\CalendarEvent;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CalendarEvent>
 */
class CalendarEventFactory extends Factory
{
    protected $model = CalendarEvent::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenant = Tenant::factory();
        $user = User::factory()->for($tenant, 'tenant');
        $start = fake()->dateTimeBetween('+1 day', '+30 days');
        $end = (clone $start)->modify('+1 hour');

        return [
            'tenant_id' => $tenant,
            'user_id' => $user,
            'assignee_user_id' => null,
            'reminder_owner_user_id' => null,
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'start_at' => $start,
            'end_at' => $end,
            'timezone' => 'UTC',
            'all_day' => false,
            'source' => 'internal',
            'linked_entity_type' => null,
            'linked_entity_id' => null,
        ];
    }
}
