#!/bin/bash

# 🔧 Diagnostika a oprava Nginx problému

echo "🔧 Diagnostika a oprava Nginx problému..."

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

print_info "Kontroluji status Nginx..."
sudo systemctl status nginx.service --no-pager -l

echo ""
print_info "Kontroluji logy Nginx..."
sudo journalctl -xeu nginx.service --no-pager -l | tail -20

echo ""
print_info "Kontroluji, co běží na portu 80..."
sudo ss -tlnp | grep :80 || echo "Port 80 je volný"

echo ""
print_info "Kontroluji Nginx procesy..."
ps aux | grep nginx | grep -v grep || echo "Žádné nginx procesy"

echo ""
print_info "Zkouším zastavit všechny nginx procesy..."
sudo pkill -f nginx 2>/dev/null || echo "Žádné nginx procesy k ukončení"

echo ""
print_info "Testuji Nginx konfiguraci znovu..."
sudo nginx -t

echo ""
print_info "Zkouším spustit Nginx..."
sudo systemctl start nginx

if [ $? -eq 0 ]; then
    print_success "Nginx úspěšně spuštěn!"
    
    echo ""
    print_info "Povolím Nginx při startu..."
    sudo systemctl enable nginx
    
    echo ""
    print_info "Testování dostupnosti..."
    sleep 2
    
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    if curl -s -f http://localhost:80 > /dev/null 2>&1; then
        print_success "✅ Port 80 funguje lokálně!"
    else
        print_warning "⚠️  Port 80 neodpovídá lokálně"
    fi
    
    if curl -s -f http://$SERVER_IP > /dev/null 2>&1; then
        print_success "✅ IP adresa funguje: http://$SERVER_IP"
    else
        print_warning "⚠️  IP adresa neodpovídá: http://$SERVER_IP"
    fi
    
    echo ""
    print_success "🎉 Nginx je nyní spuštěn!"
    echo "Aplikace je dostupná na: http://$SERVER_IP"
    
else
    print_error "❌ Nginx se nepodařilo spustit"
    
    echo ""
    print_info "Zkouším alternativní přístup..."
    
    # Zkusím vytvořit jednoduchou konfiguraci
    print_info "Vytvářím zjednodušenou konfiguraci..."
    sudo tee /etc/nginx/sites-available/pracovni-denik > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    print_info "Testuji zjednodušenou konfiguraci..."
    sudo nginx -t
    
    print_info "Zkouším spustit znovu..."
    sudo systemctl start nginx
    
    if [ $? -eq 0 ]; then
        print_success "✅ Nginx spuštěn se zjednodušenou konfigurací!"
        echo "Aplikace je dostupná na: http://$(hostname -I | awk '{print $1}')"
    else
        print_error "❌ Nginx se stále nepodařilo spustit"
        echo ""
        echo "Zkuste tyto kroky:"
        echo "1. sudo systemctl stop nginx"
        echo "2. sudo systemctl start nginx"
        echo "3. sudo systemctl status nginx"
        echo "4. sudo journalctl -xeu nginx.service"
    fi
fi

echo ""
print_info "Aktuální status Nginx:"
sudo systemctl status nginx --no-pager -l | head -10
