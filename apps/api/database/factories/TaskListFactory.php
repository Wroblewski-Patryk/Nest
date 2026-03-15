<?php

namespace Database\Factories;

use App\Models\TaskList;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaskList>
 */
class TaskListFactory extends Factory
{
    protected $model = TaskList::class;

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
            'project_id' => null,
            'name' => fake()->unique()->words(2, true),
            'color' => '#4F46E5',
            'position' => 0,
            'is_archived' => false,
        ];
    }
}
