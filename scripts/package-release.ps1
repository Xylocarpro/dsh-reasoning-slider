$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$metadata = Get-Content -LiteralPath (Join-Path $project 'package.json') -Raw | ConvertFrom-Json
$releaseName = "$($metadata.name)-$($metadata.version)"
$dist = Join-Path $project 'dist'
$releaseDirectory = Join-Path $project 'releases'
New-Item -ItemType Directory -Path $dist, $releaseDirectory -Force | Out-Null

Push-Location $project
try {
  & npm pack --pack-destination dist
  if ($LASTEXITCODE -ne 0) { throw 'Build or npm pack failed.' }
} finally { Pop-Location }

# An explicit list keeps local profiles and historical builds out of releases.
$files = @('.gitignore', 'README.md', 'LICENSE', 'CONTRIBUTING.md', 'CHANGELOG.md',
  'package.json', 'package-lock.json', 'cordis.patch.yml', "dist/$releaseName.tgz")
foreach ($directory in @('src', 'lib', 'scripts', 'tests', 'docs')) {
  $files += Get-ChildItem -LiteralPath (Join-Path $project $directory) -File -Recurse |
    ForEach-Object { $_.FullName.Substring($project.Length + 1).Replace('\', '/') }
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = Join-Path $releaseDirectory "$releaseName.zip"
$stream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in ($files | Sort-Object -Unique)) {
    $source = Join-Path $project $file
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing release file: $file" }
    $entryName = "$($metadata.name)/$($file.Replace('\', '/'))"
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $archive, $source, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $archive.Dispose(); $stream.Dispose() }

$hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
[System.IO.File]::WriteAllText("$zipPath.sha256", "$hash  $releaseName.zip`n", [System.Text.UTF8Encoding]::new($false))
Write-Host "Release ZIP: $zipPath"
Write-Host "SHA256: $hash"
