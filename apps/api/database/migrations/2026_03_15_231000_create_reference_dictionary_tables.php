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
        Schema::create('task_statuses', function (Blueprint $table) {
            $table->string('code', 32)->primary();
            $table->string('label', 80);
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('task_priorities', function (Blueprint $table) {
            $table->string('code', 16)->primary();
            $table->string('label', 80);
            $table->unsignedTinyInteger('weight')->default(50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('life_area_templates', function (Blueprint $table) {
            $table->string('code', 64)->primary();
            $table->string('name', 120);
            $table->char('color', 7);
            $table->unsignedTinyInteger('default_weight')->default(50);
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('life_area_templates');
        Schema::dropIfExists('task_priorities');
        Schema::dropIfExists('task_statuses');
    }
};
