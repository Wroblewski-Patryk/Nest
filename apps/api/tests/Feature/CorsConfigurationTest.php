<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsConfigurationTest extends TestCase
{
    public function test_testing_environment_allows_documented_local_frontend_origins(): void
    {
        $origins = config('cors.allowed_origins');

        $this->assertContains('http://localhost:9001', $origins);
        $this->assertContains('http://127.0.0.1:9001', $origins);
        $this->assertContains('http://localhost:9002', $origins);
        $this->assertContains('http://127.0.0.1:9002', $origins);
    }
}
