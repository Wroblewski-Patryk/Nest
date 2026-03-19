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
        Schema::create('billing_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('plan_code', 64)->unique();
            $table->string('display_name', 120);
            $table->string('billing_interval', 32)->default('monthly');
            $table->unsignedInteger('price_minor')->default(0);
            $table->string('currency', 8)->default('USD');
            $table->unsignedSmallInteger('trial_days')->default(0);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('billing_plan_entitlements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('plan_id')->constrained('billing_plans')->cascadeOnDelete();
            $table->string('key', 128);
            $table->string('type', 32);
            $table->string('value', 255);
            $table->unsignedInteger('soft_limit')->nullable();
            $table->timestamps();

            $table->unique(['plan_id', 'key']);
        });

        Schema::create('tenant_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('plan_id')->constrained('billing_plans')->restrictOnDelete();
            $table->string('status', 32);
            $table->string('provider', 64)->default('internal');
            $table->string('provider_subscription_id', 128)->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_starts_at')->nullable();
            $table->timestamp('current_period_ends_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamps();

            $table->unique('tenant_id');
            $table->index(['tenant_id', 'status']);
        });

        Schema::create('tenant_billing_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('subscription_id')->nullable()->constrained('tenant_subscriptions')->nullOnDelete();
            $table->string('plan_code', 64)->nullable();
            $table->string('event_name', 128);
            $table->string('event_version', 16)->default('1.0');
            $table->string('provider', 64)->default('internal');
            $table->string('provider_event_id', 128)->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['tenant_id', 'event_name', 'occurred_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_billing_events');
        Schema::dropIfExists('tenant_subscriptions');
        Schema::dropIfExists('billing_plan_entitlements');
        Schema::dropIfExists('billing_plans');
    }
};
