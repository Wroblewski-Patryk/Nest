param(
  [string]$OutputPath = "artifacts/offline-chaos-regression.json"
)

$ErrorActionPreference = "Stop"

Write-Host "[offline-chaos] running suite"
node scripts/testing/offline-chaos-regression.mjs --out $OutputPath
Write-Host "[offline-chaos] completed"
