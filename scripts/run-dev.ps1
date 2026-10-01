$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$nodeCommand=Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) { $nodeExe=$nodeCommand.Source } else {
  $nodeExe=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
  if (!(Test-Path -LiteralPath $nodeExe)) { throw 'Can cai Node.js de bien dich giao dien React.' }
}
& $nodeExe 'scripts/dev.mjs'
exit $LASTEXITCODE

