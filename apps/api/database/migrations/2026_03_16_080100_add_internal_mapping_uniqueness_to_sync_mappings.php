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
        Schema::table('sync_mappings', function (Blueprint $table): void {
            $table->unique(
                ['tenant_id', 'provider', 'internal_entity_type', 'internal_entity_id'],
                'sync_mappings_internal_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sync_mappings', function (Blueprint $table): void {
            $table->dropUnique('sync_mappings_internal_unique');
        });
    }
};
