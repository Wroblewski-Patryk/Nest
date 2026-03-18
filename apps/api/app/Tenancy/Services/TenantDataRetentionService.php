<?php

namespace App\Tenancy\Services;

use App\Models\TenantDataLifecycleAudit;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class TenantDataRetentionService
{
    /**
     * @return array<string, mixed>
     */
    public function run(?string $tenantId = null, bool $dryRun = false): array
    {
        /** @var array<int, array{table: string, timestamp_column: string, retention_days: int}> $policies */
        $policies = (array) config('tenant_data_lifecycle.retention_policies', []);
        $results = [];
        $totalRows = 0;

        foreach ($policies as $policy) {
            $table = $policy['table'];
            $timestampColumn = $policy['timestamp_column'];
            $retentionDays = (int) $policy['retention_days'];
            $cutoff = CarbonImmutable::now()->subDays($retentionDays);

            $query = DB::table($table)->where($timestampColumn, '<', $cutoff);
            if ($tenantId !== null) {
                $query->where('tenant_id', $tenantId);
            }

            $rows = (clone $query)->count();
            if (! $dryRun && $rows > 0) {
                $query->delete();
            }

            $status = $dryRun ? 'dry_run' : 'completed';
            $totalRows += $rows;
            $results[] = [
                'table' => $table,
                'retention_days' => $retentionDays,
                'rows_affected' => $rows,
            ];

            TenantDataLifecycleAudit::query()->create([
                'tenant_id' => $tenantId,
                'workflow' => 'retention',
                'status' => $status,
                'target' => $table,
                'rows_affected' => $rows,
                'metadata' => [
                    'timestamp_column' => $timestampColumn,
                    'retention_days' => $retentionDays,
                    'cutoff' => $cutoff->toIso8601String(),
                    'dry_run' => $dryRun,
                ],
                'executed_at' => now(),
            ]);
        }

        return [
            'workflow' => 'retention',
            'tenant_id' => $tenantId,
            'dry_run' => $dryRun,
            'rows_affected' => $totalRows,
            'results' => $results,
        ];
    }
}
