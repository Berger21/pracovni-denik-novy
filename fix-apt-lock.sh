#!/bin/bash

# 🔧 Řešení problému s apt lock

echo "🔧 Řeším problém s apt lock..."

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

print_info "Kontroluji běžící apt procesy..."
ps aux | grep -i apt | grep -v grep || echo "Žádné apt procesy nenalezeny"

print_info "Čekám 30 sekund na dokončení apt procesů..."
sleep 30

print_info "Pokud stále běží, zkusím ukončit procesy..."
sudo pkill -f apt 2>/dev/null || echo "Žádné apt procesy k ukončení"
sudo pkill -f dpkg 2>/dev/null || echo "Žádné dpkg procesy k ukončení"

print_info "Čekám dalších 10 sekund..."
sleep 10

print_info "Odstraňuji lock soubory..."
sudo rm -f /var/lib/dpkg/lock-frontend 2>/dev/null || echo "Lock soubor neexistuje"
sudo rm -f /var/lib/dpkg/lock 2>/dev/null || echo "Lock soubor neexistuje"
sudo rm -f /var/cache/apt/archives/lock 2>/dev/null || echo "Lock soubor neexistuje"

print_info "Reconfiguruji dpkg..."
sudo dpkg --configure -a

print_info "Zkouším apt update..."
sudo apt update

print_success "Apt lock vyřešen!"

echo ""
print_info "Nyní můžete spustit:"
echo "  ./setup-nginx-port80.sh"
