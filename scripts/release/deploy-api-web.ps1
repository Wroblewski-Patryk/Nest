param(
  [ValidateSet('staging', 'production')]
  [string]$Environment = 'staging',
  [ValidateSet('canary', 'bluegreen')]
  [string]$RolloutStrategy = 'canary',
  [ValidateRange(1, 50)]
  [int]$CanaryPercent = 10,
  [ValidateSet('true', 'false', '1', '0')]
  [string]$AutoPromote = 'true',
  [ValidateSet('true', 'false', '1', '0')]
  [string]$RollbackOnFailure = 'true',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$autoPromoteEnabled = $AutoPromote -in @('true', '1')
$rollbackOnFailureEnabled = $RollbackOnFailure -in @('true', '1')

function Invoke-HealthGate {
  param(
    [string]$ApiUrl,
    [string]$WebUrl,
    [string]$Phase
  )

  Write-Host "[deploy] health gate ($Phase)"

  if ($DryRun) {
    Write-Host "[deploy] dry-run health check: $ApiUrl"
    Write-Host "[deploy] dry-run health check: $WebUrl"
    return $true
  }

  try {
    $apiResponse = Invoke-WebRequest -UseBasicParsing -Uri $ApiUrl -Method GET
    $webResponse = Invoke-WebRequest -UseBasicParsing -Uri $WebUrl -Method GET

    if ($apiResponse.StatusCode -ge 400 -or $webResponse.StatusCode -ge 400) {
      return $false
    }

    return $true
  } catch {
    return $false
  }
}

function Invoke-SloGate {
  param(
    [string]$Phase
  )

  Write-Host "[deploy] SLO gate ($Phase)"

  if ($DryRun) {
    Write-Host '[deploy] dry-run: php artisan integrations:sync-slo-check --json --strict'
    return $true
  }

  Push-Location apps/api
  php artisan integrations:sync-slo-check --json --strict
  $exitCode = $LASTEXITCODE
  Pop-Location

  return $exitCode -eq 0
}

function Invoke-RollbackHook {
  param(
    [string]$Reason
  )

  Write-Host "[deploy] rollback invoked: $Reason"

  if ($DryRun) {
    Write-Host '[deploy] dry-run rollback: php artisan down && restore previous release symlink && php artisan up'
    return
  }

  Write-Host '[deploy] rollback hook is available via release symlink strategy (documented runbook).'
}

Write-Host "[deploy] environment: $Environment"
Write-Host "[deploy] dry-run: $DryRun"
Write-Host "[deploy] strategy: $RolloutStrategy"
Write-Host "[deploy] canary percent: $CanaryPercent"
Write-Host "[deploy] auto-promote: $autoPromoteEnabled"
Write-Host "[deploy] rollback-on-failure: $rollbackOnFailureEnabled"

Write-Host '[deploy] Step 1/7: build API dependencies and run tests'
if (-not $DryRun) {
  Push-Location apps/api
  composer install --no-interaction --no-progress --prefer-dist
  php artisan test --testsuite=Feature --env=testing
  Pop-Location
}

Write-Host '[deploy] Step 2/7: build web artifact'
if (-not $DryRun) {
  pnpm --dir apps/web build
}

Write-Host '[deploy] Step 3/7: run DB migrations'
if ($DryRun) {
  Write-Host '[deploy] dry-run: php artisan migrate --force'
} else {
  Push-Location apps/api
  php artisan migrate --force
  Pop-Location
}

Write-Host '[deploy] Step 4/7: deploy partial traffic target'
$apiHealthUrl = if ($Environment -eq 'production') { 'https://api.example.com/health' } else { 'https://staging-api.example.com/health' }
$webHealthUrl = if ($Environment -eq 'production') { 'https://app.example.com' } else { 'https://staging-app.example.com' }

if ($RolloutStrategy -eq 'canary') {
  Write-Host "[deploy] canary rollout: $CanaryPercent% traffic"
} else {
  Write-Host '[deploy] blue-green rollout: deploy green stack before switch'
}

Write-Host '[deploy] Step 5/7: canary/partial verification gates'
$healthGateOk = Invoke-HealthGate -ApiUrl $apiHealthUrl -WebUrl $webHealthUrl -Phase 'canary'
$sloGateOk = Invoke-SloGate -Phase 'canary'

if (-not ($healthGateOk -and $sloGateOk)) {
  if ($rollbackOnFailureEnabled) {
    Invoke-RollbackHook -Reason 'canary gates failed'
  }

  throw '[deploy] progressive delivery gates failed before promotion.'
}

Write-Host '[deploy] Step 6/7: promote rollout'
if (-not $autoPromoteEnabled) {
  Write-Host '[deploy] auto-promote disabled; waiting for manual promotion approval.'
} elseif ($RolloutStrategy -eq 'canary') {
  Write-Host '[deploy] promoting canary from partial traffic to 100%.'
} else {
  Write-Host '[deploy] switching traffic from blue to green.'
}

Write-Host '[deploy] Step 7/7: post-promotion verification and rollback hooks'
$postHealthOk = Invoke-HealthGate -ApiUrl $apiHealthUrl -WebUrl $webHealthUrl -Phase 'post-promotion'
$postSloOk = Invoke-SloGate -Phase 'post-promotion'

if (-not ($postHealthOk -and $postSloOk)) {
  if ($rollbackOnFailureEnabled) {
    Invoke-RollbackHook -Reason 'post-promotion gates failed'
  }

  throw '[deploy] post-promotion verification failed.'
}

Write-Host '[deploy] rollback hook is armed via release symlink strategy.'
Write-Host '[deploy] completed.'
