<?php

namespace App\Notifications\Services;

use App\Models\MobilePushDevice;
use App\Models\User;

class MobilePushDeviceService
{
    /**
     * @return list<MobilePushDevice>
     */
    public function listForUser(User $user): array
    {
        return MobilePushDevice::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->orderByDesc('last_registered_at')
            ->get()
            ->all();
    }

    public function registerForUser(
        User $user,
        string $platform,
        string $deviceToken,
        ?string $deviceLabel = null
    ): MobilePushDevice {
        $tokenHash = hash('sha256', $deviceToken);

        return MobilePushDevice::query()->updateOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'platform' => $platform,
                'device_token_hash' => $tokenHash,
            ],
            [
                'device_label' => $deviceLabel,
                'device_token' => $deviceToken,
                'last_registered_at' => now(),
                'revoked_at' => null,
            ]
        );
    }

    public function revokeForUser(User $user, string $deviceId): void
    {
        MobilePushDevice::query()
            ->where('id', $deviceId)
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->update([
                'revoked_at' => now(),
            ]);
    }
}
