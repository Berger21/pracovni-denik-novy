#!/bin/bash

# 🌐 Konfigurace Nginx pro port 80

set -e

echo "🌐 Konfiguruji Nginx pro port 80..."

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
SERVER_IP=$(hostname -I | awk '{print $1}')

print_info "Instaluji Nginx (pokud není nainstalován)..."
sudo apt update
sudo apt install nginx -y

print_info "Vytvářím Nginx konfiguraci..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $SERVER_IP localhost;
    
    # Gzip komprese pro rychlejší načítání
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Proxy všech požadavků na Node.js aplikaci
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        
        # Časové limity
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    # Optimalizace pro statické soubory Next.js
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # Favicon a další statické soubory
    location ~* \.(ico|css|js|gif|jpe?g|png|svg|woff2?|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Bezpečnostní hlavičky
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Skrytí Nginx verze
    server_tokens off;
    
    # Logování
    access_log /var/log/nginx/pracovni-denik-access.log;
    error_log /var/log/nginx/pracovni-denik-error.log;
}
EOF

print_success "Nginx konfigurace vytvořena!"

print_info "Aktivuji konfiguraci..."
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

print_info "Deaktivuji výchozí Nginx stránku..."
sudo rm -f /etc/nginx/sites-enabled/default

print_info "Testuji Nginx konfiguraci..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_success "Nginx konfigurace je v pořádku!"
    
    print_info "Restartuji Nginx..."
    sudo systemctl restart nginx
    
    print_info "Povolím Nginx při startu systému..."
    sudo systemctl enable nginx
    
    print_success "Nginx je nakonfigurován a spuštěn!"
    
    echo ""
    print_info "Kontroluji firewall..."
    sudo ufw allow 'Nginx Full' 2>/dev/null || echo "UFW není aktivní"
    
    echo ""
    print_info "Čekám 3 sekundy a testuji..."
    sleep 3
    
    echo ""
    echo "🌐 Testování dostupnosti:"
    
    # Test port 80
    if curl -s -f http://localhost:80 > /dev/null 2>&1; then
        print_success "✅ Port 80 funguje!"
    else
        print_warning "⚠️  Port 80 zatím neodpovídá"
    fi
    
    # Test s IP adresou
    if curl -s -f http://$SERVER_IP > /dev/null 2>&1; then
        print_success "✅ IP adresa funguje!"
    else
        print_warning "⚠️  IP adresa zatím neodpovídá"
    fi
    
    echo ""
    echo "🎉 HOTOVO! Aplikace je dostupná na:"
    echo "   👉 http://$SERVER_IP"
    echo "   👉 http://localhost (na serveru)"
    echo ""
    echo "🔧 Další informace:"
    echo "   - Nginx konfigurace: /etc/nginx/sites-available/$APP_NAME"
    echo "   - Nginx logy: /var/log/nginx/pracovni-denik-*.log"
    echo "   - Node.js aplikace stále běží na portu 3000"
    echo "   - Nginx přeposílá požadavky z portu 80 na port 3000"
    
else
    print_error "❌ Chyba v Nginx konfiguraci!"
    echo "Zkontrolujte chyby výše a opravte je."
    exit 1
fi

echo ""
echo "📊 Status služeb:"
echo "Nginx:"
sudo systemctl status nginx --no-pager -l | head -5
echo ""
echo "PM2:"
pm2 status
