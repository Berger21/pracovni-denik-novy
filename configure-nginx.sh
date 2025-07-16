#!/bin/bash

# 🌐 Skript pro konfiguraci Nginx pro Pracovní deník

set -e

echo "🌐 Konfiguruji Nginx pro Pracovní deník..."

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
NGINX_CONFIG="/etc/nginx/sites-available/${APP_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"

print_info "Vytvářím Nginx konfiguraci..."

# Vytvoření Nginx konfigurace
sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name localhost $(hostname -I | awk '{print $1}');
    
    # Gzip komprese
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
    }
    
    # Statické soubory
    location /_next/static {
        alias /var/www/pracovni-denik/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # Favicon a další statické soubory
    location ~* \.(ico|css|js|gif|jpe?g|png|svg|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri @proxy;
    }
    
    location @proxy {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
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

print_success "Nginx konfigurace vytvořena: $NGINX_CONFIG"

print_info "Aktivuji konfiguraci..."
sudo ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"

print_info "Testuji Nginx konfiguraci..."
sudo nginx -t

print_info "Odstraňuji výchozí Nginx konfiguraci..."
sudo rm -f /etc/nginx/sites-enabled/default

print_info "Restartuji Nginx..."
sudo systemctl restart nginx

print_success "Nginx je nakonfigurován!"

echo ""
echo "📊 Status Nginx:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "🌐 Testování:"
sleep 2
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:80 || echo "Nedostupné"

print_success "Aplikace by měla být dostupná na: http://$(hostname -I | awk '{print $1}')"
