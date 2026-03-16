import type { ModuleKey, TelemetryEventName, UiAsyncState } from '@nest/shared-types';

type ModuleSnapshot = {
  state: UiAsyncState;
  module: ModuleKey;
  telemetry: TelemetryEventName;
  metrics: Array<{ label: string; value: string }>;
  rows: Array<{ title: string; detail: string; badge: string }>;
};

export const tasksData: ModuleSnapshot = {
  state: 'success',
  module: 'tasks',
  telemetry: 'screen.tasks.view',
  metrics: [
    { label: 'Open tasks', value: '9' },
    { label: 'Urgent', value: '1' },
    { label: 'Lists', value: '3' },
  ],
  rows: [
    { title: 'Deep Work', detail: '4 tasks', badge: 'list' },
    { title: 'Home Ops', detail: '3 tasks', badge: 'list' },
    { title: 'Design weekly sprint board', detail: 'Today', badge: 'high' },
  ],
};

export const habitsData: ModuleSnapshot = {
  state: 'success',
  module: 'habits',
  telemetry: 'screen.habits.view',
  metrics: [
    { label: 'Habits', value: '3' },
    { label: 'Routines', value: '2' },
    { label: 'Top streak', value: '9d' },
  ],
  rows: [
    { title: '30 min reading', detail: 'daily', badge: '9d' },
    { title: '10k steps', detail: 'daily', badge: '5d' },
    { title: 'Morning Activation', detail: '4 steps', badge: '35m' },
  ],
};

export const goalsData: ModuleSnapshot = {
  state: 'success',
  module: 'goals',
  telemetry: 'screen.goals.view',
  metrics: [
    { label: 'Goals', value: '2' },
    { label: 'Targets', value: '2' },
    { label: 'Progress', value: '70%' },
  ],
  rows: [
    { title: 'Run a half marathon', detail: 'active', badge: '62%' },
    { title: 'Launch MVP', detail: 'active', badge: '78%' },
    { title: '3 training runs/week', detail: 'checkpoint', badge: '2/3' },
  ],
};

export const journalData: ModuleSnapshot = {
  state: 'success',
  module: 'journal',
  telemetry: 'screen.journal.view',
  metrics: [
    { label: 'Entries', value: '2' },
    { label: 'Life Areas', value: '4' },
    { label: 'Mood', value: 'Positive' },
  ],
  rows: [
    { title: 'Monday reflection', detail: 'Work, Mindset', badge: 'good' },
    { title: 'Weekend reset', detail: 'Health, Home', badge: 'great' },
    { title: 'Health', detail: 'balance weight', badge: '28%' },
  ],
};

export const calendarData: ModuleSnapshot = {
  state: 'success',
  module: 'calendar',
  telemetry: 'screen.calendar.view',
  metrics: [
    { label: 'Events', value: '3' },
    { label: 'Linked', value: '3' },
    { label: 'Blocked', value: '4h 30m' },
  ],
  rows: [
    { title: 'Morning routine', detail: '08:30', badge: 'routine' },
    { title: 'Sprint planning', detail: '10:00', badge: 'task' },
    { title: 'Goal review', detail: '18:00', badge: 'goal' },
  ],
};

export const insightsData: ModuleSnapshot = {
  state: 'success',
  module: 'insights',
  telemetry: 'screen.insights.view',
  metrics: [
    { label: 'Balance', value: '67.0' },
    { label: 'Window', value: '30d' },
    { label: 'Trends', value: '23' },
  ],
  rows: [
    { title: 'Health', detail: 'target 70% vs actual 50%', badge: '70.0' },
    { title: 'Career', detail: 'target 30% vs actual 50%', badge: '60.0' },
    { title: 'Tasks/Habits/Goals', detail: 'weekly trend totals', badge: '8/11/4' },
  ],
};
