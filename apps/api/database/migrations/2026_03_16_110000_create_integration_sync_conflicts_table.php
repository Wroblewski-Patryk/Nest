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
        Schema::create('integration_sync_conflicts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('user_id');
            $table->string('provider', 64);
            $table->string('internal_entity_type', 64);
            $table->uuid('internal_entity_id');
            $table->string('external_id', 255)->nullable();
            $table->string('status', 16)->default('open');
            $table->json('conflict_fields');
            $table->timestamp('detected_at');
            $table->timestamp('last_seen_at');
            $table->string('resolution_action', 32)->nullable();
            $table->json('resolution_payload')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'provider', 'status'], 'integration_sync_conflicts_provider_status_idx');
            $table->index(
                ['tenant_id', 'provider', 'internal_entity_type', 'internal_entity_id'],
                'integration_sync_conflicts_entity_idx'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integration_sync_conflicts');
    }
};
