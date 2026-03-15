<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Goal>
 */
class GoalFactory extends Factory
{
    protected $model = Goal::class;

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
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->sentence(),
            'status' => 'active',
            'target_date' => fake()->optional()->date(),
        ];
    }
}
