<?php

namespace App\Organization\Services;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\OrganizationSsoIdentity;
use App\Models\OrganizationSsoProvider;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class OrganizationAuditExportService
{
    /**
     * @return list<array<string, mixed>>
     */
    public function export(Organization $organization, ?string $from = null, ?string $to = null): array
    {
        $events = collect()
            ->concat($this->membershipEvents($organization, $from, $to))
            ->concat($this->ssoProviderEvents($organization, $from, $to))
            ->concat($this->ssoIdentityEvents($organization, $from, $to))
            ->concat($this->tenantLifecycleEvents($organization, $from, $to))
            ->sortBy('occurred_at')
            ->values();

        return $events->map(fn (array $event): array => [
            'event_name' => $event['event_name'],
            'occurred_at' => $event['occurred_at'],
            'severity' => $event['severity'],
            'actor_user_id' => $event['actor_user_id'],
            'entity_type' => $event['entity_type'],
            'entity_id' => $event['entity_id'],
            'payload' => $event['payload'],
        ])->all();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function membershipEvents(Organization $organization, ?string $from, ?string $to): Collection
    {
        $query = OrganizationMember::query()
            ->where('tenant_id', $organization->tenant_id)
            ->where('organization_id', $organization->id);

        $this->applyDateWindow($query, 'updated_at', $from, $to);

        return $query->get()->map(fn (OrganizationMember $member): array => [
            'event_name' => $member->created_at?->equalTo($member->updated_at)
                ? 'org.member.added'
                : 'org.member.updated',
            'occurred_at' => $member->updated_at?->toIso8601String(),
            'severity' => 'medium',
            'actor_user_id' => null,
            'entity_type' => 'organization_member',
            'entity_id' => $member->id,
            'payload' => [
                'user_id' => $member->user_id,
                'role' => $member->role,
                'status' => $member->status,
            ],
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function ssoProviderEvents(Organization $organization, ?string $from, ?string $to): Collection
    {
        $query = OrganizationSsoProvider::query()
            ->where('tenant_id', $organization->tenant_id)
            ->where('organization_id', $organization->id);

        $this->applyDateWindow($query, 'updated_at', $from, $to);

        return $query->get()->map(fn (OrganizationSsoProvider $provider): array => [
            'event_name' => $provider->created_at?->equalTo($provider->updated_at)
                ? 'org.sso.provider.created'
                : 'org.sso.provider.updated',
            'occurred_at' => $provider->updated_at?->toIso8601String(),
            'severity' => 'high',
            'actor_user_id' => $provider->created_by_user_id,
            'entity_type' => 'organization_sso_provider',
            'entity_id' => $provider->id,
            'payload' => [
                'protocol' => $provider->protocol,
                'slug' => $provider->slug,
                'status' => $provider->status,
                'auto_provision_users' => $provider->auto_provision_users,
            ],
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function ssoIdentityEvents(Organization $organization, ?string $from, ?string $to): Collection
    {
        $query = OrganizationSsoIdentity::query()
            ->where('tenant_id', $organization->tenant_id)
            ->where('organization_id', $organization->id);

        $this->applyDateWindow($query, 'linked_at', $from, $to);

        return $query->get()->map(fn (OrganizationSsoIdentity $identity): array => [
            'event_name' => 'org.sso.identity.linked',
            'occurred_at' => $identity->linked_at?->toIso8601String(),
            'severity' => 'high',
            'actor_user_id' => $identity->user_id,
            'entity_type' => 'organization_sso_identity',
            'entity_id' => $identity->id,
            'payload' => [
                'provider_id' => $identity->provider_id,
                'external_subject' => $identity->external_subject,
                'email' => $identity->email,
            ],
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function tenantLifecycleEvents(Organization $organization, ?string $from, ?string $to): Collection
    {
        $query = DB::table('tenant_data_lifecycle_audits')
            ->where('tenant_id', $organization->tenant_id);

        if ($from !== null) {
            $query->where('created_at', '>=', $from);
        }
        if ($to !== null) {
            $query->where('created_at', '<=', $to);
        }

        return collect($query->get())->map(fn (object $row): array => [
            'event_name' => 'tenant.lifecycle.'.$row->operation,
            'occurred_at' => (string) $row->created_at,
            'severity' => 'critical',
            'actor_user_id' => null,
            'entity_type' => 'tenant_lifecycle_audit',
            'entity_id' => (string) $row->id,
            'payload' => [
                'status' => $row->status,
                'target_tenant_id' => $row->target_tenant_id,
                'target_table' => $row->target_table,
                'affected_records' => $row->affected_records,
            ],
        ]);
    }

    /**
     * @param  Builder<Model>  $query
     */
    private function applyDateWindow($query, string $column, ?string $from, ?string $to): void
    {
        if ($from !== null) {
            $query->where($column, '>=', $from);
        }
        if ($to !== null) {
            $query->where($column, '<=', $to);
        }
    }
}
