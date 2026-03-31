<?php

namespace App\Integrations\Services;

use App\Models\IntegrationMarketplaceAudit;
use App\Models\IntegrationMarketplaceInstall;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class IntegrationMarketplaceService
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private const PROVIDER_CATALOG = [
        'trello' => [
            'display_name' => 'Trello',
            'category' => 'tasks',
            'description' => 'Boards and cards synchronization for task planning.',
            'auth_type' => 'token',
            'default_scopes' => ['read', 'write'],
            'supports_webhook' => true,
            'sync_modes' => ['manual', 'polling', 'webhook'],
        ],
        'google_tasks' => [
            'display_name' => 'Google Tasks',
            'category' => 'tasks',
            'description' => 'Google Tasks sync for personal task planning.',
            'auth_type' => 'oauth2',
            'default_scopes' => ['tasks.readonly'],
            'supports_webhook' => false,
            'sync_modes' => ['manual', 'polling'],
        ],
        'todoist' => [
            'display_name' => 'Todoist',
            'category' => 'tasks',
            'description' => 'Todoist list/task synchronization bridge.',
            'auth_type' => 'token',
            'default_scopes' => ['data:read_write'],
            'supports_webhook' => true,
            'sync_modes' => ['manual', 'polling', 'webhook'],
        ],
        'google_calendar' => [
            'display_name' => 'Google Calendar',
            'category' => 'calendar',
            'description' => 'Calendar event synchronization and planning integration.',
            'auth_type' => 'oauth2',
            'default_scopes' => ['calendar.events'],
            'supports_webhook' => true,
            'sync_modes' => ['manual', 'polling', 'webhook'],
        ],
        'obsidian' => [
            'display_name' => 'Obsidian',
            'category' => 'knowledge',
            'description' => 'Markdown note synchronization for journal exports.',
            'auth_type' => 'token',
            'default_scopes' => ['vault:read_write'],
            'supports_webhook' => false,
            'sync_modes' => ['manual', 'polling'],
        ],
    ];

    public function __construct(
        private readonly IntegrationConnectionService $connectionService,
    ) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function listCatalogForUser(User $user): array
    {
        /** @var array<string, IntegrationMarketplaceInstall> $installs */
        $installs = IntegrationMarketplaceInstall::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->whereIn('provider', array_keys(self::PROVIDER_CATALOG))
            ->get()
            ->keyBy('provider')
            ->all();

        /** @var array<string, array<string, mixed>> $connections */
        $connections = collect($this->connectionService->listForUser($user))
            ->keyBy('provider')
            ->all();

        $result = [];
        foreach (self::PROVIDER_CATALOG as $provider => $metadata) {
            $result[] = $this->toCatalogItem(
                provider: $provider,
                metadata: $metadata,
                connection: $connections[$provider] ?? null,
                install: $installs[$provider] ?? null,
            );
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>
     */
    public function installForUser(User $user, string $provider, array $metadata = []): array
    {
        $provider = $this->validateProvider($provider);
        $install = IntegrationMarketplaceInstall::query()->updateOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'provider' => $provider,
            ],
            [
                'status' => 'installed',
                'install_metadata' => $metadata,
                'installed_at' => now(),
                'uninstalled_at' => null,
            ]
        );

        $connectionMap = collect($this->connectionService->listForUser($user))
            ->keyBy('provider')
            ->all();

        $this->recordAudit(
            user: $user,
            provider: $provider,
            action: 'install',
            reason: null,
            payload: [
                'install_status' => (string) $install->status,
                'connection_status' => (string) data_get($connectionMap[$provider] ?? [], 'status', 'not_connected'),
            ],
        );

        return $this->toCatalogItem(
            provider: $provider,
            metadata: self::PROVIDER_CATALOG[$provider],
            connection: $connectionMap[$provider] ?? null,
            install: $install,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function uninstallForUser(User $user, string $provider, ?string $reason = null): array
    {
        $provider = $this->validateProvider($provider);

        $install = IntegrationMarketplaceInstall::query()->updateOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'provider' => $provider,
            ],
            [
                'status' => 'uninstalled',
                'uninstalled_at' => now(),
            ]
        );

        $this->connectionService->revokeForUser($user, $provider);
        $connectionMap = collect($this->connectionService->listForUser($user))
            ->keyBy('provider')
            ->all();

        $this->recordAudit(
            user: $user,
            provider: $provider,
            action: 'uninstall',
            reason: $reason,
            payload: [
                'install_status' => (string) $install->status,
                'connection_status' => (string) data_get($connectionMap[$provider] ?? [], 'status', 'not_connected'),
            ],
        );

        return $this->toCatalogItem(
            provider: $provider,
            metadata: self::PROVIDER_CATALOG[$provider],
            connection: $connectionMap[$provider] ?? null,
            install: $install,
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listAuditsForUser(User $user, int $limit = 50): array
    {
        $safeLimit = min(max($limit, 1), 200);

        return IntegrationMarketplaceAudit::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->orderByDesc('occurred_at')
            ->limit($safeLimit)
            ->get()
            ->map(fn (IntegrationMarketplaceAudit $audit): array => [
                'id' => (string) $audit->id,
                'provider' => (string) $audit->provider,
                'action' => (string) $audit->action,
                'status' => (string) $audit->status,
                'reason' => $audit->reason !== null ? (string) $audit->reason : null,
                'audit_payload' => is_array($audit->audit_payload) ? $audit->audit_payload : [],
                'occurred_at' => $this->asIso($audit->occurred_at),
                'created_at' => $this->asIso($audit->created_at),
            ])
            ->values()
            ->all();
    }

    private function validateProvider(string $provider): string
    {
        validator(
            ['provider' => $provider],
            ['provider' => ['required', Rule::in(array_keys(self::PROVIDER_CATALOG))]]
        )->validate();

        return $provider;
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @param  array<string, mixed>|null  $connection
     * @return array<string, mixed>
     */
    private function toCatalogItem(
        string $provider,
        array $metadata,
        ?array $connection,
        ?IntegrationMarketplaceInstall $install
    ): array {
        $installStatus = $install !== null
            ? (string) $install->status
            : 'not_installed';

        return [
            'provider' => $provider,
            'display_name' => (string) ($metadata['display_name'] ?? $provider),
            'category' => (string) ($metadata['category'] ?? 'general'),
            'description' => (string) ($metadata['description'] ?? ''),
            'auth_type' => (string) ($metadata['auth_type'] ?? 'token'),
            'default_scopes' => array_values((array) ($metadata['default_scopes'] ?? [])),
            'supports_webhook' => (bool) ($metadata['supports_webhook'] ?? false),
            'sync_modes' => array_values((array) ($metadata['sync_modes'] ?? ['manual'])),
            'install_status' => $installStatus,
            'is_installed' => $installStatus === 'installed',
            'installed_at' => $this->asIso($install?->installed_at),
            'uninstalled_at' => $this->asIso($install?->uninstalled_at),
            'connection' => [
                'status' => (string) data_get($connection, 'status', 'not_connected'),
                'is_connected' => (bool) data_get($connection, 'is_connected', false),
                'scopes' => array_values((array) data_get($connection, 'scopes', [])),
                'expires_at' => data_get($connection, 'expires_at'),
                'updated_at' => data_get($connection, 'updated_at'),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function recordAudit(
        User $user,
        string $provider,
        string $action,
        ?string $reason,
        array $payload
    ): void {
        if (! in_array($action, ['install', 'uninstall'], true)) {
            throw ValidationException::withMessages([
                'action' => ['Unsupported marketplace action.'],
            ]);
        }

        IntegrationMarketplaceAudit::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'provider' => $provider,
            'action' => $action,
            'status' => 'completed',
            'reason' => $reason,
            'audit_payload' => $payload,
            'occurred_at' => now(),
        ]);
    }

    private function asIso(?CarbonInterface $value): ?string
    {
        return $value?->toISOString();
    }
}
