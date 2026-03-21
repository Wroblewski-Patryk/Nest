param(
  [ValidateSet('staging', 'production')]
  [string]$Environment = 'staging',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$apiBase = if ($Environment -eq 'production') { 'https://api.example.com' } else { 'https://staging-api.example.com' }
$webBase = if ($Environment -eq 'production') { 'https://app.example.com' } else { 'https://staging-app.example.com' }

Write-Host "[smoke] environment: $Environment"
Write-Host "[smoke] dry-run: $DryRun"

$checks = @(
  @{ Name = 'API health'; Url = "$apiBase/health" },
  @{ Name = 'Auth me unauthorized baseline'; Url = "$apiBase/api/v1/auth/me" },
  @{ Name = 'Web home'; Url = "$webBase/" },
  @{ Name = 'Web tasks'; Url = "$webBase/tasks" },
  @{ Name = 'Web calendar'; Url = "$webBase/calendar" }
)

foreach ($check in $checks) {
  if ($DryRun) {
    Write-Host "[smoke] dry-run: $($check.Name) -> $($check.Url)"
    continue
  }

  $response = Invoke-WebRequest -UseBasicParsing -Uri $check.Url -Method GET
  Write-Host "[smoke] $($check.Name): HTTP $($response.StatusCode)"
}

Write-Host '[smoke] mobile critical-path checklist:'
Write-Host '- open app on physical phone build'
Write-Host '- verify auth/onboarding entry'
Write-Host '- verify tasks screen render'
Write-Host '- verify calendar conflict queue render'
Write-Host '- verify manual force sync controls in modal/settings'

Write-Host '[smoke] completed.'
