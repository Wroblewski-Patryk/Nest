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
        Schema::table('integration_sync_failures', function (Blueprint $table): void {
            $table->unsignedInteger('replay_count')->default(0)->after('attempts');
            $table->string('last_replay_status', 32)->nullable()->after('replay_count');
            $table->text('last_replay_error')->nullable()->after('last_replay_status');
            $table->string('last_replay_idempotency_key', 191)->nullable()->after('last_replay_error');
            $table->timestamp('last_replayed_at')->nullable()->after('last_replay_idempotency_key');

            $table->index(['tenant_id', 'last_replayed_at'], 'integration_sync_failures_replay_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('integration_sync_failures', function (Blueprint $table): void {
            $table->dropIndex('integration_sync_failures_replay_idx');
            $table->dropColumn([
                'replay_count',
                'last_replay_status',
                'last_replay_error',
                'last_replay_idempotency_key',
                'last_replayed_at',
            ]);
        });
    }
};
