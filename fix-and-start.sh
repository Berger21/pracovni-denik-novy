#!/bin/bash

# 🚀 Oprava ESLint chyb a spuštění aplikace

set -e

echo "🚀 Opravuji ESLint chyby a spouštím aplikaci..."

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

cd "$APP_DIR" || {
    print_error "Nelze přejít do adresáře $APP_DIR"
    exit 1
}

print_info "Zastavuji běžící aplikaci..."
pm2 stop $APP_NAME 2>/dev/null || echo "Aplikace nebyla spuštěna"
pm2 delete $APP_NAME 2>/dev/null || echo "Aplikace nebyla v PM2"

print_info "Čistím předchozí build..."
rm -rf .next 2>/dev/null || echo "Žádný předchozí build"

print_info "Instaluji/aktualizuji závislosti..."
npm install

print_info "Spouštím build s opravami..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build úspěšný!"
    
    print_info "Spouštím aplikaci přes PM2..."
    pm2 start ecosystem.config.json
    
    print_info "Ukládám PM2 konfiguraci..."
    pm2 save
    
    print_success "Aplikace spuštěna!"
    
    echo ""
    echo "📊 Status aplikace:"
    pm2 status
    
    echo ""
    echo "🌐 Testování dostupnosti:"
    sleep 5
    
    if curl -s -f http://localhost:3000 > /dev/null; then
        print_success "Aplikace odpovídá na portu 3000!"
        print_success "Dostupná na: http://192.168.1.251:3000"
    else
        print_warning "Aplikace zatím neodpovídá, zkuste za chvíli..."
        print_info "Zkontrolujte logy: pm2 logs $APP_NAME"
    fi
    
    echo ""
    echo "🔧 Užitečné příkazy:"
    echo "  pm2 logs $APP_NAME     - Zobrazit logy"
    echo "  pm2 status             - Stav aplikace"
    echo "  pm2 restart $APP_NAME  - Restart aplikace"
    
else
    print_error "Build selhal!"
    echo "Zkontrolujte chyby výše a opravte je."
    exit 1
fi
