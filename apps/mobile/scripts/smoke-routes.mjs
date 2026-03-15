import { existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredFiles = [
  "dist/index.html",
  "dist/goals.html",
  "dist/habits.html",
  "dist/journal.html",
  "dist/calendar.html",
];

for (const relativePath of requiredFiles) {
  const absolutePath = resolve(process.cwd(), relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required mobile smoke artifact: ${relativePath}`);
  }
}

console.log("Mobile smoke route check passed.");
