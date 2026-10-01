$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$gymNode = Get-Command node -ErrorAction SilentlyContinue
$gymNodePath = if ($gymNode) { $gymNode.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $gymNodePath)) { throw 'Can Node.js 22.18+ hoac 24. Cai Node, mo lai VS Code.' }
$env:PATH = (Split-Path -Parent $gymNodePath) + ';' + $env:PATH
if (-not (Test-Path -LiteralPath 'node_modules/mysql2')) { throw 'Chay pnpm install truoc.' }
if (-not (Test-Path -LiteralPath 'backend/.env')) { Copy-Item -LiteralPath 'backend/.env.example' -Destination 'backend/.env'; throw 'Dien DB_USER va DB_PASSWORD trong backend/.env, sau do chay pnpm db:setup.' }
& $gymNodePath tools/scripts/dev.mjs
