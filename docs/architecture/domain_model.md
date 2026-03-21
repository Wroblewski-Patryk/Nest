# Domain Model

Main entities in Nest.

---

# User

Represents a system user.

Fields:

- id
- email
- name
- timezone
- settings

---

# LifeArea

Represents an area of life.

Examples:

- Health
- Career
- Relationships
- Learning

Entities can belong to multiple life areas.

---

# Task

Represents an actionable item.

Fields:

- title
- description
- status
- due_date
- priority
- source

---

# List

Collection of tasks.

Examples:

- shopping list
- ideas
- backlog

---

# Project

Represents a larger initiative.

Example:

- Nest development
- CryptoSparrow

Projects contain lists and tasks.

---

# Habit

Represents recurring behaviors.

Types:

- boolean
- numeric
- duration

---

# Routine

Sequence of actions.

Example:

Morning routine.

---

# Goal

Represents a long-term objective.

Goals contain targets.

---

# Target

Measurable progress indicator for goals.

Example:

3 workouts per week.

---

# JournalEntry

User reflection or note.

---

# CalendarEvent

Represents time-blocked activity.

Synced with Google Calendar.