<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_briefing_preferences', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('daily_enabled')->default(true);
            $table->boolean('weekly_enabled')->default(true);
            $table->json('scope_modules')->nullable();
            $table->string('timezone', 64)->default('UTC');
            $table->timestamps();

            $table->unique(['tenant_id', 'user_id']);
        });

        Schema::create('ai_briefings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('cadence', 16);
            $table->json('scope_modules');
            $table->text('summary');
            $table->json('sections')->nullable();
            $table->string('context_fingerprint', 128)->nullable();
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index(['tenant_id', 'user_id', 'generated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_briefings');
        Schema::dropIfExists('ai_briefing_preferences');
    }
};
