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
        Schema::create('analytics_events', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('event_name', 120);
            $table->string('event_version', 16);
            $table->string('platform', 24);
            $table->string('module', 32);
            $table->string('session_id', 120)->nullable();
            $table->string('trace_id', 120)->nullable();
            $table->json('properties')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamp('received_at');
            $table->timestamps();

            $table->index(['tenant_id', 'occurred_at'], 'analytics_events_tenant_occurred_idx');
            $table->index(['tenant_id', 'module', 'occurred_at'], 'analytics_events_module_idx');
            $table->index(['tenant_id', 'event_name', 'occurred_at'], 'analytics_events_name_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
