import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const manifestPath = resolve(process.cwd(), ".next/server/app-paths-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const requiredRoutes = [
  "/tasks/page",
  "/habits/page",
  "/goals/page",
  "/journal/page",
  "/calendar/page",
];

for (const route of requiredRoutes) {
  if (!(route in manifest)) {
    throw new Error(`Missing required web route in smoke check: ${route}`);
  }
}

console.log("Web smoke route check passed.");
