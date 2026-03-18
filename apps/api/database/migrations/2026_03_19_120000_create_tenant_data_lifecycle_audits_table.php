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
        Schema::create('tenant_data_lifecycle_audits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->string('workflow', 32);
            $table->string('status', 32);
            $table->string('target', 128);
            $table->unsignedInteger('rows_affected')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamp('executed_at');
            $table->timestamps();

            $table->index(['workflow', 'executed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_data_lifecycle_audits');
    }
};
