#!/bin/bash

# 🔧 Finální build a spuštění aplikace

set -e

echo "🔧 Finální build a spuštění aplikace..."

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

print_info "Zastavuji běžící procesy..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

print_info "Čistím build cache..."
rm -rf .next 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

print_info "Reinstalace závislostí..."
npm install

print_info "Spouštím TypeScript a ESLint kontrolu..."
npm run lint --fix 2>/dev/null || true

print_info "Spouštím produkční build..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build úspěšný! 🎉"
    
    print_info "Spouštím aplikaci..."
    pm2 start ecosystem.config.json
    pm2 save
    
    print_success "Aplikace spuštěna!"
    
    echo ""
    print_info "Čekám 10 sekund než otestuji dostupnost..."
    sleep 10
    
    echo ""
    echo "🌐 Testování dostupnosti:"
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "✅ Aplikace úspěšně běží na portu 3000!"
        print_success "🌍 Dostupná na: http://192.168.1.251:3000"
        
        echo ""
        echo "📊 Status aplikace:"
        pm2 status
        
        echo ""
        echo "📋 Poslední logy:"
        pm2 logs $APP_NAME --lines 5
        
    else
        print_warning "⚠️  Aplikace zatím neodpovídá na portu 3000"
        print_info "Zkontrolujte logy pro více informací:"
        pm2 logs $APP_NAME --lines 10
    fi
    
    echo ""
    echo "🔧 Užitečné příkazy:"
    echo "  pm2 logs $APP_NAME        - Zobrazit logy"
    echo "  pm2 status                - Stav aplikace"
    echo "  pm2 restart $APP_NAME     - Restart aplikace"
    echo "  pm2 stop $APP_NAME        - Zastavit aplikaci"
    
else
    print_error "❌ Build selhal!"
    echo ""
    echo "Nejčastější problémy a řešení:"
    echo "1. TypeScript chyby - opravte je v kódu"
    echo "2. ESLint chyby - spusťte: npm run lint --fix"
    echo "3. Chybějící závislosti - spusťte: npm install"
    echo "4. Nedostatek paměti - restartujte server"
    
    exit 1
fi
