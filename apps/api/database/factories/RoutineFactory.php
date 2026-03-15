<?php

namespace Database\Factories;

use App\Models\Routine;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Routine>
 */
class RoutineFactory extends Factory
{
    protected $model = Routine::class;

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
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }
}
