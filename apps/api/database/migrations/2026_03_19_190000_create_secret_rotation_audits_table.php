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
        Schema::create('secret_rotation_audits', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->string('operation', 48);
            $table->string('status', 32);
            $table->unsignedInteger('affected_records')->default(0);
            $table->json('scope')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('executed_at');
            $table->timestamps();

            $table->index(['operation', 'executed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secret_rotation_audits');
    }
};
