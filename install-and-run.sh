#!/bin/bash

# 🚀 Instalace a spuštění aplikace Pracovní deník

echo "🔧 Instalace a spuštění aplikace..."

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

# Přejít do adresáře projektu
cd /var/www/pracovni-denik

print_info "Aktuální adresář: $(pwd)"

# Zkontrolovat, zda existuje node_modules
if [ -d "node_modules" ]; then
    print_warning "node_modules existuje, mažu..."
    rm -rf node_modules
    print_success "node_modules smazán"
fi

# Smazat package-lock.json pokud existuje
if [ -f "package-lock.json" ]; then
    print_warning "package-lock.json existuje, mažu..."
    rm -f package-lock.json
    print_success "package-lock.json smazán"
fi

# Smazat .next pokud existuje
if [ -d ".next" ]; then
    print_warning ".next existuje, mažu..."
    rm -rf .next
    print_success ".next smazán"
fi

# Vyčistit npm cache
print_info "Čistím npm cache..."
npm cache clean --force

# Zkontrolovat Node.js verzi
print_info "Node.js verze: $(node --version)"
print_info "npm verze: $(npm --version)"

# Nainstalovat závislosti
print_info "Instaluji závislosti..."
npm install

if [ $? -eq 0 ]; then
    print_success "Závislosti úspěšně nainstalovány!"
else
    print_error "Chyba při instalaci závislostí!"
    exit 1
fi

# Spustit aplikaci
print_info "Spouštím aplikaci..."
print_info "Aplikace bude dostupná na: http://192.168.1.251:3000"

# Spustit v produkčním režimu
npm run build
if [ $? -eq 0 ]; then
    print_success "Build úspěšný!"
    npm run start
else
    print_error "Build selhal! Spouštím dev režim..."
    npm run dev
fi
