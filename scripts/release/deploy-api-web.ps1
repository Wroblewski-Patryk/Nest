param(
  [ValidateSet('staging', 'production')]
  [string]$Environment = 'staging',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

Write-Host "[deploy] environment: $Environment"
Write-Host "[deploy] dry-run: $DryRun"

Write-Host '[deploy] Step 1/5: build API dependencies and run tests'
if (-not $DryRun) {
  Push-Location apps/api
  composer install --no-interaction --no-progress --prefer-dist
  php artisan test --testsuite=Feature --env=testing
  Pop-Location
}

Write-Host '[deploy] Step 2/5: build web artifact'
if (-not $DryRun) {
  pnpm --dir apps/web build
}

Write-Host '[deploy] Step 3/5: run DB migrations'
if ($DryRun) {
  Write-Host '[deploy] dry-run: php artisan migrate --force'
} else {
  Push-Location apps/api
  php artisan migrate --force
  Pop-Location
}

Write-Host '[deploy] Step 4/5: health checks'
$apiHealthUrl = if ($Environment -eq 'production') { 'https://api.example.com/health' } else { 'https://staging-api.example.com/health' }
$webHealthUrl = if ($Environment -eq 'production') { 'https://app.example.com' } else { 'https://staging-app.example.com' }

if ($DryRun) {
  Write-Host "[deploy] dry-run health check: $apiHealthUrl"
  Write-Host "[deploy] dry-run health check: $webHealthUrl"
} else {
  Invoke-WebRequest -UseBasicParsing -Uri $apiHealthUrl | Out-Null
  Invoke-WebRequest -UseBasicParsing -Uri $webHealthUrl | Out-Null
}

Write-Host '[deploy] Step 5/5: rollback hooks registration'
if ($DryRun) {
  Write-Host '[deploy] dry-run rollback hook: php artisan down && restore previous release symlink && php artisan up'
} else {
  Write-Host '[deploy] rollback hook is available via release symlink strategy (documented runbook).'
}

Write-Host '[deploy] completed.'
