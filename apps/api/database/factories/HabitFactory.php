<?php

namespace Database\Factories;

use App\Models\Habit;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Habit>
 */
class HabitFactory extends Factory
{
    protected $model = Habit::class;

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
            'life_area_id' => null,
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'type' => 'boolean',
            'cadence' => ['type' => 'daily'],
            'is_active' => true,
        ];
    }
}
