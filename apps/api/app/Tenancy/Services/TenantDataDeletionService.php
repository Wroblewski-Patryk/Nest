<?php

namespace App\Tenancy\Services;

use App\Models\Tenant;
use App\Models\TenantDataLifecycleAudit;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class TenantDataDeletionService
{
    /**
     * @return array<string, mixed>
     */
    public function run(string $tenantId, bool $dryRun = false): array
    {
        $tenant = Tenant::query()->find($tenantId);
        if ($tenant === null) {
            throw new InvalidArgumentException('Tenant not found for deletion workflow.');
        }

        $userIds = User::query()
            ->where('tenant_id', $tenantId)
            ->pluck('id')
            ->all();
        $userEmails = User::query()
            ->where('tenant_id', $tenantId)
            ->pluck('email')
            ->all();

        /** @var list<string> $tables */
        $tables = (array) config('tenant_data_lifecycle.deletion_tables', []);
        $tableCounts = [];

        foreach ($tables as $table) {
            if ($table === 'tenants') {
                $tableCounts[$table] = Tenant::query()->where('id', $tenantId)->count();

                continue;
            }

            $tableCounts[$table] = DB::table($table)->where('tenant_id', $tenantId)->count();
        }

        $specialCounts = [
            'sessions' => empty($userIds)
                ? 0
                : DB::table('sessions')->whereIn('user_id', $userIds)->count(),
            'personal_access_tokens' => empty($userIds)
                ? 0
                : DB::table('personal_access_tokens')
                    ->where('tokenable_type', User::class)
                    ->whereIn('tokenable_id', $userIds)
                    ->count(),
            'password_reset_tokens' => empty($userEmails)
                ? 0
                : DB::table('password_reset_tokens')->whereIn('email', $userEmails)->count(),
        ];

        $rowsAffected = array_sum($tableCounts) + array_sum($specialCounts);
        $status = $dryRun ? 'dry_run' : 'completed';

        if (! $dryRun) {
            DB::transaction(function () use ($tenantId, $userIds, $userEmails): void {
                if ($userIds !== []) {
                    DB::table('sessions')->whereIn('user_id', $userIds)->delete();
                    DB::table('personal_access_tokens')
                        ->where('tokenable_type', User::class)
                        ->whereIn('tokenable_id', $userIds)
                        ->delete();
                }

                if ($userEmails !== []) {
                    DB::table('password_reset_tokens')->whereIn('email', $userEmails)->delete();
                }

                Tenant::query()->where('id', $tenantId)->delete();
            });
        }

        TenantDataLifecycleAudit::query()->create([
            'tenant_id' => $tenantId,
            'workflow' => 'deletion',
            'status' => $status,
            'target' => 'tenant',
            'rows_affected' => $rowsAffected,
            'metadata' => [
                'tenant_slug' => $tenant->slug,
                'table_counts' => $tableCounts,
                'special_counts' => $specialCounts,
                'dry_run' => $dryRun,
            ],
            'executed_at' => now(),
        ]);

        return [
            'workflow' => 'deletion',
            'tenant_id' => $tenantId,
            'tenant_slug' => $tenant->slug,
            'dry_run' => $dryRun,
            'rows_affected' => $rowsAffected,
            'table_counts' => $tableCounts,
            'special_counts' => $specialCounts,
        ];
    }
}
