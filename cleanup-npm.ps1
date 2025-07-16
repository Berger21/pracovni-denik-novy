# 🧹 Vyčištění a reinstalace npm modulů

Write-Host "🧹 Čistím npm cache a reinstaluji moduly..." -ForegroundColor Blue

Write-Host "ℹ️  Odstraňuji node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

Write-Host "ℹ️  Odstraňuji .next..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}

Write-Host "ℹ️  Odstraňuji package-lock.json..." -ForegroundColor Cyan
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "ℹ️  Čistím npm cache..." -ForegroundColor Cyan
npm cache clean --force

Write-Host "ℹ️  Reinstaluji dependencies..." -ForegroundColor Cyan
npm install --prefer-offline --no-audit

Write-Host "✅ Reinstalace dokončena!" -ForegroundColor Green

Write-Host ""
Write-Host "ℹ️  Nyní můžete spustit:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Yellow
