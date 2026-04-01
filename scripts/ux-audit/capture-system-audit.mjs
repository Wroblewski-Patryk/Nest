#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..", "..");

const baseUrl = process.env.NEST_WEB_BASE_URL ?? "http://127.0.0.1:9001";
const seedEmail = process.env.NEST_AUDIT_EMAIL ?? "admin@admin.com";
const seedPassword = process.env.NEST_AUDIT_PASSWORD ?? "password";
const evidenceTag = process.env.NEST_AUDIT_TAG ?? "2026-04-01";

const outputRoot = resolve(repoRoot, "docs", "ux_audit_evidence", evidenceTag);

const viewports = [
  { name: "desktop", width: 1440, height: 1200 },
  { name: "mobile", width: 390, height: 844 },
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function waitForUiSettled(page, ms = 1200) {
  await page.waitForLoadState("networkidle", { timeout: 60000 });
  await page.waitForTimeout(ms);
}

async function safeClick(page, selector, options = {}) {
  const locator = page.locator(selector);
  if ((await locator.count()) === 0) {
    return false;
  }
  await locator.first().click(options);
  return true;
}

async function ensureLoggedIn(page) {
  await page.goto(`${baseUrl}/auth`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForUiSettled(page, 600);

  if (new URL(page.url()).pathname === "/dashboard") {
    return;
  }

  const emailInput = page.locator('input[type="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  const submit = page.getByRole("button", { name: /^sign in$/i });

  await emailInput.fill(seedEmail);
  await passwordInput.fill(seedPassword);
  await submit.click();
  await page.waitForFunction(() => window.location.pathname === "/dashboard", { timeout: 60000 });
  await waitForUiSettled(page, 1200);
}

async function capture(page, viewportName, sequence, stepName) {
  const fileName = `${String(sequence).padStart(2, "0")}-${slugify(stepName)}.png`;
  const absPath = resolve(outputRoot, viewportName, fileName);
  await page.screenshot({ path: absPath, fullPage: true });
  return absPath;
}

async function runViewport(viewport) {
  const playwrightImportTarget =
    process.env.NEST_PLAYWRIGHT_IMPORT ?? resolve(repoRoot, "apps", "web", "node_modules", "playwright", "index.mjs");
  const playwrightSpecifier =
    playwrightImportTarget.includes(":\\") || playwrightImportTarget.startsWith("/")
      ? pathToFileURL(playwrightImportTarget).href
      : playwrightImportTarget;
  const { chromium } = await import(playwrightSpecifier);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();

  const rows = [];
  let sequence = 1;

  const pushCapture = async (name, intendedPath, notes = "") => {
    await waitForUiSettled(page);
    const screenshot = await capture(page, viewport.name, sequence, name);
    rows.push({
      sequence,
      viewport: viewport.name,
      step: name,
      intended_path: intendedPath,
      final_path: new URL(page.url()).pathname + new URL(page.url()).search,
      screenshot: screenshot.replace(`${repoRoot}\\`, "").replaceAll("\\", "/"),
      notes,
    });
    sequence += 1;
  };

  try {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await pushCapture("welcome", "/");

    await page.goto(`${baseUrl}/auth`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await pushCapture("auth-login", "/auth");

    await page.goto(`${baseUrl}/auth?mode=register`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await pushCapture("auth-register", "/auth?mode=register");

    await ensureLoggedIn(page);
    await pushCapture("dashboard", "/dashboard");

    const protectedRoutes = [
      { path: "/tasks?tab=tasks", name: "tasks-board" },
      { path: "/tasks?tab=lists", name: "tasks-lists" },
      { path: "/tasks?tab=targets", name: "tasks-targets" },
      { path: "/tasks?tab=goals", name: "tasks-goals" },
      { path: "/habits", name: "habits" },
      { path: "/routines", name: "routines" },
      { path: "/calendar", name: "calendar" },
      { path: "/journal", name: "journal" },
      { path: "/life-areas", name: "life-areas" },
      { path: "/insights", name: "insights" },
      { path: "/settings", name: "settings-profile" },
      { path: "/settings?tab=application", name: "settings-application" },
      { path: "/settings?tab=access", name: "settings-access-api" },
      { path: "/settings?tab=subscription", name: "settings-subscription" },
      { path: "/automations", name: "automations" },
      { path: "/billing", name: "billing" },
      { path: "/goals", name: "goals-route" },
      { path: "/targets", name: "targets-route" },
      { path: "/onboarding", name: "onboarding-route" },
    ];

    for (const route of protectedRoutes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await pushCapture(route.name, route.path);

      if (route.path === "/tasks?tab=tasks") {
        const opened = await safeClick(page, 'button:has-text("Add card")');
        if (opened) {
          await pushCapture("tasks-add-card-open", route.path, "After clicking first Add card.");
        }
      }

      if (route.path === "/calendar") {
        const toggles = [
          { label: "Dzien", name: "calendar-day" },
          { label: "Tydzien", name: "calendar-week" },
          { label: "Miesiac", name: "calendar-month" },
        ];

        for (const toggle of toggles) {
          const btn = page.getByRole("button", { name: new RegExp(`^${toggle.label}$`, "i") });
          if ((await btn.count()) > 0) {
            await btn.first().click();
            await pushCapture(toggle.name, route.path, `Calendar switched to ${toggle.label}.`);
          }
        }
      }
    }

    for (let i = 1; i <= 3; i += 1) {
      await page.goto(`${baseUrl}/journal`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await pushCapture(`journal-stability-pass-${i}`, "/journal", "Repeated open to detect spontaneous redirects.");
    }

    for (let i = 1; i <= 3; i += 1) {
      await page.goto(`${baseUrl}/settings?tab=access`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await pushCapture(
        `settings-access-stability-pass-${i}`,
        "/settings?tab=access",
        "Repeated open to detect spontaneous redirects."
      );
    }
  } finally {
    await browser.close();
  }

  return rows;
}

async function main() {
  await mkdir(outputRoot, { recursive: true });
  for (const viewport of viewports) {
    await mkdir(resolve(outputRoot, viewport.name), { recursive: true });
  }

  const allRows = [];
  for (const viewport of viewports) {
    const rows = await runViewport(viewport);
    allRows.push(...rows);
  }

  const manifestPath = resolve(outputRoot, "capture-manifest.json");
  await writeFile(manifestPath, `${JSON.stringify({ baseUrl, evidenceTag, captures: allRows }, null, 2)}\n`, "utf8");

  const csvHeader = "sequence,viewport,step,intended_path,final_path,screenshot,notes";
  const csvRows = allRows.map((row) =>
    [
      row.sequence,
      row.viewport,
      row.step,
      row.intended_path,
      row.final_path,
      row.screenshot,
      row.notes.replaceAll(",", ";"),
    ].join(",")
  );
  await writeFile(resolve(outputRoot, "capture-manifest.csv"), `${csvHeader}\n${csvRows.join("\n")}\n`, "utf8");

  console.log(`Captured ${allRows.length} screenshots into ${outputRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
