<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationSsoProvider extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'organization_sso_providers';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'organization_id',
        'created_by_user_id',
        'protocol',
        'slug',
        'display_name',
        'status',
        'oidc_issuer',
        'oidc_client_id',
        'oidc_jwks_url',
        'saml_entity_id',
        'saml_acs_url',
        'saml_x509_certificate',
        'saml_assertion_signing_secret',
        'attribute_mapping',
        'allowed_email_domains',
        'auto_provision_users',
        'require_verified_email',
        'require_signed_assertions',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'attribute_mapping' => 'array',
        'allowed_email_domains' => 'array',
        'saml_assertion_signing_secret' => 'encrypted',
        'auto_provision_users' => 'boolean',
        'require_verified_email' => 'boolean',
        'require_signed_assertions' => 'boolean',
    ];

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * @return HasMany<OrganizationSsoIdentity, $this>
     */
    public function identities(): HasMany
    {
        return $this->hasMany(OrganizationSsoIdentity::class, 'provider_id');
    }
}
