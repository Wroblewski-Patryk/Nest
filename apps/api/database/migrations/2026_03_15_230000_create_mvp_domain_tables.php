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
        Schema::create('life_areas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->char('color', 7)->default('#4F46E5');
            $table->unsignedTinyInteger('weight')->default(50);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'name']);
            $table->index(['tenant_id', 'user_id']);
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('life_area_id')->nullable()->constrained('life_areas')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 32)->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
        });

        Schema::create('task_lists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->string('name', 120);
            $table->char('color', 7)->default('#4F46E5');
            $table->integer('position')->default(0);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'user_id', 'name']);
            $table->index(['tenant_id', 'project_id']);
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('list_id')->constrained('task_lists')->cascadeOnDelete();
            $table->foreignUuid('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignUuid('life_area_id')->nullable()->constrained('life_areas')->nullOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('status', 32)->default('todo');
            $table->string('priority', 16)->default('medium');
            $table->date('due_date')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('source', 32)->default('internal');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status', 'due_date']);
            $table->index(['tenant_id', 'priority', 'due_date']);
            $table->index(['list_id', 'status']);
        });

        Schema::create('habits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('life_area_id')->nullable()->constrained('life_areas')->nullOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('type', 16)->default('boolean');
            $table->json('cadence');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'user_id']);
        });

        Schema::create('habit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('habit_id')->constrained('habits')->cascadeOnDelete();
            $table->timestamp('logged_at');
            $table->decimal('value_numeric', 12, 2)->nullable();
            $table->unsignedInteger('value_seconds')->nullable();
            $table->string('note', 1000)->nullable();
            $table->timestamps();

            $table->unique(['habit_id', 'logged_at']);
            $table->index(['tenant_id', 'logged_at']);
        });

        Schema::create('routines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'user_id']);
        });

        Schema::create('routine_steps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('routine_id')->constrained('routines')->cascadeOnDelete();
            $table->unsignedSmallInteger('step_order');
            $table->string('title', 255);
            $table->text('details')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->timestamps();

            $table->unique(['routine_id', 'step_order']);
            $table->index(['tenant_id', 'routine_id']);
        });

        Schema::create('goals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('life_area_id')->nullable()->constrained('life_areas')->nullOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('status', 32)->default('active');
            $table->date('target_date')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
        });

        Schema::create('targets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('goal_id')->constrained('goals')->cascadeOnDelete();
            $table->string('title', 255);
            $table->string('metric_type', 64);
            $table->decimal('value_target', 12, 2);
            $table->decimal('value_current', 12, 2)->default(0);
            $table->string('unit', 32)->nullable();
            $table->date('due_date')->nullable();
            $table->string('status', 32)->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['goal_id', 'status']);
        });

        Schema::create('journal_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('body');
            $table->string('mood', 16)->nullable();
            $table->date('entry_date');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'entry_date']);
        });

        Schema::create('journal_entry_life_area', function (Blueprint $table) {
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('journal_entry_id')->constrained('journal_entries')->cascadeOnDelete();
            $table->foreignUuid('life_area_id')->constrained('life_areas')->cascadeOnDelete();

            $table->primary(['journal_entry_id', 'life_area_id']);
            $table->index(['tenant_id', 'life_area_id']);
        });

        Schema::create('calendar_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->string('timezone', 64)->default('UTC');
            $table->boolean('all_day')->default(false);
            $table->string('source', 32)->default('internal');
            $table->string('linked_entity_type', 64)->nullable();
            $table->uuid('linked_entity_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'start_at']);
            $table->index(['tenant_id', 'linked_entity_type', 'linked_entity_id'], 'calendar_linked_entity_idx');
        });

        Schema::create('sync_mappings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('provider', 64);
            $table->string('external_id', 255);
            $table->string('internal_entity_type', 64);
            $table->uuid('internal_entity_id');
            $table->timestamp('last_sync_at')->nullable();
            $table->string('last_sync_status', 32)->nullable();
            $table->string('sync_hash', 128)->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'provider', 'external_id']);
            $table->index(['tenant_id', 'internal_entity_type', 'internal_entity_id'], 'sync_internal_entity_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_mappings');
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('journal_entry_life_area');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('targets');
        Schema::dropIfExists('goals');
        Schema::dropIfExists('routine_steps');
        Schema::dropIfExists('routines');
        Schema::dropIfExists('habit_logs');
        Schema::dropIfExists('habits');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('task_lists');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('life_areas');
    }
};
