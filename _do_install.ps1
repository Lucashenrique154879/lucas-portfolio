$ErrorActionPreference = "Continue"
Write-Host ">>> Running pnpm install (non-interactive)..." -ForegroundColor Cyan
& ".\node_modules\.bin\pnpm.CMD" install --shamefully-hoist --config.confirmModulesPurge=false
$code = $LASTEXITCODE
Write-Host ">>> Exit code: $code" -ForegroundColor $(if ($code -eq 0) { "Green" } else { "Red" })
exit $code
