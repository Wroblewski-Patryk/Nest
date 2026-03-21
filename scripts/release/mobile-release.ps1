param(
  [ValidateSet('preview', 'production')]
  [string]$Profile = 'preview',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

Write-Host "[mobile-release] profile: $Profile"
Write-Host "[mobile-release] dry-run: $DryRun"

Write-Host '[mobile-release] Step 1/4: validate app build configuration'
if (-not $DryRun) {
  pnpm --dir apps/mobile exec expo config --type public | Out-Null
}

Write-Host '[mobile-release] Step 2/4: trigger EAS build'
if ($DryRun) {
  Write-Host "[mobile-release] dry-run: eas build --platform all --profile $Profile --non-interactive"
} else {
  pnpm --dir apps/mobile exec eas build --platform all --profile $Profile --non-interactive
}

Write-Host '[mobile-release] Step 3/4: internal distribution handoff'
if ($DryRun) {
  Write-Host '[mobile-release] dry-run: publish install links to QA channel and notify phone test group'
} else {
  Write-Host '[mobile-release] publish release links to internal testers'
}

Write-Host '[mobile-release] Step 4/4: artifact verification checklist'
Write-Host '- install succeeds on iOS and Android physical devices'
Write-Host '- app opens and reaches auth/onboarding screens'
Write-Host '- API connectivity check passes'
Write-Host '- manual sync options visible in settings/modal'

Write-Host '[mobile-release] completed.'
