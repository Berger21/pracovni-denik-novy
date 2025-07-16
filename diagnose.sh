#!/bin/bash

# 🔍 Diagnostický skript pro Pracovní deník na Ubuntu Server

set -e

echo "🔍 Diagnostika aplikace Pracovní deník..."

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

print_header "ZÁKLADNÍ INFORMACE O SYSTÉMU"
echo "Datum: $(date)"
echo "Uživatel: $(whoami)"
echo "Systém: $(lsb_release -d | cut -f2)"
echo "Architektura: $(uname -m)"
echo "Uptime: $(uptime)"

print_header "VERZE NAINSTALOVANÉHO SOFTWARE"
echo "Node.js: $(node --version 2>/dev/null || echo 'NENÍ NAINSTALOVÁNO')"
echo "npm: $(npm --version 2>/dev/null || echo 'NENÍ NAINSTALOVÁNO')"
echo "PM2: $(pm2 --version 2>/dev/null || echo 'NENÍ NAINSTALOVÁNO')"
echo "Nginx: $(nginx -v 2>&1 | cut -d' ' -f3 2>/dev/null || echo 'NENÍ NAINSTALOVÁNO')"

print_header "KONTROLA ADRESÁŘŮ A SOUBORŮ"
if [ -d "$APP_DIR" ]; then
    print_success "Adresář aplikace existuje: $APP_DIR"
    echo "Obsah adresáře:"
    ls -la "$APP_DIR" | head -20
    echo ""
    
    if [ -f "$APP_DIR/package.json" ]; then
        print_success "package.json existuje"
    else
        print_error "package.json NEEXISTUJE"
    fi
    
    if [ -f "$APP_DIR/ecosystem.config.json" ]; then
        print_success "ecosystem.config.json existuje"
    else
        print_error "ecosystem.config.json NEEXISTUJE"
    fi
    
    if [ -d "$APP_DIR/.next" ]; then
        print_success "Build adresář .next existuje"
    else
        print_error "Build adresář .next NEEXISTUJE - aplikace nebyla buildována"
    fi
    
    if [ -d "$APP_DIR/node_modules" ]; then
        print_success "node_modules existuje"
    else
        print_error "node_modules NEEXISTUJE - závislosti nejsou nainstalovány"
    fi
else
    print_error "Adresář aplikace NEEXISTUJE: $APP_DIR"
fi

print_header "KONTROLA PROCESŮ"
echo "PM2 procesy:"
pm2 list 2>/dev/null || print_error "PM2 seznam procesů nedostupný"

echo ""
echo "Node.js procesy:"
ps aux | grep node | grep -v grep || echo "Žádné Node.js procesy"

echo ""
echo "Nginx procesy:"
ps aux | grep nginx | grep -v grep || echo "Žádné Nginx procesy"

print_header "KONTROLA PORTŮ"
echo "Naslouchající porty:"
ss -tlnp | grep -E ':(80|443|3000|8080)' || echo "Žádné relevantní porty"

print_header "KONTROLA SLUŽEB"
echo "Nginx status:"
systemctl status nginx --no-pager -l || print_error "Nginx není spuštěn"

echo ""
echo "Firewall (UFW) status:"
sudo ufw status || echo "UFW není nakonfigurováno"

print_header "KONTROLA LOGŮ"
echo "Poslední chyby v system logu:"
journalctl -u nginx --no-pager -l --since "1 hour ago" | tail -10 || echo "Žádné nginx logy"

echo ""
echo "PM2 logy (pokud existují):"
if [ -f "/var/log/pm2/pracovni-denik-error.log" ]; then
    echo "Chybové logy:"
    tail -10 /var/log/pm2/pracovni-denik-error.log || echo "Nelze načíst chybové logy"
else
    echo "Chybové logy neexistují"
fi

if [ -f "/var/log/pm2/pracovni-denik-out.log" ]; then
    echo "Výstupní logy:"
    tail -10 /var/log/pm2/pracovni-denik-out.log || echo "Nelze načíst výstupní logy"
else
    echo "Výstupní logy neexistují"
fi

print_header "KONTROLA NGINX KONFIGURACE"
if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
    print_success "Nginx konfigurace existuje"
    echo "Obsah konfigurace:"
    cat "/etc/nginx/sites-available/$APP_NAME"
else
    print_error "Nginx konfigurace NEEXISTUJE"
fi

if [ -L "/etc/nginx/sites-enabled/$APP_NAME" ]; then
    print_success "Nginx konfigurace je aktivní"
else
    print_error "Nginx konfigurace NENÍ aktivní"
fi

print_header "KONTROLA SÍŤOVÉ DOSTUPNOSTI"
echo "Test připojení k localhost:3000:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}" http://localhost:3000 || echo "Nedostupné"

echo ""
echo "Test připojení k localhost:80:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}" http://localhost:80 || echo "Nedostupné"

print_header "RYCHLÁ OPRAVA - POKUS O RESTART"
echo "Pokusím se restartovat aplikaci..."

if command -v pm2 &> /dev/null; then
    cd "$APP_DIR" 2>/dev/null || print_error "Nelze přejít do adresáře aplikace"
    
    echo "Zastavuji PM2 aplikaci..."
    pm2 stop $APP_NAME 2>/dev/null || echo "Aplikace nebyla spuštěna"
    
    echo "Spouštím PM2 aplikaci..."
    pm2 start ecosystem.config.json 2>/dev/null || echo "Chyba při spuštění"
    
    echo "Ukládám PM2 konfiguraci..."
    pm2 save 2>/dev/null || echo "Chyba při ukládání"
    
    echo "Nový status:"
    pm2 status
else
    print_error "PM2 není nainstalováno"
fi

print_header "DOPORUČENÍ"
echo "Na základě výše uvedených informací:"
echo "1. Zkontrolujte, zda jsou všechny závislosti nainstalovány (npm install)"
echo "2. Zkontrolujte, zda je aplikace buildována (npm run build)"
echo "3. Zkontrolujte PM2 logy pro podrobné chyby"
echo "4. Zkontrolujte Nginx konfiguraci"
echo "5. Zkontrolujte, zda jsou porty dostupné"

print_success "Diagnostika dokončena!"
