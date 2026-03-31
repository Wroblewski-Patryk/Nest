import type { ModuleKey, TelemetryEventName, UiAsyncState } from "@nest/shared-types";

export const moduleReadiness: Array<{
  href: string;
  label: string;
  key: ModuleKey;
  focus: string;
  state: UiAsyncState;
  telemetry: TelemetryEventName;
}> = [
  {
    href: "/tasks",
    label: "Tasks + Lists",
    key: "tasks",
    focus: "Capture daily commitments and execute them calmly.",
    state: "success",
    telemetry: "screen.tasks.view",
  },
  {
    href: "/habits",
    label: "Habits",
    key: "habits",
    focus: "Track consistency of small recurring actions.",
    state: "success",
    telemetry: "screen.habits.view",
  },
  {
    href: "/routines",
    label: "Routines",
    key: "routines",
    focus: "Run reusable rituals and structured sequences.",
    state: "success",
    telemetry: "screen.habits.view",
  },
  {
    href: "/goals",
    label: "Goals",
    key: "goals",
    focus: "Define long-term outcomes for the next weeks and months.",
    state: "success",
    telemetry: "screen.goals.view",
  },
  {
    href: "/targets",
    label: "Targets",
    key: "targets",
    focus: "Track measurable checkpoints linked to goals.",
    state: "success",
    telemetry: "screen.goals.view",
  },
  {
    href: "/calendar",
    label: "Calendar",
    key: "calendar",
    focus: "Place tasks, habits, and routines on your timeline.",
    state: "success",
    telemetry: "screen.calendar.view",
  },
  {
    href: "/journal",
    label: "Journal",
    key: "journal",
    focus: "Reflect on mood and life-area balance.",
    state: "success",
    telemetry: "screen.journal.view",
  },
  {
    href: "/insights",
    label: "Insights",
    key: "insights",
    focus: "Read trends and adjust weekly priorities.",
    state: "success",
    telemetry: "screen.insights.view",
  },
];

export const tasksSnapshot = {
  lists: [
    { name: "Deep Work", count: 4, color: "#0ea5e9" },
    { name: "Home Ops", count: 3, color: "#f97316" },
    { name: "Health", count: 2, color: "#22c55e" },
  ],
  items: [
    { title: "Design weekly sprint board", priority: "high", due: "Today" },
    { title: "Meal prep for 3 days", priority: "medium", due: "Tomorrow" },
    { title: "Book dentist visit", priority: "urgent", due: "In 2 days" },
  ],
};

export const habitsSnapshot = {
  habits: [
    { title: "30 min reading", streak: 9, cadence: "daily" },
    { title: "10k steps", streak: 5, cadence: "daily" },
    { title: "Weekly review", streak: 3, cadence: "weekly" },
  ],
  routines: [
    { title: "Morning Activation", steps: 4, duration: "35 min" },
    { title: "Shutdown Ritual", steps: 3, duration: "20 min" },
  ],
};

export const goalsSnapshot = {
  goals: [
    { title: "Run a half marathon", status: "active", progress: 62 },
    { title: "Launch MVP", status: "active", progress: 78 },
  ],
  targets: [
    { title: "3 training runs / week", value: "2/3" },
    { title: "2 release candidates", value: "1/2" },
  ],
};

export const journalSnapshot = {
  entries: [
    { title: "Monday reflection", mood: "good", lifeAreas: "Work, Mindset" },
    { title: "Weekend reset", mood: "great", lifeAreas: "Health, Home" },
  ],
  lifeAreas: [
    { name: "Health", weight: 28 },
    { name: "Work", weight: 24 },
    { name: "Relationships", weight: 18 },
    { name: "Learning", weight: 14 },
  ],
};

export const calendarSnapshot = [
  {
    time: "08:30",
    title: "Morning routine",
    type: "routine",
  },
  {
    time: "10:00",
    title: "Sprint planning",
    type: "task",
  },
  {
    time: "18:00",
    title: "Goal review",
    type: "goal",
  },
];

export const insightsSnapshot = {
  balance: {
    globalScore: 67,
    windowDays: 30,
    rows: [
      { name: "Health", score: 70, target: 70, actual: 50 },
      { name: "Career", score: 60, target: 30, actual: 50 },
    ],
  },
  trends: [
    { module: "tasks", period: "weekly", total: 8 },
    { module: "habits", period: "weekly", total: 11 },
    { module: "goals", period: "weekly", total: 4 },
  ],
};
