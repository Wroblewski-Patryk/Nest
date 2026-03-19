param(
    [string]$ApiBaseUrl = "http://127.0.0.1:9000/api/v1",
    [string]$ApiToken = "",
    [string]$ListId = "",
    [string]$Duration = "2m",
    [switch]$EnableWrites
)

$scriptPath = "apps/api/tests/Performance/k6-load-harness.js"

if (-not (Get-Command k6 -ErrorAction SilentlyContinue)) {
    Write-Error "k6 is not installed. Install k6 and retry."
    exit 1
}

$env:API_BASE_URL = $ApiBaseUrl
$env:API_TOKEN = $ApiToken
$env:LIST_ID = $ListId
$env:DURATION = $Duration
$env:ENABLE_WRITES = if ($EnableWrites.IsPresent) { "1" } else { "0" }

Write-Host "Running k6 load harness..."
Write-Host "API_BASE_URL=$ApiBaseUrl"
Write-Host "DURATION=$Duration"
Write-Host "ENABLE_WRITES=$($env:ENABLE_WRITES)"

k6 run $scriptPath --summary-export "apps/api/tests/Performance/k6-summary.json"
