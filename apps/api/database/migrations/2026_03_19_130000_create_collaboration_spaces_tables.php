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
        Schema::create('collaboration_spaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('status', 32)->default('active');
            $table->timestamps();

            $table->index(['tenant_id', 'owner_user_id']);
        });

        Schema::create('collaboration_space_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('space_id')->constrained('collaboration_spaces')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 32)->default('member');
            $table->string('status', 32)->default('active');
            $table->timestamps();

            $table->unique(['space_id', 'user_id']);
            $table->index(['tenant_id', 'user_id', 'status']);
        });

        Schema::create('collaboration_invites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('space_id')->constrained('collaboration_spaces')->cascadeOnDelete();
            $table->foreignUuid('invited_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('accepted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email');
            $table->string('role', 32)->default('member');
            $table->string('status', 32)->default('pending');
            $table->string('token', 96)->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'space_id', 'status']);
            $table->index(['tenant_id', 'email']);
        });

        Schema::table('task_lists', function (Blueprint $table) {
            $table->string('visibility', 32)->default('private')->after('is_archived');
            $table->foreignUuid('collaboration_space_id')
                ->nullable()
                ->after('visibility')
                ->constrained('collaboration_spaces')
                ->nullOnDelete();

            $table->index(['tenant_id', 'visibility']);
        });

        Schema::table('goals', function (Blueprint $table) {
            $table->string('visibility', 32)->default('private')->after('status');
            $table->foreignUuid('collaboration_space_id')
                ->nullable()
                ->after('visibility')
                ->constrained('collaboration_spaces')
                ->nullOnDelete();

            $table->index(['tenant_id', 'visibility']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'visibility']);
            $table->dropConstrainedForeignId('collaboration_space_id');
            $table->dropColumn('visibility');
        });

        Schema::table('task_lists', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'visibility']);
            $table->dropConstrainedForeignId('collaboration_space_id');
            $table->dropColumn('visibility');
        });

        Schema::dropIfExists('collaboration_invites');
        Schema::dropIfExists('collaboration_space_members');
        Schema::dropIfExists('collaboration_spaces');
    }
};
