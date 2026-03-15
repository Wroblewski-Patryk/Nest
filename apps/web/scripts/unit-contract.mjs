import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const snapshotPath = resolve(process.cwd(), "src/lib/mvp-snapshot.ts");
const content = readFileSync(snapshotPath, "utf8");

const requiredTelemetry = [
  "screen.tasks.view",
  "screen.habits.view",
  "screen.goals.view",
  "screen.journal.view",
  "screen.calendar.view",
];

const requiredStates = ["success"];

for (const eventName of requiredTelemetry) {
  if (!content.includes(eventName)) {
    throw new Error(`Missing telemetry event in web contract: ${eventName}`);
  }
}

for (const state of requiredStates) {
  if (!content.includes(`state: "${state}"`)) {
    throw new Error(`Missing aligned UI state in web contract: ${state}`);
  }
}

console.log("Web unit contract check passed.");
