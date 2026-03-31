<?php

return [
    'stripe' => [
        'webhook_secret' => env('BILLING_STRIPE_WEBHOOK_SECRET'),
    ],
    'dunning' => [
        'max_attempts' => (int) env('BILLING_DUNNING_MAX_ATTEMPTS', 3),
        'attempt_interval_hours' => (int) env('BILLING_DUNNING_ATTEMPT_INTERVAL_HOURS', 24),
    ],
];
