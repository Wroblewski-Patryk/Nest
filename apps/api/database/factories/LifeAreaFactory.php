<?php

namespace Database\Factories;

use App\Models\LifeArea;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LifeArea>
 */
class LifeAreaFactory extends Factory
{
    protected $model = LifeArea::class;

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
            'name' => fake()->unique()->word(),
            'color' => '#4F46E5',
            'weight' => fake()->numberBetween(5, 30),
            'is_archived' => false,
        ];
    }
}
