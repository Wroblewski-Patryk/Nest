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
        Schema::table('tasks', function (Blueprint $table): void {
            $table->dropForeign(['list_id']);
        });

        Schema::table('tasks', function (Blueprint $table): void {
            $table->uuid('list_id')->nullable()->change();
        });

        Schema::table('tasks', function (Blueprint $table): void {
            $table->foreign('list_id')->references('id')->on('task_lists')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table): void {
            $table->dropForeign(['list_id']);
        });

        Schema::table('tasks', function (Blueprint $table): void {
            $table->uuid('list_id')->nullable(false)->change();
        });

        Schema::table('tasks', function (Blueprint $table): void {
            $table->foreign('list_id')->references('id')->on('task_lists')->cascadeOnDelete();
        });
    }
};

