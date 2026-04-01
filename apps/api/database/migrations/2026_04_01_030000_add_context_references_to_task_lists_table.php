<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('task_lists', function (Blueprint $table): void {
            $table->foreignUuid('goal_id')->nullable()->after('project_id')->constrained('goals')->nullOnDelete();
            $table->foreignUuid('target_id')->nullable()->after('goal_id')->constrained('targets')->nullOnDelete();
            $table->foreignUuid('life_area_id')->nullable()->after('target_id')->constrained('life_areas')->nullOnDelete();

            $table->index(['tenant_id', 'goal_id'], 'task_lists_tenant_goal_idx');
            $table->index(['tenant_id', 'target_id'], 'task_lists_tenant_target_idx');
            $table->index(['tenant_id', 'life_area_id'], 'task_lists_tenant_life_area_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_lists', function (Blueprint $table): void {
            $table->dropIndex('task_lists_tenant_goal_idx');
            $table->dropIndex('task_lists_tenant_target_idx');
            $table->dropIndex('task_lists_tenant_life_area_idx');

            $table->dropConstrainedForeignId('life_area_id');
            $table->dropConstrainedForeignId('target_id');
            $table->dropConstrainedForeignId('goal_id');
        });
    }
};
