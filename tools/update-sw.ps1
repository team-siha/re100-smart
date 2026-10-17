# 배포 전에 실행: sw.js 의 저장 목록(PRECACHE)과 버전(CACHE)을 자동으로 새로 써요.
# 사용법 (프로젝트 폴더에서):  powershell -File tools\update-sw.ps1
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$files = @("./") +
  (Get-ChildItem -File *.html, manifest.json | ForEach-Object { $_.Name }) +
  (Get-ChildItem -Recurse -File css, js, images | ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace("\", "/") })
$list = ($files | Sort-Object -Unique | ForEach-Object { '  "' + $_ + '",' }) -join "`n"
$version = "re100-" + (Get-Date -Format "yyyyMMdd-HHmmss")

$sw = [IO.File]::ReadAllText("$root\sw.js")
$sw = [regex]::Replace($sw, 'const CACHE = "[^"]*";', 'const CACHE = "' + $version + '";')
$sw = [regex]::Replace($sw, '(?s)const PRECACHE = \[.*?\n\];', "const PRECACHE = [`n$list`n];")
[IO.File]::WriteAllText("$root\sw.js", $sw, (New-Object Text.UTF8Encoding $false))
"sw.js 업데이트: $version (파일 $($files.Count)개)"
