<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_action_proposals', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action_type', 64);
            $table->json('proposal_payload');
            $table->boolean('requires_approval')->default(true);
            $table->string('status', 32)->default('pending');
            $table->string('note', 1000)->nullable();
            $table->string('rejection_reason', 1000)->nullable();
            $table->json('execution_result')->nullable();
            $table->string('failure_reason', 1000)->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'user_id', 'status']);
            $table->index(['tenant_id', 'action_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_action_proposals');
    }
};
