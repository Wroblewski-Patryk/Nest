<?php

use App\Models\AutomationRule;
use App\Models\CalendarEvent;
use App\Models\Goal;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\JournalEntry;
use App\Models\LifeArea;
use App\Models\Routine;
use App\Models\Target;
use App\Models\Task;
use App\Models\TaskList;

return [
    'resources' => [
        'task_lists' => [
            'model' => TaskList::class,
            'limit' => 100,
        ],
        'tasks' => [
            'model' => Task::class,
            'limit' => 5000,
        ],
        'habits' => [
            'model' => Habit::class,
            'limit' => 500,
        ],
        'habit_logs' => [
            'model' => HabitLog::class,
            'limit' => 50000,
        ],
        'routines' => [
            'model' => Routine::class,
            'limit' => 300,
        ],
        'goals' => [
            'model' => Goal::class,
            'limit' => 300,
        ],
        'targets' => [
            'model' => Target::class,
            'limit' => 2000,
        ],
        'life_areas' => [
            'model' => LifeArea::class,
            'limit' => 100,
        ],
        'journal_entries' => [
            'model' => JournalEntry::class,
            'limit' => 20000,
        ],
        'calendar_events' => [
            'model' => CalendarEvent::class,
            'limit' => 20000,
        ],
        'automation_rules' => [
            'model' => AutomationRule::class,
            'limit' => 500,
        ],
    ],
];
