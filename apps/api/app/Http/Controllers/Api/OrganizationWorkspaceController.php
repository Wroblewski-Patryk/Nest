<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Organization\Services\OrganizationRbacService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationWorkspaceController extends Controller
{
    public function __construct(
        private readonly OrganizationRbacService $rbac
    ) {}

    public function listOrganizations(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $organizations = Organization::query()
            ->with('members')
            ->where('tenant_id', $user->tenant_id)
            ->where(function ($query) use ($user): void {
                $query->where('owner_user_id', $user->id)
                    ->orWhereHas('members', function ($members) use ($user): void {
                        $members->where('user_id', $user->id)->where('status', 'active');
                    });
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $organizations]);
    }

    public function createOrganization(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:190'],
        ]);

        $organization = DB::transaction(function () use ($payload, $user): Organization {
            $organization = Organization::query()->create([
                'tenant_id' => $user->tenant_id,
                'owner_user_id' => $user->id,
                'name' => $payload['name'],
                'slug' => $payload['slug'] ?? Str::slug((string) $payload['name']).'-'.Str::lower(Str::random(4)),
                'status' => 'active',
            ]);

            OrganizationMember::query()->create([
                'tenant_id' => $user->tenant_id,
                'organization_id' => $organization->id,
                'user_id' => $user->id,
                'role' => 'owner',
                'status' => 'active',
            ]);

            return $organization;
        });

        return response()->json(['data' => $organization], 201);
    }

    public function addOrganizationMember(Request $request, string $organizationId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'user_id' => ['required', 'uuid'],
            'role' => ['nullable', 'in:admin,member'],
        ]);

        $organization = Organization::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('id', $organizationId)
            ->firstOrFail();

        if (! $this->rbac->can($user, $organization, 'org.members.create')) {
            abort(403);
        }

        $memberUser = User::query()
            ->where('tenant_id', $user->tenant_id)
            ->findOrFail($payload['user_id']);

        $member = OrganizationMember::query()->updateOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'organization_id' => $organization->id,
                'user_id' => $memberUser->id,
            ],
            [
                'role' => $payload['role'] ?? 'member',
                'status' => 'active',
            ]
        );

        return response()->json(['data' => $member], 201);
    }

    public function updateOrganizationMemberRole(
        Request $request,
        string $organizationId,
        string $memberUserId
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'role' => ['required', 'in:admin,member'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $organization = Organization::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('id', $organizationId)
            ->firstOrFail();

        if (! $this->rbac->can($user, $organization, 'org.members.update_role')) {
            abort(403);
        }

        $member = OrganizationMember::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('organization_id', $organizationId)
            ->where('user_id', $memberUserId)
            ->firstOrFail();

        $member->role = $payload['role'];
        if (array_key_exists('status', $payload)) {
            $member->status = $payload['status'];
        }
        $member->save();

        return response()->json(['data' => $member->fresh()]);
    }

    public function listWorkspaces(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $workspaces = Workspace::query()
            ->with('members')
            ->where('tenant_id', $user->tenant_id)
            ->whereHas('members', function ($query) use ($user): void {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $workspaces]);
    }

    public function createWorkspace(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $request->validate([
            'organization_id' => ['required', 'uuid'],
            'name' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:190'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $organization = Organization::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('id', $payload['organization_id'])
            ->firstOrFail();

        if (! $this->rbac->can($user, $organization, 'workspace.create')) {
            abort(403);
        }

        $workspace = DB::transaction(function () use ($payload, $user, $organization): Workspace {
            $workspace = Workspace::query()->create([
                'tenant_id' => $user->tenant_id,
                'organization_id' => $organization->id,
                'name' => $payload['name'],
                'slug' => $payload['slug'] ?? Str::slug((string) $payload['name']).'-'.Str::lower(Str::random(4)),
                'is_default' => (bool) ($payload['is_default'] ?? false),
            ]);

            $members = OrganizationMember::query()
                ->where('organization_id', $organization->id)
                ->where('status', 'active')
                ->get();

            foreach ($members as $member) {
                WorkspaceMember::query()->create([
                    'tenant_id' => $user->tenant_id,
                    'workspace_id' => $workspace->id,
                    'user_id' => $member->user_id,
                    'role' => $member->role === 'owner' ? 'admin' : $member->role,
                    'status' => 'active',
                ]);
            }

            return $workspace;
        });

        return response()->json(['data' => $workspace], 201);
    }
}
