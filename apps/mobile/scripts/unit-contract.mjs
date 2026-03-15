import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dataPath = resolve(process.cwd(), "constants/mvpData.ts");
const content = readFileSync(dataPath, "utf8");

const requiredTelemetry = [
  "screen.tasks.view",
  "screen.habits.view",
  "screen.goals.view",
  "screen.journal.view",
  "screen.calendar.view",
];

for (const eventName of requiredTelemetry) {
  if (!content.includes(`telemetry: '${eventName}'`)) {
    throw new Error(`Missing telemetry event in mobile contract: ${eventName}`);
  }
}

if (!content.includes("state: 'success'")) {
  throw new Error("Missing aligned success state in mobile module contracts.");
}

console.log("Mobile unit contract check passed.");
