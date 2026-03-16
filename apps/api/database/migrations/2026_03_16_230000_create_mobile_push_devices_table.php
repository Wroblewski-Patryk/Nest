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
        Schema::create('mobile_push_devices', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('platform', 16);
            $table->string('device_label', 120)->nullable();
            $table->text('device_token');
            $table->string('device_token_hash', 64);
            $table->timestamp('last_registered_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'user_id', 'platform', 'device_token_hash'], 'mobile_push_devices_unique');
            $table->index(['tenant_id', 'user_id', 'revoked_at'], 'mobile_push_devices_active_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_push_devices');
    }
};
