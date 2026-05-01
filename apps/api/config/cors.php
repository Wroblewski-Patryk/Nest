<?php

$configuredOrigins = env('CORS_ALLOWED_ORIGINS', '');

$allowedOrigins = array_values(array_filter(array_map(
    static fn (string $origin): string => trim($origin),
    explode(',', $configuredOrigins)
)));

$localDevelopmentOrigins = [
    'http://localhost:9001',
    'http://127.0.0.1:9001',
    'http://localhost:9002',
    'http://127.0.0.1:9002',
];

$appEnvironment = env('APP_ENV', 'production');

if ($allowedOrigins === [] && in_array($appEnvironment, ['local', 'testing'], true)) {
    $allowedOrigins = $localDevelopmentOrigins;
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'health'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
