#!/usr/bin/env node
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const [, , configPathArg, baseUrlArg, outputDirArg, viewportArg] = process.argv;

if (!configPathArg || !baseUrlArg || !outputDirArg) {
  throw new Error(
    "Usage: node capture-with-playwright.mjs <configPath> <baseUrl> <outputDir> [viewport]"
  );
}

const configPath = resolve(process.cwd(), configPathArg);
const outputDir = resolve(process.cwd(), outputDirArg);
const viewportName = viewportArg ?? "desktop";

const viewport =
  viewportName === "mobile"
    ? { width: 390, height: 844 }
    : viewportName === "tablet"
      ? { width: 1024, height: 1366 }
      : { width: 1600, height: 1000 };

const config = JSON.parse(readFileSync(configPath, "utf8"));
const captures = Array.isArray(config.captures) ? config.captures : [];

if (captures.length === 0) {
  throw new Error(`No captures configured in ${configPathArg}`);
}

const playwrightImportTarget =
  process.env.NEST_PLAYWRIGHT_IMPORT ?? "playwright";
const playwrightImportSpecifier =
  playwrightImportTarget.includes(":\\") || playwrightImportTarget.startsWith("/")
    ? pathToFileURL(playwrightImportTarget).href
    : playwrightImportTarget;
const { chromium } = await import(playwrightImportSpecifier);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport });
const page = await context.newPage();

try {
  for (const capture of captures) {
    const fileName = capture.file;
    const targetPath = resolve(outputDir, fileName);
    mkdirSync(dirname(targetPath), { recursive: true });

    const urlPath = capture.url;
    const url = new URL(urlPath, baseUrlArg).toString();

    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: targetPath, fullPage: true });

    process.stdout.write(
      `captured ${capture.task_id} ${capture.screen_id} -> ${targetPath}\n`
    );
  }
} finally {
  await browser.close();
}
