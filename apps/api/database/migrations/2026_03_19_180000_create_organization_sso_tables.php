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
        Schema::create('organization_sso_providers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignUuid('created_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('protocol', 16);
            $table->string('slug', 120);
            $table->string('display_name', 160);
            $table->string('status', 32)->default('active');
            $table->string('oidc_issuer', 255)->nullable();
            $table->string('oidc_client_id', 255)->nullable();
            $table->string('oidc_jwks_url', 500)->nullable();
            $table->string('saml_entity_id', 255)->nullable();
            $table->string('saml_acs_url', 500)->nullable();
            $table->longText('saml_x509_certificate')->nullable();
            $table->text('saml_assertion_signing_secret')->nullable();
            $table->json('attribute_mapping')->nullable();
            $table->json('allowed_email_domains')->nullable();
            $table->boolean('auto_provision_users')->default(false);
            $table->boolean('require_verified_email')->default(true);
            $table->boolean('require_signed_assertions')->default(true);
            $table->timestamps();

            $table->unique(['organization_id', 'slug']);
            $table->index(['tenant_id', 'organization_id', 'status']);
        });

        Schema::create('organization_sso_identities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignUuid('provider_id')->constrained('organization_sso_providers')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('external_subject', 255);
            $table->string('email', 255)->nullable();
            $table->timestamp('linked_at');
            $table->timestamps();

            $table->unique(['provider_id', 'external_subject']);
            $table->unique(['provider_id', 'user_id']);
            $table->index(['tenant_id', 'organization_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_sso_identities');
        Schema::dropIfExists('organization_sso_providers');
    }
};
