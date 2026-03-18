<?php

namespace App\Tenancy\Exceptions;

use RuntimeException;

class TenantQuotaExceededException extends RuntimeException
{
    public function __construct(
        private readonly string $resource,
        private readonly int $limit,
        private readonly int $current
    ) {
        parent::__construct("Tenant quota exceeded for resource [{$resource}]. Limit: {$limit}.");
    }

    public function resource(): string
    {
        return $this->resource;
    }

    public function limit(): int
    {
        return $this->limit;
    }

    public function current(): int
    {
        return $this->current;
    }
}
