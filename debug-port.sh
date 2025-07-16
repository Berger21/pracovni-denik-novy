#!/bin/bash

# 🔍 Detailní diagnostika portu 3000

set -e

echo "🔍 Detailní diagnostika portu 3000..."

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

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

APP_NAME="pracovni-denik"
APP_DIR="/var/www/${APP_NAME}"

print_header "KONTROLA PM2 STAVU"
if command -v pm2 &> /dev/null; then
    echo "PM2 je nainstalováno: $(pm2 --version)"
    echo ""
    echo "Seznam PM2 procesů:"
    pm2 list
    echo ""
    echo "Detailní informace o aplikaci:"
    pm2 show $APP_NAME 2>/dev/null || print_warning "Aplikace $APP_NAME není v PM2"
else
    print_error "PM2 NENÍ nainstalováno!"
fi

print_header "KONTROLA PORTŮ - DETAILNÍ"
echo "Všechny naslouchající porty:"
ss -tlnp | grep -v "127.0.0.1\|::1" | head -20

echo ""
echo "Specificky port 3000:"
ss -tlnp | grep :3000 || echo "Port 3000 není obsazen"

echo ""
echo "Všechny Node.js procesy:"
ps aux | grep node | grep -v grep || echo "Žádné Node.js procesy"

print_header "KONTROLA SÍŤOVÉ DOSTUPNOSTI"
echo "Test localhost:3000:"
curl -v http://localhost:3000 2>&1 | head -20 || echo "Spojení selhalo"

echo ""
echo "Test 0.0.0.0:3000:"
curl -v http://0.0.0.0:3000 2>&1 | head -20 || echo "Spojení selhalo"

echo ""
echo "Test 192.168.1.251:3000:"
curl -v http://192.168.1.251:3000 2>&1 | head -20 || echo "Spojení selhalo"

print_header "KONTROLA FIREWALL"
echo "UFW status:"
sudo ufw status verbose || echo "UFW není aktivní"

echo ""
echo "iptables pravidla:"
sudo iptables -L -n | head -20 || echo "Nelze načíst iptables"

print_header "KONTROLA APLIKACE"
cd "$APP_DIR" || {
    print_error "Nelze přejít do $APP_DIR"
    exit 1
}

echo "Obsah package.json - scripts:"
cat package.json | grep -A 10 '"scripts"' || echo "Nelze načíst scripts"

echo ""
echo "Kontrola Next.js konfigurace:"
if [ -f "next.config.ts" ]; then
    echo "next.config.ts existuje:"
    cat next.config.ts
elif [ -f "next.config.js" ]; then
    echo "next.config.js existuje:"
    cat next.config.js
else
    echo "Žádná Next.js konfigurace nenalezena"
fi

print_header "MANUÁLNÍ SPUŠTĚNÍ APLIKACE"
echo "Pokusím se spustit aplikaci manuálně..."

# Zastavit PM2 aplikaci
pm2 stop $APP_NAME 2>/dev/null || echo "PM2 aplikace nebyla spuštěna"
pm2 delete $APP_NAME 2>/dev/null || echo "PM2 aplikace nebyla v seznamu"

# Zkusit spustit přímo
echo ""
echo "Spouštím 'npm start' na pozadí..."
timeout 10s npm start &
NPM_PID=$!

sleep 5

echo "Testování po 5 sekundách:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}" http://localhost:3000 || echo "Stále nedostupné"

# Ukončit npm start
kill $NPM_PID 2>/dev/null || echo "NPM proces již není aktivní"

print_header "ZKOUŠKA S JINÝMI HOSTY"
echo "Zkouším spustit s explicitním hostem..."

# Spustit s explicitním hostem
echo "Spouštím 'npm run dev' na pozadí..."
timeout 10s npm run dev &
DEV_PID=$!

sleep 5

echo "Testování dev serveru:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}" http://localhost:3000 || echo "Dev server nedostupný"

# Ukončit dev server
kill $DEV_PID 2>/dev/null || echo "Dev server již není aktivní"

print_header "DOPORUČENÍ"
echo "Pro vyřešení problému zkuste:"
echo "1. Spusťte aplikaci manuálně: cd $APP_DIR && npm start"
echo "2. Zkontrolujte logy: pm2 logs $APP_NAME"
echo "3. Zkuste dev server: npm run dev"
echo "4. Zkontrolujte, zda Next.js správně naslouchá na 0.0.0.0:3000"
echo "5. Zkontrolujte firewall pravidla"

print_success "Diagnostika dokončena!"
