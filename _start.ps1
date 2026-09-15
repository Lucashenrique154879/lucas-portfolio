$ErrorActionPreference = "Continue"
$env:NODE_ENV = "development"
Write-Host "Starting Vite dev server..."
& "node" "node_modules/vite/bin/vite.js" "--host"
