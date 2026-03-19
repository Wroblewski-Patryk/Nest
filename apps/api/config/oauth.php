<?php

return [
    'providers' => [
        'google' => [
            'issuers' => [
                'https://accounts.google.com',
                'accounts.google.com',
            ],
            'audiences' => array_values(array_filter([
                env('OAUTH_GOOGLE_CLIENT_ID'),
            ])),
            'jwks_url' => env('OAUTH_GOOGLE_JWKS_URL', 'https://www.googleapis.com/oauth2/v3/certs'),
            'jwks' => null,
        ],
        'apple' => [
            'issuers' => [
                'https://appleid.apple.com',
            ],
            'audiences' => array_values(array_filter([
                env('OAUTH_APPLE_CLIENT_ID'),
            ])),
            'jwks_url' => env('OAUTH_APPLE_JWKS_URL', 'https://appleid.apple.com/auth/keys'),
            'jwks' => null,
        ],
    ],
];
