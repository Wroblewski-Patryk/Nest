param(
  [ValidateSet('preview', 'production')]
  [string]$Profile = 'preview',
  [ValidateSet('internal', 'beta', 'production')]
  [string]$Channel = 'internal',
  [ValidateRange(1, 100)]
  [int]$RolloutPercent = 10,
  [double]$HaltOnCrashRatePercent = 2.0,
  [double]$HaltOnInstallFailureRatePercent = 5.0,
  [double]$HaltOnApiErrorRatePercent = 3.0,
  [double]$ObservedCrashRatePercent = -1,
  [double]$ObservedInstallFailureRatePercent = -1,
  [double]$ObservedApiErrorRatePercent = -1,
  [ValidateSet('true', 'false', '1', '0')]
  [string]$RollbackOnFailure = 'true',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$rollbackOnFailureEnabled = $RollbackOnFailure -in @('true', '1')

function Invoke-Rollback {
  param(
    [string]$Reason
  )

  Write-Host "[mobile-release] rollback invoked: $Reason"

  if ($DryRun) {
    Write-Host '[mobile-release] dry-run rollback: promote previous stable build for selected channel and halt rollout'
    return
  }

  Write-Host '[mobile-release] execute rollback using previous stable build reference and notify release owners'
}

Write-Host "[mobile-release] profile: $Profile"
Write-Host "[mobile-release] channel: $Channel"
Write-Host "[mobile-release] rollout percent: $RolloutPercent"
Write-Host "[mobile-release] dry-run: $DryRun"
Write-Host "[mobile-release] rollback-on-failure: $rollbackOnFailureEnabled"

Write-Host '[mobile-release] Step 1/5: validate app build configuration'
if (-not $DryRun) {
  pnpm --dir apps/mobile exec expo config --type public | Out-Null
}

Write-Host '[mobile-release] Step 2/5: trigger EAS build'
if ($DryRun) {
  Write-Host "[mobile-release] dry-run: eas build --platform all --profile $Profile --non-interactive"
} else {
  pnpm --dir apps/mobile exec eas build --platform all --profile $Profile --non-interactive
}

Write-Host '[mobile-release] Step 3/5: staged rollout configuration'
if ($DryRun) {
  if ($Channel -eq 'internal') {
    Write-Host '[mobile-release] dry-run: publish install links to internal tester channel'
  } else {
    Write-Host "[mobile-release] dry-run: stage rollout to $Channel channel at $RolloutPercent% audience"
  }
} else {
  if ($Channel -eq 'internal') {
    Write-Host '[mobile-release] publish release links to internal testers'
  } else {
    Write-Host "[mobile-release] apply staged rollout to $Channel channel at $RolloutPercent%"
  }
}

Write-Host '[mobile-release] Step 4/5: artifact verification checklist'
Write-Host '- install succeeds on iOS and Android physical devices'
Write-Host '- app opens and reaches auth/onboarding screens'
Write-Host '- API connectivity check passes'
Write-Host '- manual sync options visible in settings/modal'

Write-Host '[mobile-release] halt criteria:'
Write-Host "- crash rate > $HaltOnCrashRatePercent%"
Write-Host "- install failure rate > $HaltOnInstallFailureRatePercent%"
Write-Host "- API error rate > $HaltOnApiErrorRatePercent%"

Write-Host '[mobile-release] Step 5/5: rollout gate and rollback decision'
if ($DryRun) {
  Write-Host '[mobile-release] dry-run: evaluate observed metrics against halt criteria and rollback if breached'
} else {
  $hasObservedMetrics =
    $ObservedCrashRatePercent -ge 0 -and
    $ObservedInstallFailureRatePercent -ge 0 -and
    $ObservedApiErrorRatePercent -ge 0

  if (-not $hasObservedMetrics) {
    Write-Host '[mobile-release] observed rollout metrics not provided; manual release owner decision required.'
  } else {
    $haltReasons = @()
    if ($ObservedCrashRatePercent -gt $HaltOnCrashRatePercent) {
      $haltReasons += 'crash-rate-threshold-breached'
    }
    if ($ObservedInstallFailureRatePercent -gt $HaltOnInstallFailureRatePercent) {
      $haltReasons += 'install-failure-threshold-breached'
    }
    if ($ObservedApiErrorRatePercent -gt $HaltOnApiErrorRatePercent) {
      $haltReasons += 'api-error-threshold-breached'
    }

    if ($haltReasons.Count -gt 0) {
      Write-Host ('[mobile-release] rollout halt criteria breached: ' + ($haltReasons -join ', '))
      if ($rollbackOnFailureEnabled) {
        Invoke-Rollback -Reason ($haltReasons -join ', ')
      }
      throw '[mobile-release] staged rollout failed halt criteria.'
    }
  }
}

Write-Host '[mobile-release] completed.'
