<?php

namespace App\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

final class DelegatedCredentialScopeCatalog
{
    public const MARKER_SCOPE = 'delegated:access';

    /**
     * @var array<int, string>
     */
    public const AVAILABLE_SCOPES = [
        'tasks:read',
        'tasks:write',
        'lists:read',
        'lists:write',
        'habits:read',
        'habits:write',
        'routines:read',
        'routines:write',
        'goals:read',
        'goals:write',
        'targets:read',
        'targets:write',
        'life_areas:read',
        'life_areas:write',
        'journal:read',
        'journal:write',
        'calendar:read',
        'calendar:write',
        'integrations:read',
        'integrations:write',
        'insights:read',
    ];

    /**
     * @param  array<int, string>  $requestedScopes
     * @return array<int, string>
     */
    public static function normalizeScopes(array $requestedScopes): array
    {
        return array_values(array_unique(array_filter(
            $requestedScopes,
            static fn (mixed $scope): bool => is_string($scope)
                && in_array($scope, self::AVAILABLE_SCOPES, true)
        )));
    }

    public static function isDelegatedToken(?PersonalAccessToken $token): bool
    {
        $abilities = $token?->abilities;
        if (! is_array($abilities)) {
            return false;
        }

        return in_array(self::MARKER_SCOPE, $abilities, true);
    }

    /**
     * @return array<int, string>
     */
    public static function delegatedScopesForToken(?PersonalAccessToken $token): array
    {
        $abilities = $token?->abilities;
        if (! is_array($abilities)) {
            return [];
        }

        return self::normalizeScopes($abilities);
    }

    public static function requiredScopeForRequest(Request $request): ?string
    {
        $path = Str::lower(trim($request->path(), '/'));
        if (! Str::startsWith($path, 'api/v1/')) {
            return null;
        }

        $routePath = Str::after($path, 'api/v1/');
        $domain = self::resolveDomain($routePath);
        if ($domain === null) {
            return null;
        }

        $action = self::isReadMethod($request) ? 'read' : 'write';
        $scope = "{$domain}:{$action}";

        return in_array($scope, self::AVAILABLE_SCOPES, true) ? $scope : null;
    }

    private static function isReadMethod(Request $request): bool
    {
        return $request->isMethod('GET')
            || $request->isMethod('HEAD')
            || $request->isMethod('OPTIONS');
    }

    private static function resolveDomain(string $routePath): ?string
    {
        return match (true) {
            Str::startsWith($routePath, 'tasks') => 'tasks',
            Str::startsWith($routePath, 'lists') => 'lists',
            Str::startsWith($routePath, 'habits') => 'habits',
            Str::startsWith($routePath, 'routines') => 'routines',
            Str::startsWith($routePath, 'goals') => 'goals',
            Str::startsWith($routePath, 'targets') => 'targets',
            Str::startsWith($routePath, 'life-areas') => 'life_areas',
            Str::startsWith($routePath, 'journal-entries') => 'journal',
            Str::startsWith($routePath, 'calendar-events') => 'calendar',
            Str::startsWith($routePath, 'integrations') => 'integrations',
            Str::startsWith($routePath, 'insights') => 'insights',
            default => null,
        };
    }
}

