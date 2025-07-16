#!/bin/bash

# 🧹 Vyčištění a reinstalace npm modulů

echo "🧹 Čistím npm cache a reinstaluji moduly..."

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

print_info "Odstraňuji node_modules..."
rm -rf node_modules
rm -rf .next
rm -f package-lock.json

print_info "Čistím npm cache..."
npm cache clean --force

print_info "Reinstaluji dependencies..."
npm install --prefer-offline --no-audit

print_success "Reinstalace dokončena!"

echo ""
print_info "Nyní můžete spustit:"
echo "  npm run dev"
