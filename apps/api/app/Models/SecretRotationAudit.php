<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecretRotationAudit extends Model
{
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'operation',
        'status',
        'affected_records',
        'scope',
        'metadata',
        'executed_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'scope' => 'array',
        'metadata' => 'array',
        'executed_at' => 'datetime',
    ];
}
