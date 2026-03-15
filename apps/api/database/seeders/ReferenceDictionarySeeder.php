<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReferenceDictionarySeeder extends Seeder
{
    /**
     * Seed baseline dictionaries for MVP.
     */
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('task_statuses')->upsert([
            ['code' => 'todo', 'label' => 'To Do', 'sort_order' => 10, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'in_progress', 'label' => 'In Progress', 'sort_order' => 20, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'done', 'label' => 'Done', 'sort_order' => 30, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'canceled', 'label' => 'Canceled', 'sort_order' => 40, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ], ['code'], ['label', 'sort_order', 'is_active', 'updated_at']);

        DB::table('task_priorities')->upsert([
            ['code' => 'low', 'label' => 'Low', 'weight' => 25, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'medium', 'label' => 'Medium', 'weight' => 50, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'high', 'label' => 'High', 'weight' => 75, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'urgent', 'label' => 'Urgent', 'weight' => 100, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ], ['code'], ['label', 'weight', 'is_active', 'updated_at']);

        DB::table('life_area_templates')->upsert([
            ['code' => 'health', 'name' => 'Health', 'color' => '#22C55E', 'default_weight' => 18, 'sort_order' => 10, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'career', 'name' => 'Career', 'color' => '#3B82F6', 'default_weight' => 18, 'sort_order' => 20, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'relationships', 'name' => 'Relationships', 'color' => '#EC4899', 'default_weight' => 16, 'sort_order' => 30, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'learning', 'name' => 'Learning', 'color' => '#8B5CF6', 'default_weight' => 14, 'sort_order' => 40, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'finance', 'name' => 'Finance', 'color' => '#F59E0B', 'default_weight' => 12, 'sort_order' => 50, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'mindset', 'name' => 'Mindset', 'color' => '#06B6D4', 'default_weight' => 11, 'sort_order' => 60, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'fun', 'name' => 'Fun', 'color' => '#F97316', 'default_weight' => 11, 'sort_order' => 70, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ], ['code'], ['name', 'color', 'default_weight', 'sort_order', 'is_active', 'updated_at']);
    }
}
