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
        Schema::create('actor_boundary_audits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->index();
            $table->string('principal_type', 32)->index();
            $table->string('token_mode', 32)->nullable()->index();
            $table->string('route', 255);
            $table->string('method', 16);
            $table->string('reason', 64)->index();
            $table->string('required_scope', 64)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actor_boundary_audits');
    }
};

