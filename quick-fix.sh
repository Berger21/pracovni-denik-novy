#!/bin/bash

# 🔍 Rychlá diagnostika problému s portem 3000

echo "🔍 Diagnostika problému s portem 3000..."

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

APP_NAME="pracovni-denik"
APP_DIR="/var/www/${APP_NAME}"

echo ""
echo "========================================="
echo "KONTROLA ZÁKLADNÍCH VĚCÍ"
echo "========================================="

# Kontrola adresáře
if [ -d "$APP_DIR" ]; then
    print_success "Adresář aplikace existuje: $APP_DIR"
    cd "$APP_DIR"
else
    print_error "Adresář aplikace NEEXISTUJE: $APP_DIR"
    exit 1
fi

# Kontrola Node.js
if command -v node &> /dev/null; then
    print_success "Node.js je nainstalován: $(node --version)"
else
    print_error "Node.js NENÍ nainstalován!"
    exit 1
fi

# Kontrola PM2
if command -v pm2 &> /dev/null; then
    print_success "PM2 je nainstalován: $(pm2 --version)"
else
    print_error "PM2 NENÍ nainstalován!"
    exit 1
fi

echo ""
echo "========================================="
echo "KONTROLA APLIKACE"
echo "========================================="

# Kontrola souborů
if [ -f "package.json" ]; then
    print_success "package.json existuje"
else
    print_error "package.json NEEXISTUJE"
    exit 1
fi

if [ -f "ecosystem.config.json" ]; then
    print_success "ecosystem.config.json existuje"
else
    print_error "ecosystem.config.json NEEXISTUJE"
    exit 1
fi

if [ -d "node_modules" ]; then
    print_success "node_modules existuje"
else
    print_error "node_modules NEEXISTUJE - spouštím npm install..."
    npm install
fi

if [ -d ".next" ]; then
    print_success "Build adresář .next existuje"
else
    print_error "Build adresář .next NEEXISTUJE - spouštím npm run build..."
    npm run build
fi

echo ""
echo "========================================="
echo "KONTROLA PROCESŮ A PORTŮ"
echo "========================================="

# Kontrola PM2 procesů
echo "PM2 procesy:"
pm2 list

echo ""
echo "Procesy na portu 3000:"
sudo netstat -tlnp | grep :3000 || echo "Žádné procesy na portu 3000"

echo ""
echo "Všechny Node.js procesy:"
ps aux | grep node | grep -v grep || echo "Žádné Node.js procesy"

echo ""
echo "========================================="
echo "TESTOVÁNÍ DOSTUPNOSTI"
echo "========================================="

# Test lokálního portu 3000
echo "Test localhost:3000:"
curl -v -m 5 http://localhost:3000 2>&1 | head -20 || echo "Nedostupné"

echo ""
echo "Test 192.168.1.251:3000:"
curl -v -m 5 http://192.168.1.251:3000 2>&1 | head -20 || echo "Nedostupné"

echo ""
echo "========================================="
echo "OPRAVA PROBLÉMU"
echo "========================================="

print_info "Zastavuji všechny PM2 procesy..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

print_info "Ukončuji všechny Node.js procesy na portu 3000..."
sudo pkill -f "node.*3000" 2>/dev/null || true

print_info "Čekám 3 sekundy..."
sleep 3

print_info "Spouštím aplikaci znovu..."
pm2 start ecosystem.config.json

print_info "Ukládám PM2 konfiguraci..."
pm2 save

print_info "Čekám 5 sekund na spuštění..."
sleep 5

echo ""
echo "========================================="
echo "VÝSLEDEK"
echo "========================================="

echo "Nový status PM2:"
pm2 status

echo ""
echo "Test připojení po opravě:"
curl -s -o /dev/null -w "localhost:3000 - HTTP Status: %{http_code}\n" http://localhost:3000 || echo "localhost:3000 - Stále nedostupné"

echo ""
echo "Procesy na portu 3000 po opravě:"
sudo netstat -tlnp | grep :3000 || echo "Žádné procesy na portu 3000"

echo ""
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    print_success "Aplikace nyní běží na: http://192.168.1.251:3000"
else
    print_error "Aplikace stále neběží - zkuste spustit: ./fix-app.sh"
fi

echo ""
echo "Pro zobrazení logů použijte: pm2 logs $APP_NAME"
