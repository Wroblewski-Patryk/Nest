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
        Schema::create('notification_preferences', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('channels')->nullable();
            $table->json('event_channels')->nullable();
            $table->boolean('quiet_hours_enabled')->default(false);
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();
            $table->string('quiet_hours_timezone', 64)->nullable();
            $table->string('locale', 16)->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'user_id'], 'notification_preferences_user_unique');
        });

        Schema::create('notification_channel_deliveries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('channel', 24);
            $table->string('event_type', 64);
            $table->string('status', 24);
            $table->string('failure_reason', 160)->nullable();
            $table->string('title', 160);
            $table->json('payload')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'user_id', 'channel', 'created_at'], 'notification_channel_deliveries_user_idx');
            $table->index(['tenant_id', 'status', 'created_at'], 'notification_channel_deliveries_status_idx');
            $table->index(['tenant_id', 'event_type', 'created_at'], 'notification_channel_deliveries_event_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_channel_deliveries');
        Schema::dropIfExists('notification_preferences');
    }
};
