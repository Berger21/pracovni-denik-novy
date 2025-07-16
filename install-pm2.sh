#!/bin/bash

# 🔧 Instalace PM2 a spuštění aplikace

set -e

echo "🔧 Instaluji PM2 a spouštím aplikaci..."

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

APP_NAME="pracovni-denik"
APP_DIR="/var/www/${APP_NAME}"

print_info "Instaluji PM2 globálně..."
sudo npm install -g pm2

print_info "Ověřuji instalaci PM2..."
pm2 --version

print_info "Přecházím do adresáře aplikace..."
cd "$APP_DIR"

print_info "Kontroluji závislosti..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules neexistuje, instaluji závislosti..."
    npm install
else
    print_success "node_modules existuje"
fi

print_info "Kontroluji build..."
if [ ! -d ".next" ]; then
    print_warning ".next neexistuje, buildím aplikaci..."
    npm run build
else
    print_success ".next existuje"
fi

print_info "Spouštím aplikaci přes PM2..."
pm2 start ecosystem.config.json

print_info "Ukládám PM2 konfiguraci..."
pm2 save

print_info "Nastavuji PM2 pro automatické spuštění..."
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))

print_success "PM2 je nainstalován a aplikace spuštěna!"

echo ""
echo "📊 Status aplikace:"
pm2 status

echo ""
echo "🌐 Testování dostupnosti:"
sleep 3
curl -s -o /dev/null -w "Port 3000 - HTTP Status: %{http_code}\n" http://localhost:3000 || echo "Port 3000 - Nedostupné"

echo ""
print_success "Aplikace by nyní měla být dostupná na: http://192.168.1.251:3000"

echo ""
echo "🔧 Užitečné příkazy pro PM2:"
echo "  pm2 status          - Zobrazit stav aplikací"
echo "  pm2 logs $APP_NAME  - Zobrazit logy aplikace"
echo "  pm2 restart $APP_NAME - Restartovat aplikaci"
echo "  pm2 stop $APP_NAME  - Zastavit aplikaci"
echo "  pm2 delete $APP_NAME - Smazat aplikaci"
