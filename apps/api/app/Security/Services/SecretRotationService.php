<?php

namespace App\Security\Services;

use App\Models\IntegrationCredential;
use App\Models\MobilePushDevice;
use App\Models\OrganizationSsoProvider;
use App\Models\SecretRotationAudit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class SecretRotationService
{
    /**
     * @return array<string, mixed>
     */
    public function rotate(?string $tenantId = null, bool $dryRun = false): array
    {
        $summary = [
            'workflow' => 'secrets_rotate',
            'tenant_id' => $tenantId,
            'dry_run' => $dryRun,
            'integration_credentials_rotated' => 0,
            'mobile_push_tokens_rotated' => 0,
            'organization_sso_secrets_rotated' => 0,
            'affected_records' => 0,
        ];

        if ($dryRun) {
            $summary['integration_credentials_rotated'] = $this->countIntegrationCredentials($tenantId);
            $summary['mobile_push_tokens_rotated'] = $this->countMobilePushDevices($tenantId);
            $summary['organization_sso_secrets_rotated'] = $this->countSsoSecrets($tenantId);
            $summary['affected_records'] =
                $summary['integration_credentials_rotated'] +
                $summary['mobile_push_tokens_rotated'] +
                $summary['organization_sso_secrets_rotated'];

            $this->audit('rotate_secrets', $tenantId, 'dry_run', $summary['affected_records'], [
                'dry_run' => true,
                ...$summary,
            ]);

            return $summary;
        }

        DB::transaction(function () use (&$summary, $tenantId): void {
            $summary['integration_credentials_rotated'] = $this->rotateIntegrationCredentials($tenantId);
            $summary['mobile_push_tokens_rotated'] = $this->rotateMobilePushTokens($tenantId);
            $summary['organization_sso_secrets_rotated'] = $this->rotateSsoSecrets($tenantId);
        });

        $summary['affected_records'] =
            $summary['integration_credentials_rotated'] +
            $summary['mobile_push_tokens_rotated'] +
            $summary['organization_sso_secrets_rotated'];

        $this->audit('rotate_secrets', $tenantId, 'completed', $summary['affected_records'], [
            'dry_run' => false,
            ...$summary,
        ]);

        return $summary;
    }

    /**
     * @return array<string, mixed>
     */
    public function revokeCredentials(
        ?string $tenantId = null,
        ?string $provider = null,
        ?string $userId = null,
        bool $dryRun = false,
    ): array {
        $query = IntegrationCredential::query()
            ->when($tenantId !== null, fn (Builder $builder) => $builder->where('tenant_id', $tenantId))
            ->when($provider !== null, fn (Builder $builder) => $builder->where('provider', $provider))
            ->when($userId !== null, fn (Builder $builder) => $builder->where('user_id', $userId))
            ->whereNull('revoked_at');

        $count = (clone $query)->count();

        if (! $dryRun) {
            $query->update(['revoked_at' => now()]);
        }

        $summary = [
            'workflow' => 'credentials_revoke',
            'tenant_id' => $tenantId,
            'provider' => $provider,
            'user_id' => $userId,
            'dry_run' => $dryRun,
            'affected_records' => $count,
        ];

        $this->audit(
            'revoke_credentials',
            $tenantId,
            $dryRun ? 'dry_run' : 'completed',
            $count,
            $summary
        );

        return $summary;
    }

    private function countIntegrationCredentials(?string $tenantId = null): int
    {
        return IntegrationCredential::query()
            ->when($tenantId !== null, fn (Builder $builder) => $builder->where('tenant_id', $tenantId))
            ->count();
    }

    private function countMobilePushDevices(?string $tenantId = null): int
    {
        return MobilePushDevice::query()
            ->when($tenantId !== null, fn (Builder $builder) => $builder->where('tenant_id', $tenantId))
            ->count();
    }

    private function countSsoSecrets(?string $tenantId = null): int
    {
        return OrganizationSsoProvider::query()
            ->whereNotNull('saml_assertion_signing_secret')
            ->when($tenantId !== null, fn (Builder $builder) => $builder->where('tenant_id', $tenantId))
            ->count();
    }

    private function rotateIntegrationCredentials(?string $tenantId = null): int
    {
        $count = 0;
        IntegrationCredential::query()
            ->when($tenantId !== null, fn (Builder $builder) => $builder->where('tenant_id', $tenantId))
            ->cursor()
            ->each(function (IntegrationCredential $credential) use (&$count): void {
                DB::table('integration_credentials')
                    ->where('id', $credential->id)
                    ->update([
                        'access_token' => Crypt::encryptString((string) $credential->access_token),
                        'refresh_token' => $credential->refresh_token !== null
                            ? Crypt::encryptString((string) $credential->refresh_token)
                            : null,
                        'updated_at' => now(),
                    ]);
                $count++;
            });

        return $count;
    }

    private function rotateMobilePushTokens(?string $tenantId = null): int
    {
        $count = 0;
        MobilePushDevice::query()
            ->when($tenantId !== null, fn (Builder $builder) => $builder->where('tenant_id', $tenantId))
            ->cursor()
            ->each(function (MobilePushDevice $device) use (&$count): void {
                DB::table('mobile_push_devices')
                    ->where('id', $device->id)
                    ->update([
                        'device_token' => Crypt::encryptString((string) $device->device_token),
                        'updated_at' => now(),
                    ]);
                $count++;
            });

        return $count;
    }

    private function rotateSsoSecrets(?string $tenantId = null): int
    {
        $count = 0;
        OrganizationSsoProvider::query()
            ->whereNotNull('saml_assertion_signing_secret')
            ->when($tenantId !== null, fn (Builder $builder) => $builder->where('tenant_id', $tenantId))
            ->cursor()
            ->each(function (OrganizationSsoProvider $provider) use (&$count): void {
                DB::table('organization_sso_providers')
                    ->where('id', $provider->id)
                    ->update([
                        'saml_assertion_signing_secret' => Crypt::encryptString((string) $provider->saml_assertion_signing_secret),
                        'updated_at' => now(),
                    ]);
                $count++;
            });

        return $count;
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function audit(
        string $operation,
        ?string $tenantId,
        string $status,
        int $affectedRecords,
        array $metadata
    ): void {
        SecretRotationAudit::query()->create([
            'tenant_id' => $tenantId,
            'operation' => $operation,
            'status' => $status,
            'affected_records' => $affectedRecords,
            'scope' => [
                'tenant_id' => $tenantId,
            ],
            'metadata' => $metadata,
            'executed_at' => now(),
        ]);
    }
}
