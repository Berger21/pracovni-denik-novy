#!/bin/bash

# 🔧 Skript pro opravu běžných problémů s Pracovní deník na Ubuntu

set -e

echo "🔧 Opravuji běžné problémy s aplikací Pracovní deník..."

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

# Kontrola, zda běží jako root
if [[ $EUID -eq 0 ]]; then
   print_error "Nespouštějte tento skript jako root!"
   exit 1
fi

print_info "Přecházím do adresáře aplikace..."
cd "$APP_DIR" || {
    print_error "Adresář aplikace $APP_DIR neexistuje!"
    exit 1
}

print_info "Zastavuji běžící aplikaci..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

print_info "Čistím cache..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true

print_info "Reinstalace závislostí..."
rm -rf node_modules 2>/dev/null || true
npm cache clean --force
npm install

print_info "Buildím aplikaci..."
npm run build

print_info "Spouštím aplikaci..."
pm2 start ecosystem.config.json

print_info "Ukládám PM2 konfiguraci..."
pm2 save

print_info "Nastavuji PM2 startup..."
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))

print_info "Restartuji Nginx..."
sudo systemctl restart nginx

print_success "Oprava dokončena!"

echo ""
echo "📊 Status aplikace:"
pm2 status

echo ""
echo "🌐 Testování dostupnosti:"
sleep 3
curl -s -o /dev/null -w "Localhost:3000 - HTTP Status: %{http_code}\n" http://localhost:3000 || echo "Localhost:3000 - Nedostupné"
curl -s -o /dev/null -w "Localhost:80 - HTTP Status: %{http_code}\n" http://localhost:80 || echo "Localhost:80 - Nedostupné"

print_success "Aplikace by nyní měla běžet na: http://$(hostname -I | awk '{print $1}')"
