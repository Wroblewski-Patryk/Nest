<?php

return [
    'secret_rotation' => [
        'max_age_days' => (int) env('SECURITY_SECRET_ROTATION_MAX_AGE_DAYS', 30),
    ],
    'oauth' => [
        'allowed_providers' => ['google', 'apple'],
    ],
    'sso' => [
        'allowed_protocols' => ['oidc', 'saml'],
    ],
];
