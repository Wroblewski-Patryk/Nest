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
        Schema::table('life_areas', function (Blueprint $table): void {
            $table->dropUnique('life_areas_tenant_id_name_unique');
            $table->unique(['tenant_id', 'name', 'deleted_at'], 'life_areas_tenant_name_deleted_unique');
        });

        Schema::table('task_lists', function (Blueprint $table): void {
            $table->dropUnique('task_lists_tenant_id_user_id_name_unique');
            $table->unique(
                ['tenant_id', 'user_id', 'name', 'deleted_at'],
                'task_lists_tenant_user_name_deleted_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('life_areas', function (Blueprint $table): void {
            $table->dropUnique('life_areas_tenant_name_deleted_unique');
            $table->unique(['tenant_id', 'name']);
        });

        Schema::table('task_lists', function (Blueprint $table): void {
            $table->dropUnique('task_lists_tenant_user_name_deleted_unique');
            $table->unique(['tenant_id', 'user_id', 'name']);
        });
    }
};
