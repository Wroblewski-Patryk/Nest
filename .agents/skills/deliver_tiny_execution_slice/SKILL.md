---
name: deliver_tiny_execution_slice
description: Execute one tiny, reversible implementation slice aligned with Nest planning docs and context board updates. Use when user asks to continue work with commands like start/go/next/run.
---

# Procedure

## Step 1
Read first unchecked item from active planning source and define smallest meaningful code slice.

## Step 2
Implement exactly one focused change in apps/packages/scripts without mixing unrelated refactors.

## Step 3
Run targeted checks for touched area only.

## Step 4
Update `.codex/context/TASK_BOARD.md` and `.codex/context/PROJECT_STATE.md` with evidence-based status.

## Step 5
Report changed files, checks run, and the next tiny task.

## Validation
- ensure scope stayed single-purpose
- ensure docs/context reflect real state
- ensure all claimed checks actually ran

## Output
- minimal patch tied to one task
- updated task/context docs
- clear next-step recommendation
