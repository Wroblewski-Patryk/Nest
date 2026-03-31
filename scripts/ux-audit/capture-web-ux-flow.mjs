#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:9001";
const outputDirArg = process.argv[3] ?? "docs/ux_audit_evidence/2026-03-31/nest-159/web";
const outputDir = resolve(process.cwd(), outputDirArg);
const playwrightImportTarget =
  process.env.NEST_PLAYWRIGHT_IMPORT ?? resolve(process.cwd(), "apps/web/node_modules/playwright/index.mjs");
const playwrightImportSpecifier =
  playwrightImportTarget.includes(":\\") || playwrightImportTarget.startsWith("/")
    ? pathToFileURL(playwrightImportTarget).href
    : playwrightImportTarget;
const { chromium } = await import(playwrightImportSpecifier);

mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();

/** @type {Array<{step: string; file: string; note: string}>} */
const manifest = [];
let stepCounter = 0;

function safeStepName(step) {
  return step.replaceAll(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
}

async function capture(step, note) {
  stepCounter += 1;
  const file = `${String(stepCounter).padStart(2, "0")}-${safeStepName(step)}.png`;
  const path = resolve(outputDir, file);
  await page.screenshot({ path, fullPage: true });
  manifest.push({ step, file, note });
  process.stdout.write(`captured ${step} -> ${file}\n`);
}

async function goto(route, step, note) {
  try {
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1200);
    await capture(step, note);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await capture(`${step}-error`, `${note} ERROR: ${message}`);
  }
}

async function clickIfVisible(selector) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) > 0) {
    try {
      await locator.scrollIntoViewIfNeeded();
      await locator.click({ timeout: 5000 });
      await page.waitForTimeout(500);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

async function runStep(step, note, action) {
  try {
    await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await capture(`${step}-error`, `${note} ERROR: ${message}`);
  }
}

try {
  await goto("/", "home-dashboard", "Start page with module map and first-action guidance.");

  await goto("/tasks", "tasks-before-login", "Tasks view before auth.");

  const loginButton = page.getByRole("button", { name: "Sign in" });
  if ((await loginButton.count()) > 0) {
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password");
    await loginButton.click();
    await page.waitForTimeout(1200);
    await capture("tasks-after-login", "Authenticated task workspace.");
  }

  const listName = `UX Audit List ${Date.now()}`;
  await page.getByLabel("List name").fill(listName);
  await page.getByRole("button", { name: "Add list" }).click();
  await page.waitForTimeout(900);
  await capture("tasks-list-created", "Create list action result.");

  await runStep(
    "tasks-select-active-list",
    "Ensure active list is selected before task creation.",
    async () => {
      const activeList = page.getByLabel("Active list");
      if ((await activeList.count()) > 0) {
        const options = activeList.locator("option");
        if ((await options.count()) > 1) {
          await activeList.selectOption({ index: 1 });
        }
      }
      await page.waitForTimeout(500);
      await capture("tasks-active-list-selected", "Active list selected.");
    }
  );

  await runStep("tasks-create-task", "Create task action result.", async () => {
    await page.getByLabel("Task title").fill("UX audit task: verify calm daily flow");
    await page.getByLabel("Priority").selectOption("high");
    await page.getByRole("button", { name: "Add task" }).click();
    await page.waitForTimeout(900);
    await capture("tasks-task-created", "Create task action result.");
  });

  if (await clickIfVisible("button:has-text('Mark done')")) {
    await capture("tasks-mark-done", "Task completion action.");
  }

  if (await clickIfVisible("button:has-text('Reopen')")) {
    await capture("tasks-reopen", "Task reopen action.");
  }

  await goto("/habits", "habits-module", "Habits module snapshot.");
  await goto("/routines", "routines-module", "Routines module snapshot.");
  await goto("/goals", "goals-module", "Goals module snapshot.");
  await goto("/targets", "targets-module", "Targets module snapshot.");

  await goto("/calendar", "calendar-module", "Calendar with integrations panels.");
  if (await clickIfVisible("button:has-text('Connect')")) {
    await capture("calendar-provider-connect", "Provider connect action from calendar stack.");
  }
  if (await clickIfVisible("button:has-text('Revoke')")) {
    await capture("calendar-provider-revoke", "Provider revoke action from calendar stack.");
  }
  if (await clickIfVisible("button:has-text('Replay Latest Failure')")) {
    await capture("calendar-health-remediation", "Integration health one-click remediation.");
  }

  await goto("/journal", "journal-module", "Journal module snapshot.");

  await goto("/insights", "insights-module", "Insights module loaded.");
  await clickIfVisible("button:has-text('Refresh Trends')");
  await clickIfVisible("button:has-text('Export Snapshot')");
  await capture("insights-refresh-export-clicked", "Insights action buttons interaction (currently visual only).");

  await goto("/automations", "automations-module", "Automations module loaded.");
  await runStep("automations-create-rule", "Create automation rule action.", async () => {
    await clickIfVisible("button:has-text('Create Rule')");
    await capture("automations-create-rule", "Create automation rule action.");
  });
  await runStep("automations-run-rule", "Manual rule run action.", async () => {
    if (await clickIfVisible("button:has-text('Run')")) {
      await capture("automations-run-rule", "Manual rule run action.");
    }
  });
  await runStep("automations-inspect-run", "Inspect automation run details.", async () => {
    if (await clickIfVisible("button:has-text('Inspect')")) {
      await capture("automations-inspect-run", "Inspect automation run details.");
    }
  });
  await runStep("automations-replay-run", "Replay automation run.", async () => {
    if (await clickIfVisible("button:has-text('Replay')")) {
      await capture("automations-replay-run", "Replay automation run.");
    }
  });

  await goto("/billing", "billing-module", "Billing module loaded.");
  await runStep("billing-start-trial", "Start trial lifecycle action.", async () => {
    await clickIfVisible("button:has-text('Start Trial')");
    await capture("billing-start-trial", "Start trial lifecycle action.");
  });
  await runStep("billing-mark-past-due", "Mark past due lifecycle action.", async () => {
    await clickIfVisible("button:has-text('Mark Past Due')");
    await capture("billing-mark-past-due", "Mark past due lifecycle action.");
  });
  await runStep("billing-recover-past-due", "Recover subscription action.", async () => {
    await clickIfVisible("button:has-text('Recover Past Due')");
    await capture("billing-recover-past-due", "Recover subscription action.");
  });
  await runStep("billing-checkout-session", "Create checkout session action.", async () => {
    await clickIfVisible("button:has-text('Create Checkout Session')");
    await capture("billing-checkout-session", "Create checkout session action.");
  });
  await runStep("billing-portal-session", "Create portal session action.", async () => {
    await clickIfVisible("button:has-text('Create Portal Session')");
    await capture("billing-portal-session", "Create portal session action.");
  });

  await goto("/onboarding", "onboarding-module", "Onboarding form loaded.");
  await runStep("onboarding-submit", "Onboarding submit interaction.", async () => {
    await page.getByLabel("Display name").fill("UX Audit User");
    await page.getByLabel("Language").selectOption("pl");
    await clickIfVisible("button:has-text('Continue')");
    await capture("onboarding-submit", "Onboarding submit interaction.");
  });

  writeFileSync(
    resolve(outputDir, "manifest.json"),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        base_url: baseUrl,
        captures: manifest,
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
