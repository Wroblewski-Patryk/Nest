<?php

namespace App\Integrations;

use App\Integrations\Contracts\IntegrationAdapter;
use InvalidArgumentException;

class IntegrationAdapterRegistry
{
    /**
     * @var array<string, IntegrationAdapter>
     */
    private array $adapters = [];

    /**
     * @param  iterable<IntegrationAdapter>  $adapters
     */
    public function __construct(iterable $adapters = [])
    {
        foreach ($adapters as $adapter) {
            $this->register($adapter);
        }
    }

    public function register(IntegrationAdapter $adapter): void
    {
        $this->adapters[$adapter->provider()] = $adapter;
    }

    public function resolve(string $provider): IntegrationAdapter
    {
        if (! isset($this->adapters[$provider])) {
            throw new InvalidArgumentException("Unsupported integration provider [{$provider}].");
        }

        return $this->adapters[$provider];
    }
}
