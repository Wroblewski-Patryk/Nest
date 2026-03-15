<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ReferenceDictionarySeeder::class,
        ]);

        $tenant = Tenant::query()->firstOrCreate(
            ['slug' => 'nest-personal-workspace'],
            [
                'name' => 'Nest Personal Workspace',
                'is_active' => true,
            ]
        );

        $user = User::query()->firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'email' => 'test@example.com',
            ],
            [
                'name' => 'Test User',
                'password' => 'password',
                'timezone' => 'UTC',
                'settings' => [],
            ]
        );

        $templates = DB::table('life_area_templates')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $timestamp = now();

        foreach ($templates as $template) {
            $existingLifeArea = DB::table('life_areas')
                ->where('tenant_id', $tenant->id)
                ->where('name', $template->name)
                ->first();

            if ($existingLifeArea === null) {
                DB::table('life_areas')->insert([
                    'id' => (string) Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'user_id' => $user->id,
                    'name' => $template->name,
                    'color' => $template->color,
                    'weight' => $template->default_weight,
                    'is_archived' => false,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                    'deleted_at' => null,
                ]);

                continue;
            }

            DB::table('life_areas')
                ->where('id', $existingLifeArea->id)
                ->update([
                    'user_id' => $user->id,
                    'color' => $template->color,
                    'weight' => $template->default_weight,
                    'is_archived' => false,
                    'updated_at' => $timestamp,
                    'deleted_at' => null,
                ]);
        }
    }
}
