<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'list_id' => TaskList::factory(),
            'tenant_id' => function (array $attributes): ?string {
                return TaskList::query()->find($attributes['list_id'])?->tenant_id;
            },
            'user_id' => function (array $attributes): ?string {
                return TaskList::query()->find($attributes['list_id'])?->user_id;
            },
            'assignee_user_id' => null,
            'reminder_owner_user_id' => null,
            'project_id' => null,
            'life_area_id' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'status' => 'todo',
            'priority' => 'medium',
            'due_date' => fake()->optional()->date(),
            'starts_at' => null,
            'completed_at' => null,
            'source' => 'internal',
            'sort_order' => 0,
        ];
    }
}
