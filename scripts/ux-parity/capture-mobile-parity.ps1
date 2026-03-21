param(
  [string]$OutputRoot = "docs/ux_parity_evidence/2026-03-21/mobile",
  [string]$BaseUrl = "http://127.0.0.1:8081"
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path ".").Path
$ConfigPath = Join-Path $RepoRoot "scripts/ux-parity/mobile-capture-config.json"
$OutputPath = Join-Path $RepoRoot $OutputRoot
$PlaywrightImportPath = Join-Path $RepoRoot "apps/web/node_modules/playwright/index.mjs"

pnpm --dir apps/mobile exec expo export --platform web | Out-Host

$job = Start-Job -ScriptBlock {
  Set-Location $using:PWD
  pnpm --dir apps/web dlx serve apps/mobile/dist -l 8081 | Out-Host
}

Start-Sleep -Seconds 6

try {
  $env:NEST_PLAYWRIGHT_IMPORT = $PlaywrightImportPath
  pnpm --dir apps/web exec node "$RepoRoot/scripts/ux-parity/capture-with-playwright.mjs" "$ConfigPath" "$BaseUrl" "$OutputPath" mobile | Out-Host
} finally {
  Remove-Item Env:NEST_PLAYWRIGHT_IMPORT -ErrorAction SilentlyContinue
  Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
  Receive-Job $job -ErrorAction SilentlyContinue | Out-Null
  Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
}
