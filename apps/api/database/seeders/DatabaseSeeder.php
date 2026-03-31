<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

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

        $adminUser = User::query()->firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'email' => 'admin@admin.com',
            ],
            [
                'name' => 'Admin User',
                'password' => 'password',
                'timezone' => 'UTC',
                'settings' => [],
            ]
        );

        $adminSettings = is_array($adminUser->settings) ? $adminUser->settings : [];
        $adminSettings['language'] = $adminSettings['language'] ?? 'pl';
        $adminSettings['locale'] = $adminSettings['locale'] ?? 'pl-PL';
        $adminSettings['onboarding_completed_at'] = $adminSettings['onboarding_completed_at'] ?? Carbon::now()->toIso8601String();

        $adminUser->forceFill([
            'name' => 'Admin User',
            'password' => 'password',
            'timezone' => 'UTC',
            'settings' => $adminSettings,
        ])->save();

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
                    'user_id' => $adminUser->id,
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
                    'user_id' => $adminUser->id,
                    'color' => $template->color,
                    'weight' => $template->default_weight,
                    'is_archived' => false,
                    'updated_at' => $timestamp,
                    'deleted_at' => null,
                ]);
        }
    }
}
