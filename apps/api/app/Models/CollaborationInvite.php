<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollaborationInvite extends Model
{
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'space_id',
        'invited_by_user_id',
        'accepted_by_user_id',
        'email',
        'role',
        'status',
        'token',
        'expires_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<CollaborationSpace, $this>
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(CollaborationSpace::class, 'space_id');
    }
}
