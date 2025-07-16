#!/bin/bash

# 🔧 Rychlá oprava a build aplikace

set -e

echo "🔧 Rychlá oprava a build aplikace..."

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

print_info "Zastavuji PM2 aplikaci..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

print_info "Čistím build..."
rm -rf .next

print_info "Spouštím build..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build úspěšný!"
    
    print_info "Spouštím aplikaci..."
    pm2 start ecosystem.config.json
    pm2 save
    
    print_success "Aplikace spuštěna!"
    
    echo ""
    print_info "Čekám 8 sekund na start aplikace..."
    sleep 8
    
    echo ""
    echo "🌐 Testování dostupnosti:"
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "✅ Aplikace běží! Dostupná na: http://192.168.1.251:3000"
    else
        echo "⚠️  Aplikace zatím neodpovídá, zkontrolujte logy:"
        pm2 logs $APP_NAME --lines 10
    fi
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
else
    print_error "Build selhal!"
    exit 1
fi
