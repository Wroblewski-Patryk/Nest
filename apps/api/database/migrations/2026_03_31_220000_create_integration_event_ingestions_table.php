<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_event_ingestions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 64);
            $table->string('event_id', 128);
            $table->string('event_type', 128);
            $table->string('internal_entity_type', 64);
            $table->uuid('internal_entity_id');
            $table->string('external_id', 255)->nullable();
            $table->string('status', 32)->default('queued');
            $table->unsignedBigInteger('lag_ms')->nullable();
            $table->string('drop_reason', 255)->nullable();
            $table->unsignedInteger('replay_count')->default(0);
            $table->timestamp('event_occurred_at');
            $table->timestamp('received_at');
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->json('payload');
            $table->string('queue_job_id', 128)->nullable();
            $table->timestamps();

            $table->unique(
                ['tenant_id', 'user_id', 'provider', 'event_id'],
                'integration_event_ingestions_unique_event'
            );
            $table->index(
                ['tenant_id', 'provider', 'status', 'received_at'],
                'integration_event_ingestions_status_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_event_ingestions');
    }
};
