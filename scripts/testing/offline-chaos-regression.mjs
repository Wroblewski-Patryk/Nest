#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const BASE_RETRY_SECONDS = 15;
const MAX_RETRY_SECONDS = 300;
const TICK_MS = 5_000;

function seededRandom(seed) {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 10_000) / 10_000;
  };
}

function computeJitterSeconds(seed, retryCount) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash + retryCount * 17) % 5;
}

function computeRetryDelaySeconds(retryCount, seed) {
  const delay = BASE_RETRY_SECONDS * Math.pow(2, Math.max(0, retryCount - 1));
  return Math.min(MAX_RETRY_SECONDS, delay + computeJitterSeconds(seed, retryCount));
}

function scenarioDefinitions() {
  return [
    {
      id: "packet_loss_30",
      title: "Packet Loss 30%",
      packetLossRate: 0.3,
      latencyMs: 300,
      onlineTimeline: () => true,
      maxTicks: 180,
    },
    {
      id: "high_latency_2500",
      title: "High Latency 2500ms",
      packetLossRate: 0.05,
      latencyMs: 2500,
      onlineTimeline: () => true,
      maxTicks: 180,
    },
    {
      id: "reconnect_storm",
      title: "Reconnect Storm",
      packetLossRate: 0.15,
      latencyMs: 1200,
      onlineTimeline: (tick) => tick % 4 !== 0,
      maxTicks: 240,
    },
  ];
}

function makeQueue(seed) {
  const actions = ["sync_list_tasks", "sync_calendar", "sync_journal"];
  const queue = [];
  for (let round = 0; round < 3; round += 1) {
    for (const action of actions) {
      queue.push({
        id: `${seed}-${action}-${round}`,
        action,
        status: "pending",
        createdAtMs: Date.now() + queue.length * 1000,
        retryCount: 0,
        nextRetryAtMs: null,
      });
    }
  }

  return queue;
}

function runScenario(definition) {
  const random = seededRandom(definition.id);
  const queue = makeQueue(definition.id);
  let nowMs = Date.now();
  let attempts = 0;
  let failures = 0;
  let maxLagSeconds = 0;

  for (let tick = 0; tick < definition.maxTicks; tick += 1) {
    nowMs += TICK_MS;
    const online = definition.onlineTimeline(tick);

    const active = queue.filter((item) => item.status !== "synced");
    if (active.length === 0) {
      break;
    }

    const oldest = active.reduce((minimum, item) => Math.min(minimum, item.createdAtMs), nowMs);
    maxLagSeconds = Math.max(maxLagSeconds, Math.floor((nowMs - oldest) / 1000));

    for (const item of queue) {
      if (item.status === "synced") {
        continue;
      }

      if (item.nextRetryAtMs !== null && item.nextRetryAtMs > nowMs) {
        continue;
      }

      if (!online) {
        item.status = "failed";
        if (item.nextRetryAtMs === null || item.nextRetryAtMs <= nowMs) {
          item.retryCount += 1;
          item.nextRetryAtMs = nowMs + computeRetryDelaySeconds(item.retryCount, item.id) * 1000;
        }
        continue;
      }

      attempts += 1;
      const randomFail = random() < definition.packetLossRate;
      const timeoutFail = definition.latencyMs > 2200 && random() < 0.1;

      if (randomFail || timeoutFail) {
        failures += 1;
        item.status = "failed";
        item.retryCount += 1;
        item.nextRetryAtMs = nowMs + computeRetryDelaySeconds(item.retryCount, item.id) * 1000;
        continue;
      }

      item.status = "synced";
      item.nextRetryAtMs = null;
    }
  }

  const synced = queue.filter((item) => item.status === "synced").length;
  const pendingOrFailed = queue.length - synced;
  const maxRetry = queue.reduce((maximum, item) => Math.max(maximum, item.retryCount), 0);
  const pass =
    pendingOrFailed === 0 &&
    synced === queue.length &&
    maxRetry <= 8 &&
    maxLagSeconds <= 1800;

  return {
    scenario: definition.title,
    id: definition.id,
    pass,
    queue_total: queue.length,
    queue_synced: synced,
    queue_remaining: pendingOrFailed,
    attempts,
    failures,
    max_retry: maxRetry,
    max_lag_seconds: maxLagSeconds,
    packet_loss_rate: definition.packetLossRate,
    latency_ms: definition.latencyMs,
  };
}

function parseOutArg() {
  const outIndex = process.argv.findIndex((value) => value === "--out");
  if (outIndex === -1 || outIndex + 1 >= process.argv.length) {
    return null;
  }

  return process.argv[outIndex + 1];
}

function main() {
  const results = scenarioDefinitions().map(runScenario);
  const failed = results.filter((item) => !item.pass);

  console.log("Offline Chaos Regression Matrix");
  for (const row of results) {
    console.log(
      `${row.id}: ${row.pass ? "PASS" : "FAIL"} | synced=${row.queue_synced}/${row.queue_total} | failures=${row.failures} | maxRetry=${row.max_retry} | maxLag=${row.max_lag_seconds}s`
    );
  }

  const outPath = parseOutArg();
  if (outPath) {
    const absolute = path.resolve(outPath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(
      absolute,
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          suite: "offline-chaos-regression",
          tick_ms: TICK_MS,
          results,
        },
        null,
        2
      ),
      "utf8"
    );
    console.log(`Report written: ${absolute}`);
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main();
