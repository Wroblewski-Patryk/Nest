import http from "k6/http";
import { check, sleep } from "k6";

const API_BASE_URL = __ENV.API_BASE_URL || "http://127.0.0.1:9000/api/v1";
const API_TOKEN = __ENV.API_TOKEN || "";
const ENABLE_WRITES = __ENV.ENABLE_WRITES === "1";
const LIST_ID = __ENV.LIST_ID || "";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
};

export const options = {
  scenarios: {
    read_core_modules: {
      executor: "constant-arrival-rate",
      rate: Number(__ENV.READ_RATE || 10),
      timeUnit: "1s",
      duration: __ENV.DURATION || "2m",
      preAllocatedVUs: Number(__ENV.READ_VUS || 20),
      maxVUs: Number(__ENV.READ_MAX_VUS || 60),
      exec: "readCoreModules",
    },
    write_task_light: {
      executor: "constant-arrival-rate",
      rate: ENABLE_WRITES ? Number(__ENV.WRITE_RATE || 2) : 0,
      timeUnit: "1s",
      duration: __ENV.DURATION || "2m",
      preAllocatedVUs: Number(__ENV.WRITE_VUS || 10),
      maxVUs: Number(__ENV.WRITE_MAX_VUS || 30),
      exec: "writeTaskLight",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500", "p(99)<900"],
  },
};

export function readCoreModules() {
  const endpoints = ["/lists?per_page=20", "/tasks?per_page=20", "/goals?per_page=20"];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(`${API_BASE_URL}${endpoint}`, { headers });

  check(response, {
    "read request status is acceptable": (r) => r.status === 200 || r.status === 401,
  });

  sleep(0.2);
}

export function writeTaskLight() {
  if (!ENABLE_WRITES || !API_TOKEN || !LIST_ID) {
    sleep(0.2);
    return;
  }

  const payload = JSON.stringify({
    list_id: LIST_ID,
    title: `k6 load test task ${Date.now()}`,
    priority: "low",
  });

  const response = http.post(`${API_BASE_URL}/tasks`, payload, { headers });
  check(response, {
    "write request status is acceptable": (r) => r.status === 201 || r.status === 429 || r.status === 403,
  });

  sleep(0.3);
}
