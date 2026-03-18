<?php

return [
    'retention_policies' => [
        [
            'table' => 'analytics_events',
            'timestamp_column' => 'occurred_at',
            'retention_days' => 180,
        ],
        [
            'table' => 'integration_sync_audits',
            'timestamp_column' => 'occurred_at',
            'retention_days' => 90,
        ],
        [
            'table' => 'integration_sync_failures',
            'timestamp_column' => 'failed_at',
            'retention_days' => 90,
        ],
        [
            'table' => 'integration_sync_conflicts',
            'timestamp_column' => 'created_at',
            'retention_days' => 90,
        ],
        [
            'table' => 'mobile_push_deliveries',
            'timestamp_column' => 'sent_at',
            'retention_days' => 30,
        ],
        [
            'table' => 'automation_runs',
            'timestamp_column' => 'created_at',
            'retention_days' => 180,
        ],
    ],
    'deletion_tables' => [
        'ai_recommendation_feedback',
        'automation_runs',
        'automation_rules',
        'analytics_events',
        'mobile_push_deliveries',
        'mobile_push_devices',
        'integration_sync_conflicts',
        'integration_sync_audits',
        'integration_sync_failures',
        'sync_mappings',
        'calendar_events',
        'journal_entry_life_area',
        'journal_entries',
        'targets',
        'goals',
        'routine_steps',
        'routines',
        'habit_logs',
        'habits',
        'tasks',
        'task_lists',
        'projects',
        'life_areas',
        'integration_credentials',
        'users',
        'tenants',
    ],
];
