<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntegrationSyncFailure extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'user_id',
        'provider',
        'idempotency_key',
        'payload',
        'error_message',
        'attempts',
        'replay_count',
        'last_replay_status',
        'last_replay_error',
        'last_replay_idempotency_key',
        'last_replayed_at',
        'failed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'failed_at' => 'datetime',
            'attempts' => 'integer',
            'replay_count' => 'integer',
            'last_replayed_at' => 'datetime',
        ];
    }
}
