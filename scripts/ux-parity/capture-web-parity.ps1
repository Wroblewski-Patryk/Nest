param(
  [string]$OutputRoot = "docs/ux_parity_evidence/2026-03-21/web",
  [string]$BaseUrl = "http://127.0.0.1:9101"
)

$ErrorActionPreference = "Stop"

pnpm --dir apps/web exec next build --webpack | Out-Host

$job = Start-Job -ScriptBlock {
  Set-Location $using:PWD
  pnpm --dir apps/web exec next start -p 9101 | Out-Host
}

Start-Sleep -Seconds 6

try {
  pnpm --dir apps/web dlx --allow-build=playwright --package playwright node scripts/ux-parity/capture-with-playwright.mjs scripts/ux-parity/web-capture-config.json $BaseUrl $OutputRoot desktop | Out-Host
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
  Receive-Job $job -ErrorAction SilentlyContinue | Out-Null
  Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
}
