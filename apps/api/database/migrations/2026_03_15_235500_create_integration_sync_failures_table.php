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
        Schema::create('integration_sync_failures', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->uuid('user_id')->nullable();
            $table->string('provider', 64);
            $table->string('idempotency_key', 191);
            $table->json('payload');
            $table->text('error_message');
            $table->unsignedTinyInteger('attempts')->default(1);
            $table->timestamp('failed_at');
            $table->timestamps();

            $table->index(['provider', 'failed_at']);
            $table->index(['tenant_id', 'failed_at']);
            $table->unique(['provider', 'idempotency_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integration_sync_failures');
    }
};
