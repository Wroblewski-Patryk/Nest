<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use App\Organization\Services\OrganizationAuditExportService;
use App\Organization\Services\OrganizationRbacService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrganizationAuditExportController extends Controller
{
    public function __construct(
        private readonly OrganizationRbacService $rbac,
        private readonly OrganizationAuditExportService $exports
    ) {}

    public function export(Request $request, string $organizationId): JsonResponse|StreamedResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'format' => ['nullable', 'in:json,csv'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $organization = Organization::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('id', $organizationId)
            ->firstOrFail();

        if (! $this->rbac->can($user, $organization, 'org.audit.export')) {
            abort(403);
        }

        $events = $this->exports->export(
            $organization,
            $payload['from'] ?? null,
            $payload['to'] ?? null
        );

        $format = (string) ($payload['format'] ?? 'json');
        if ($format === 'csv') {
            return $this->csvResponse($events, $organization->slug);
        }

        return response()->json([
            'data' => $events,
            'meta' => [
                'organization_id' => $organization->id,
                'exported_at' => now()->toIso8601String(),
                'format' => 'json',
                'total' => count($events),
            ],
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $events
     */
    private function csvResponse(array $events, string $organizationSlug): StreamedResponse
    {
        $filename = sprintf('organization-audit-%s-%s.csv', $organizationSlug, now()->format('YmdHis'));

        return response()->streamDownload(function () use ($events): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fputcsv($handle, [
                'event_name',
                'occurred_at',
                'severity',
                'actor_user_id',
                'entity_type',
                'entity_id',
                'payload_json',
            ]);

            foreach ($events as $event) {
                fputcsv($handle, [
                    $event['event_name'],
                    $event['occurred_at'],
                    $event['severity'],
                    $event['actor_user_id'],
                    $event['entity_type'],
                    $event['entity_id'],
                    json_encode($event['payload'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
