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
        Schema::table('users', function (Blueprint $table) {
            $table->string('principal_type', 32)
                ->default('human_user')
                ->index()
                ->after('tenant_id');
            $table->uuid('owner_user_id')
                ->nullable()
                ->index()
                ->after('principal_type');
            $table->string('agent_status', 32)
                ->nullable()
                ->index()
                ->after('owner_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['principal_type', 'owner_user_id', 'agent_status']);
        });
    }
};

