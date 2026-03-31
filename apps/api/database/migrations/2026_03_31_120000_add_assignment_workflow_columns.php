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
            $table->foreignUuid('assignee_user_id')
                ->nullable()
                ->after('user_id')
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignUuid('reminder_owner_user_id')
                ->nullable()
                ->after('assignee_user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->index(['tenant_id', 'assignee_user_id'], 'tasks_tenant_assignee_idx');
            $table->index(['tenant_id', 'reminder_owner_user_id'], 'tasks_tenant_reminder_owner_idx');
        });

        Schema::table('calendar_events', function (Blueprint $table): void {
            $table->foreignUuid('assignee_user_id')
                ->nullable()
                ->after('user_id')
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignUuid('reminder_owner_user_id')
                ->nullable()
                ->after('assignee_user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->index(['tenant_id', 'assignee_user_id'], 'calendar_events_tenant_assignee_idx');
            $table->index(['tenant_id', 'reminder_owner_user_id'], 'calendar_events_tenant_reminder_owner_idx');
        });

        Schema::create('assignment_timelines', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('entity_type', 64);
            $table->uuid('entity_id');
            $table->string('action', 32);
            $table->foreignUuid('from_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('note', 500)->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['tenant_id', 'entity_type', 'entity_id', 'occurred_at'], 'assignment_timeline_entity_idx');
            $table->index(['tenant_id', 'changed_by_user_id', 'occurred_at'], 'assignment_timeline_actor_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_timelines');

        Schema::table('calendar_events', function (Blueprint $table): void {
            $table->dropIndex('calendar_events_tenant_assignee_idx');
            $table->dropIndex('calendar_events_tenant_reminder_owner_idx');
            $table->dropConstrainedForeignId('assignee_user_id');
            $table->dropConstrainedForeignId('reminder_owner_user_id');
        });

        Schema::table('tasks', function (Blueprint $table): void {
            $table->dropIndex('tasks_tenant_assignee_idx');
            $table->dropIndex('tasks_tenant_reminder_owner_idx');
            $table->dropConstrainedForeignId('assignee_user_id');
            $table->dropConstrainedForeignId('reminder_owner_user_id');
        });
    }
};
