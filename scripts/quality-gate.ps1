param(
    [switch]$AcknowledgeManualChecks
)

$ErrorActionPreference = "Stop"

function Run-Command {
    param(
        [string]$Command,
        [string]$WorkingDirectory
    )

    Push-Location $WorkingDirectory
    try {
        Write-Host ">> [$WorkingDirectory] $Command"
        Invoke-Expression $Command
    }
    finally {
        Pop-Location
    }
}

Write-Host "== Nest Quality Gate =="

$changedUnstaged = ((git diff --name-only) -split "`r?`n")
$changedStaged = ((git diff --name-only --cached) -split "`r?`n")
$changedUntracked = ((git ls-files --others --exclude-standard) -split "`r?`n")
$changedCombined = @($changedUnstaged + $changedStaged + $changedUntracked | Sort-Object -Unique | Where-Object { $_ -ne "" })

if ($changedCombined.Count -eq 0) {
    Write-Host "No local changes detected. Nothing to validate."
    exit 0
}

Write-Host "Changed files:"
$changedCombined | ForEach-Object { Write-Host " - $_" }

Write-Host ""
Write-Host "Manual checklist (required):"
Write-Host " 1. Critical behavior regression verified for changed features"
Write-Host " 2. UI regression verified for desktop/mobile where applicable"
Write-Host " 3. Diff reviewed for unintended file changes"

if (-not $AcknowledgeManualChecks) {
    throw "Manual checklist not acknowledged. Re-run with -AcknowledgeManualChecks after verification."
}

$touchesApi = $changedCombined | Where-Object { $_ -like "apps/api/*" }
$touchesWeb = $changedCombined | Where-Object { $_ -like "apps/web/*" }
$touchesMobile = $changedCombined | Where-Object { $_ -like "apps/mobile/*" }

if ($touchesApi) {
    Run-Command -Command "php vendor/bin/pint --test" -WorkingDirectory "apps/api"
    Run-Command -Command "php artisan test" -WorkingDirectory "apps/api"
}

if ($touchesWeb) {
    Run-Command -Command "pnpm lint" -WorkingDirectory "apps/web"
    Run-Command -Command "pnpm build" -WorkingDirectory "apps/web"
}

if ($touchesMobile) {
    Run-Command -Command "pnpm test:unit" -WorkingDirectory "apps/mobile"
    Run-Command -Command "pnpm test:smoke" -WorkingDirectory "apps/mobile"
}

Write-Host ""
Write-Host "Quality gate PASSED."
