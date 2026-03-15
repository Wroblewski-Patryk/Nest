<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\Target;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Target>
 */
class TargetFactory extends Factory
{
    protected $model = Target::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'goal_id' => Goal::factory(),
            'tenant_id' => function (array $attributes): ?string {
                return Goal::query()->find($attributes['goal_id'])?->tenant_id;
            },
            'title' => fake()->sentence(3),
            'metric_type' => 'count',
            'value_target' => 10,
            'value_current' => 0,
            'unit' => 'sessions',
            'due_date' => fake()->optional()->date(),
            'status' => 'active',
        ];
    }
}
