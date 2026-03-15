<?php

namespace Database\Factories;

use App\Models\JournalEntry;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JournalEntry>
 */
class JournalEntryFactory extends Factory
{
    protected $model = JournalEntry::class;

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
            'title' => fake()->sentence(4),
            'body' => fake()->paragraph(3),
            'mood' => fake()->randomElement(['low', 'neutral', 'good', 'great']),
            'entry_date' => fake()->date(),
        ];
    }
}
