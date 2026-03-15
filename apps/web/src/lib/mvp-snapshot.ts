import type { ModuleKey } from "@nest/shared-types";

export const moduleReadiness: Array<{
  href: string;
  label: string;
  key: ModuleKey;
  focus: string;
  status: "Ready" | "In Progress";
}> = [
  {
    href: "/tasks",
    label: "Tasks + Lists",
    key: "tasks",
    focus: "Capture and execute daily plan.",
    status: "Ready",
  },
  {
    href: "/habits",
    label: "Habits + Routines",
    key: "habits",
    focus: "Track consistency and routine blocks.",
    status: "Ready",
  },
  {
    href: "/goals",
    label: "Goals + Targets",
    key: "goals",
    focus: "Connect long-term goals with measurable targets.",
    status: "Ready",
  },
  {
    href: "/journal",
    label: "Journal + Life Areas",
    key: "journal",
    focus: "Reflect on mood and life-area balance.",
    status: "Ready",
  },
  {
    href: "/calendar",
    label: "Calendar",
    key: "calendar",
    focus: "Schedule events linked to planning entities.",
    status: "Ready",
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
