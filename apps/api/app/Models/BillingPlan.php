<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillingPlan extends Model
{
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'plan_code',
        'display_name',
        'billing_interval',
        'price_minor',
        'currency',
        'trial_days',
        'is_public',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_minor' => 'integer',
            'trial_days' => 'integer',
            'is_public' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<BillingPlanEntitlement, $this>
     */
    public function entitlements(): HasMany
    {
        return $this->hasMany(BillingPlanEntitlement::class, 'plan_id');
    }
}
