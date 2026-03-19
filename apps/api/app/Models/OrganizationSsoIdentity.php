<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationSsoIdentity extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'organization_sso_identities';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'organization_id',
        'provider_id',
        'user_id',
        'external_subject',
        'email',
        'linked_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'linked_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<OrganizationSsoProvider, $this>
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(OrganizationSsoProvider::class, 'provider_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
