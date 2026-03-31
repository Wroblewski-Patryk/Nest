<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegrationEventIngestion extends Model
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
        'event_id',
        'event_type',
        'internal_entity_type',
        'internal_entity_id',
        'external_id',
        'status',
        'lag_ms',
        'drop_reason',
        'replay_count',
        'event_occurred_at',
        'received_at',
        'queued_at',
        'processed_at',
        'payload',
        'queue_job_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'lag_ms' => 'integer',
            'replay_count' => 'integer',
            'event_occurred_at' => 'datetime',
            'received_at' => 'datetime',
            'queued_at' => 'datetime',
            'processed_at' => 'datetime',
            'payload' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Tenant, $this>
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
