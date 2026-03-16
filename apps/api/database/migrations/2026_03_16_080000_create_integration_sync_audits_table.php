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
        Schema::create('integration_sync_audits', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->uuid('user_id')->nullable();
            $table->string('provider', 64);
            $table->string('idempotency_key', 191);
            $table->string('internal_entity_type', 64)->nullable();
            $table->uuid('internal_entity_id')->nullable();
            $table->string('external_id', 255)->nullable();
            $table->string('status', 32);
            $table->string('trace_id', 64)->nullable();
            $table->string('sync_hash', 128)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['provider', 'occurred_at']);
            $table->index(['tenant_id', 'occurred_at']);
            $table->index(['tenant_id', 'provider', 'internal_entity_type'], 'integration_sync_audits_entity_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integration_sync_audits');
    }
};
