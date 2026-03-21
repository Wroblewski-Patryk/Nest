param(
  [string]$OutputRoot = "docs/ux_parity_evidence/2026-03-21/web",
  [string]$BaseUrl = "http://127.0.0.1:9101"
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path ".").Path
$ConfigPath = Join-Path $RepoRoot "scripts/ux-parity/web-capture-config.json"
$OutputPath = Join-Path $RepoRoot $OutputRoot
$PlaywrightImportPath = Join-Path $RepoRoot "apps/web/node_modules/playwright/index.mjs"

pnpm --dir apps/web exec next build --webpack | Out-Host

$job = Start-Job -ScriptBlock {
  Set-Location $using:PWD
  pnpm --dir apps/web exec next start -p 9101 | Out-Host
}

Start-Sleep -Seconds 6

try {
  $env:NEST_PLAYWRIGHT_IMPORT = $PlaywrightImportPath
  pnpm --dir apps/web exec node "$RepoRoot/scripts/ux-parity/capture-with-playwright.mjs" "$ConfigPath" "$BaseUrl" "$OutputPath" desktop | Out-Host
} finally {
  Remove-Item Env:NEST_PLAYWRIGHT_IMPORT -ErrorAction SilentlyContinue
  Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
  Receive-Job $job -ErrorAction SilentlyContinue | Out-Null
  Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
}
