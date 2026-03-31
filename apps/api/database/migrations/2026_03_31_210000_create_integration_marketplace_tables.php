<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_marketplace_installs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 64);
            $table->string('status', 32)->default('installed');
            $table->json('install_metadata')->nullable();
            $table->timestamp('installed_at')->nullable();
            $table->timestamp('uninstalled_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'user_id', 'provider'], 'integration_marketplace_installs_unique');
            $table->index(['tenant_id', 'provider'], 'integration_marketplace_installs_tenant_provider_idx');
        });

        Schema::create('integration_marketplace_audits', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 64);
            $table->string('action', 32);
            $table->string('status', 32)->default('completed');
            $table->text('reason')->nullable();
            $table->json('audit_payload')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['tenant_id', 'user_id', 'occurred_at'], 'integration_marketplace_audits_scope_idx');
            $table->index(['tenant_id', 'provider', 'occurred_at'], 'integration_marketplace_audits_provider_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_marketplace_audits');
        Schema::dropIfExists('integration_marketplace_installs');
    }
};
