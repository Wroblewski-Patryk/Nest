<?php

namespace App\Security\Services;

use App\Models\IntegrationCredential;
use App\Models\OrganizationSsoProvider;
use App\Models\SecretRotationAudit;

class SecurityControlVerificationService
{
    /**
     * @return array<string, mixed>
     */
    public function verify(): array
    {
        $results = [
            $this->checkAppKeyConfigured(),
            $this->checkOAuthProviderAllowlist(),
            $this->checkSsoProtocolAllowlist(),
            $this->checkSamlSignedAssertionPolicy(),
            $this->checkRecentSecretRotation(),
            $this->checkExpiredActiveCredentials(),
        ];

        $severity = $this->resolveSeverity($results);
        $failed = array_values(array_filter($results, static fn (array $check): bool => ! $check['passed']));

        return [
            'severity' => $severity,
            'checks_total' => count($results),
            'checks_failed' => count($failed),
            'checks' => $results,
            'failed_checks' => $failed,
            'verified_at' => now()->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function checkAppKeyConfigured(): array
    {
        $configured = (string) config('app.key', '') !== '';

        return [
            'id' => 'app_key_configured',
            'severity' => 'critical',
            'passed' => $configured,
            'message' => $configured ? 'APP key configured.' : 'APP key is missing.',
            'meta' => [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function checkOAuthProviderAllowlist(): array
    {
        /** @var array<int, string> $configuredProviders */
        $configuredProviders = array_keys((array) config('oauth.providers', []));
        /** @var array<int, string> $allowedProviders */
        $allowedProviders = (array) config('security_controls.oauth.allowed_providers', []);

        $unexpected = array_values(array_diff($configuredProviders, $allowedProviders));
        $passed = $unexpected === [];

        return [
            'id' => 'oauth_provider_allowlist',
            'severity' => 'critical',
            'passed' => $passed,
            'message' => $passed
                ? 'OAuth provider configuration matches allowlist.'
                : 'Unexpected OAuth providers configured.',
            'meta' => [
                'configured_providers' => $configuredProviders,
                'unexpected_providers' => $unexpected,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function checkSsoProtocolAllowlist(): array
    {
        /** @var array<int, string> $allowedProtocols */
        $allowedProtocols = (array) config('security_controls.sso.allowed_protocols', []);
        $invalidCount = OrganizationSsoProvider::query()
            ->whereNotIn('protocol', $allowedProtocols)
            ->count();

        return [
            'id' => 'organization_sso_protocol_allowlist',
            'severity' => 'critical',
            'passed' => $invalidCount === 0,
            'message' => $invalidCount === 0
                ? 'Organization SSO protocols are allowlisted.'
                : 'Non-allowlisted organization SSO protocols detected.',
            'meta' => [
                'invalid_protocol_records' => $invalidCount,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function checkSamlSignedAssertionPolicy(): array
    {
        $insecureSamlProviders = OrganizationSsoProvider::query()
            ->where('protocol', 'saml')
            ->where('require_signed_assertions', false)
            ->count();

        return [
            'id' => 'saml_signed_assertions_required',
            'severity' => 'warning',
            'passed' => $insecureSamlProviders === 0,
            'message' => $insecureSamlProviders === 0
                ? 'SAML providers require signed assertions.'
                : 'Some SAML providers allow unsigned assertions.',
            'meta' => [
                'providers_without_required_signatures' => $insecureSamlProviders,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function checkRecentSecretRotation(): array
    {
        $maxAgeDays = (int) config('security_controls.secret_rotation.max_age_days', 30);
        $cutoff = now()->subDays($maxAgeDays);

        $recentExists = SecretRotationAudit::query()
            ->where('operation', 'rotate_secrets')
            ->where('status', 'completed')
            ->where('executed_at', '>=', $cutoff)
            ->exists();

        return [
            'id' => 'secret_rotation_recency',
            'severity' => 'warning',
            'passed' => $recentExists,
            'message' => $recentExists
                ? 'Recent secret rotation audit found.'
                : 'No recent completed secret rotation audit found.',
            'meta' => [
                'max_age_days' => $maxAgeDays,
                'cutoff' => $cutoff->toIso8601String(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function checkExpiredActiveCredentials(): array
    {
        $expiredActive = IntegrationCredential::query()
            ->whereNull('revoked_at')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->count();

        return [
            'id' => 'expired_active_integration_credentials',
            'severity' => 'warning',
            'passed' => $expiredActive === 0,
            'message' => $expiredActive === 0
                ? 'No expired active integration credentials detected.'
                : 'Expired active integration credentials detected.',
            'meta' => [
                'expired_active_count' => $expiredActive,
            ],
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $checks
     */
    private function resolveSeverity(array $checks): string
    {
        $hasCriticalFailure = collect($checks)->contains(
            fn (array $check): bool => $check['severity'] === 'critical' && ! $check['passed']
        );
        if ($hasCriticalFailure) {
            return 'critical';
        }

        $hasWarningFailure = collect($checks)->contains(
            fn (array $check): bool => $check['severity'] === 'warning' && ! $check['passed']
        );
        if ($hasWarningFailure) {
            return 'warning';
        }

        return 'ok';
    }
}
