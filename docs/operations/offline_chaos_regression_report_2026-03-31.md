# Offline Chaos and Reconnection Regression Report (NEST-134)

Date: 2026-03-31
Task: `NEST-134`

## Suite

- Scenario runner:
  - `scripts/testing/offline-chaos-regression.mjs`
- PowerShell wrapper:
  - `scripts/testing/run-offline-chaos-suite.ps1`
- Latest machine-readable matrix:
  - `docs/operations/offline_chaos_regression_matrix_2026-03-31.json`

## Automated Matrix Results

1. `packet_loss_30` -> PASS
   - synced: `9/9`
   - failures: `1`
   - max retry depth: `1`
   - max lag: `17s`
2. `high_latency_2500` -> PASS
   - synced: `9/9`
   - failures: `0`
   - max retry depth: `0`
   - max lag: `5s`
3. `reconnect_storm` -> PASS
   - synced: `9/9`
   - failures: `3`
   - max retry depth: `3`
   - max lag: `120s`

## Coverage Mapping

- Packet loss behavior: covered (`packet_loss_30`).
- High-latency degradation behavior: covered (`high_latency_2500`).
- Reconnect storm behavior: covered (`reconnect_storm`).
- Key offline queue actions covered in each scenario:
  - `sync_list_tasks`
  - `sync_calendar`
  - `sync_journal`

## Known Limits and Mitigations

- The suite is deterministic simulation, not a device-level network emulator.
- Real device packet-loss/reconnect smoke still recommended before GA.
- Mitigation:
  - keep release gate requiring manual smoke for high-risk network incidents,
  - rerun automated suite on each release candidate.
