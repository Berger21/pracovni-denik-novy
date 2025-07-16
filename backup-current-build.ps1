# Skript pro zálohování aktuálního buildu Next.js
# Vytvoří složku s časovým razítkem a zkopíruje do ní .next, package.json, public, src

$datum = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup_build_$datum"
New-Item -ItemType Directory -Path $backupDir | Out-Null

# Zálohuj složku .next
if (Test-Path .next) {
    Copy-Item .next $backupDir -Recurse
}
# Zálohuj package.json
if (Test-Path package.json) {
    Copy-Item package.json $backupDir
}
# Zálohuj public
if (Test-Path public) {
    Copy-Item public $backupDir -Recurse
}
# Zálohuj src
if (Test-Path src) {
    Copy-Item src $backupDir -Recurse
}

Write-Host "Záloha buildu byla vytvořena ve složce $backupDir"
