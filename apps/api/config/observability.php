<?php

return [
    'ai_copilot_safety' => [
        'min_score_percent' => (float) env('AI_COPILOT_SAFETY_MIN_SCORE_PERCENT', 95.0),
    ],
    'integration_event_ingestion' => [
        'alerts' => [
            'warning' => [
                'drop_rate_above_percent' => (float) env('INTEGRATION_EVENT_ALERT_WARNING_DROP_RATE_ABOVE_PERCENT', 5.0),
                'avg_lag_ms_above' => (int) env('INTEGRATION_EVENT_ALERT_WARNING_AVG_LAG_MS_ABOVE', 60000),
            ],
            'critical' => [
                'drop_rate_above_percent' => (float) env('INTEGRATION_EVENT_ALERT_CRITICAL_DROP_RATE_ABOVE_PERCENT', 10.0),
                'avg_lag_ms_above' => (int) env('INTEGRATION_EVENT_ALERT_CRITICAL_AVG_LAG_MS_ABOVE', 180000),
            ],
        ],
    ],
    'integration_sync' => [
        'slo' => [
            'success_rate_percent' => (float) env('INTEGRATION_SYNC_SLO_SUCCESS_RATE_PERCENT', 99.0),
            'p95_latency_ms' => (int) env('INTEGRATION_SYNC_SLO_P95_LATENCY_MS', 2000),
        ],
        'alerts' => [
            'warning' => [
                'success_rate_below_percent' => (float) env('INTEGRATION_SYNC_ALERT_WARNING_SUCCESS_RATE_BELOW_PERCENT', 99.5),
                'p95_latency_above_ms' => (int) env('INTEGRATION_SYNC_ALERT_WARNING_P95_LATENCY_ABOVE_MS', 1800),
                'error_budget_burn_above_percent' => (float) env('INTEGRATION_SYNC_ALERT_WARNING_ERROR_BUDGET_BURN_ABOVE_PERCENT', 50),
            ],
            'critical' => [
                'success_rate_below_percent' => (float) env('INTEGRATION_SYNC_ALERT_CRITICAL_SUCCESS_RATE_BELOW_PERCENT', 99.0),
                'p95_latency_above_ms' => (int) env('INTEGRATION_SYNC_ALERT_CRITICAL_P95_LATENCY_ABOVE_MS', 2000),
                'error_budget_burn_above_percent' => (float) env('INTEGRATION_SYNC_ALERT_CRITICAL_ERROR_BUDGET_BURN_ABOVE_PERCENT', 100),
            ],
        ],
        'latency_buckets_ms' => [100, 250, 500, 1000, 2000, 5000],
    ],
];
