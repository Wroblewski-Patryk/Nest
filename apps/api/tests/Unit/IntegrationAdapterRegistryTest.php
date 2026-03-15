<?php

namespace Tests\Unit;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\IntegrationAdapterRegistry;
use App\Integrations\Support\IntegrationSyncResult;
use InvalidArgumentException;
use Tests\TestCase;

class IntegrationAdapterRegistryTest extends TestCase
{
    public function test_registry_resolves_registered_adapter(): void
    {
        $adapter = new class implements IntegrationAdapter
        {
            public function provider(): string
            {
                return 'unit_provider';
            }

            public function sync(array $payload): IntegrationSyncResult
            {
                return new IntegrationSyncResult('external-1');
            }
        };

        $registry = new IntegrationAdapterRegistry([$adapter]);
        $resolved = $registry->resolve('unit_provider');

        $this->assertSame('unit_provider', $resolved->provider());
    }

    public function test_registry_throws_for_unknown_provider(): void
    {
        $registry = new IntegrationAdapterRegistry;

        $this->expectException(InvalidArgumentException::class);
        $registry->resolve('unknown_provider');
    }
}
