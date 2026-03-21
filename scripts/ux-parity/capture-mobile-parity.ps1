param(
  [string]$OutputRoot = "docs/ux_parity_evidence/2026-03-21/mobile",
  [string]$BaseUrl = "http://127.0.0.1:8081"
)

$ErrorActionPreference = "Stop"

pnpm --dir apps/mobile exec expo export --platform web | Out-Host

$job = Start-Job -ScriptBlock {
  Set-Location $using:PWD
  pnpm --dir apps/mobile exec expo serve --web --port 8081 --non-interactive | Out-Host
}

Start-Sleep -Seconds 6

try {
  pnpm --dir apps/mobile dlx --allow-build=playwright --package playwright node scripts/ux-parity/capture-with-playwright.mjs scripts/ux-parity/mobile-capture-config.json $BaseUrl $OutputRoot mobile | Out-Host
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
  Receive-Job $job -ErrorAction SilentlyContinue | Out-Null
  Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
}
