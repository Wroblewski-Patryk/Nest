<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MobilePushDeviceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_list_and_revoke_mobile_push_device(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user);

        $register = $this->postJson('/api/v1/notifications/mobile/devices', [
            'platform' => 'android',
            'device_token' => 'expo-device-token-android-1234567890',
            'device_label' => 'Pixel 8',
        ])->assertCreated();

        $deviceId = (string) $register->json('data.id');
        $this->assertDatabaseHas('mobile_push_devices', [
            'id' => $deviceId,
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'platform' => 'android',
            'device_label' => 'Pixel 8',
        ]);

        $this->getJson('/api/v1/notifications/mobile/devices')
            ->assertOk()
            ->assertJsonPath('data.0.id', $deviceId)
            ->assertJsonPath('data.0.platform', 'android');

        $this->deleteJson("/api/v1/notifications/mobile/devices/{$deviceId}")
            ->assertOk()
            ->assertJsonPath('data.device_id', $deviceId)
            ->assertJsonPath('data.status', 'revoked');

        $this->assertDatabaseMissing('mobile_push_devices', [
            'id' => $deviceId,
            'revoked_at' => null,
        ]);
    }

    public function test_mobile_push_devices_are_tenant_and_user_scoped(): void
    {
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        Sanctum::actingAs($userA);
        $this->postJson('/api/v1/notifications/mobile/devices', [
            'platform' => 'ios',
            'device_token' => 'expo-device-token-ios-1234567890',
            'device_label' => 'iPhone',
        ])->assertCreated();

        Sanctum::actingAs($userB);
        $this->getJson('/api/v1/notifications/mobile/devices')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_guest_cannot_manage_mobile_push_devices(): void
    {
        $this->getJson('/api/v1/notifications/mobile/devices')->assertUnauthorized();
        $this->postJson('/api/v1/notifications/mobile/devices', [
            'platform' => 'android',
            'device_token' => 'expo-device-token-android-1234567890',
        ])->assertUnauthorized();
        $this->deleteJson('/api/v1/notifications/mobile/devices/fake-id')->assertUnauthorized();
    }
}
