param(
  [Parameter(Mandatory = $true)]
  [string]$InstallDirectory,
  [string]$Profile = 'desktop'
)
$ErrorActionPreference = 'Stop'
$cli = Join-Path $InstallDirectory 'resources\runtime\cli\bin\dsh.cmd'
$project = Split-Path $PSScriptRoot -Parent
$version = (Get-Content -LiteralPath (Join-Path $project 'package.json') -Raw | ConvertFrom-Json).version
$bundle = Join-Path $project "dist\dsh-reasoning-slider-$version.tgz"
if (-not (Test-Path -LiteralPath $cli -PathType Leaf)) { throw "Harness CLI not found: $cli" }
if (-not (Test-Path -LiteralPath $bundle -PathType Leaf)) { throw "Build and pack the plugin first: $bundle" }
& $cli plugin --profile $Profile add $bundle
if ($LASTEXITCODE -ne 0) { throw "Harness plugin installation failed ($LASTEXITCODE)." }
Write-Host 'Plugin installed. Restart DeepSeek Harness to load the new UI.'
