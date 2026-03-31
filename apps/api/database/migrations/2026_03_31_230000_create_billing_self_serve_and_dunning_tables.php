<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_self_serve_sessions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('subscription_id')->nullable()->constrained('tenant_subscriptions')->nullOnDelete();
            $table->string('session_type', 32);
            $table->string('plan_code', 64)->nullable();
            $table->string('provider', 64)->default('stripe');
            $table->string('provider_session_id', 128);
            $table->string('url', 2048);
            $table->string('status', 32)->default('created');
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'session_type', 'created_at'], 'billing_self_serve_sessions_lookup_idx');
            $table->unique(['provider', 'provider_session_id'], 'billing_self_serve_sessions_provider_unique');
        });

        Schema::create('billing_dunning_attempts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('subscription_id')->constrained('tenant_subscriptions')->cascadeOnDelete();
            $table->foreignUuid('billing_event_id')->nullable()->constrained('tenant_billing_events')->nullOnDelete();
            $table->unsignedSmallInteger('attempt_number');
            $table->string('status', 32)->default('notice_sent');
            $table->string('channel', 32)->default('email');
            $table->string('failure_reason', 255)->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('recovered_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'subscription_id', 'attempt_number'], 'billing_dunning_attempts_subscription_idx');
            $table->index(['tenant_id', 'status', 'processed_at'], 'billing_dunning_attempts_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_dunning_attempts');
        Schema::dropIfExists('billing_self_serve_sessions');
    }
};
