#!/bin/bash

# 🔧 Oprava PM2 logů a spuštění aplikace

set -e

echo "🔧 Opravuji PM2 logy a spouštím aplikaci..."

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

cd "$APP_DIR" || {
    print_error "Nelze přejít do adresáře $APP_DIR"
    exit 1
}

print_info "Vytvářím PM2 log adresář..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

print_info "Zastavuji PM2 aplikaci..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

print_info "Spouštím aplikaci..."
pm2 start ecosystem.config.json

print_info "Ukládám PM2 konfiguraci..."
pm2 save

print_info "Nastavuji PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME

print_success "Aplikace spuštěna!"

echo ""
print_info "Čekám 8 sekund na start aplikace..."
sleep 8

echo ""
echo "🌐 Testování dostupnosti:"
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "✅ Aplikace běží! Dostupná na: http://192.168.1.251:3000"
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
    echo ""
    echo "🔧 Užitečné příkazy:"
    echo "  pm2 logs $APP_NAME        - Zobrazit logy"
    echo "  pm2 restart $APP_NAME     - Restart aplikace"
    echo "  pm2 stop $APP_NAME        - Zastavit aplikaci"
    
else
    print_error "Aplikace zatím neodpovídá"
    echo "Zkontrolujte logy:"
    pm2 logs $APP_NAME --lines 10
fi
