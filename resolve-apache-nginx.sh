#!/bin/bash

# 🔧 Řešení konfliktu Apache vs Nginx na portu 80

echo "🔧 Řeším konflikt Apache vs Nginx na portu 80..."

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

print_info "Zjištěn Apache na portu 80. Vyberte řešení:"
echo ""
echo "1️⃣  Zastavit Apache a použít Nginx na portu 80"
echo "2️⃣  Použít Nginx na portu 8080 (Apache zůstane na 80)"
echo "3️⃣  Ukončit (nechám Apache běžet)"
echo ""
read -p "Vyberte možnost (1/2/3): " choice

case $choice in
    1)
        print_info "Zastavuji Apache..."
        sudo systemctl stop apache2
        sudo systemctl disable apache2
        
        print_info "Spouštím Nginx na portu 80..."
        sudo systemctl start nginx
        sudo systemctl enable nginx
        
        if [ $? -eq 0 ]; then
            print_success "✅ Nginx úspěšně spuštěn na portu 80!"
            
            SERVER_IP=$(hostname -I | awk '{print $1}')
            print_success "🎉 Aplikace je dostupná na: http://$SERVER_IP"
            
            echo ""
            print_info "Testování..."
            if curl -s -f http://localhost:80 > /dev/null 2>&1; then
                print_success "✅ Test úspěšný!"
            else
                print_warning "⚠️  Test neúspěšný"
            fi
        else
            print_error "❌ Nginx se nepodařilo spustit"
        fi
        ;;
    2)
        print_info "Konfiguruji Nginx na portu 8080..."
        sudo tee /etc/nginx/sites-available/pracovni-denik > /dev/null <<EOF
server {
    listen 8080;
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
        
        print_info "Aktivuji konfiguraci..."
        sudo ln -sf /etc/nginx/sites-available/pracovni-denik /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        print_info "Testuji konfiguraci..."
        sudo nginx -t
        
        print_info "Spouštím Nginx..."
        sudo systemctl start nginx
        sudo systemctl enable nginx
        
        if [ $? -eq 0 ]; then
            print_success "✅ Nginx úspěšně spuštěn na portu 8080!"
            
            SERVER_IP=$(hostname -I | awk '{print $1}')
            print_success "🎉 Aplikace je dostupná na: http://$SERVER_IP:8080"
            
            echo ""
            print_info "Testování..."
            if curl -s -f http://localhost:8080 > /dev/null 2>&1; then
                print_success "✅ Test úspěšný!"
            else
                print_warning "⚠️  Test neúspěšný"
            fi
            
            echo ""
            print_info "📋 Poznámky:"
            echo "  - Apache běží na portu 80: http://$SERVER_IP"
            echo "  - Vaše aplikace běží na portu 8080: http://$SERVER_IP:8080"
        else
            print_error "❌ Nginx se nepodařilo spustit"
        fi
        ;;
    3)
        print_info "Ukončuji bez změn..."
        echo ""
        print_info "Vaše aplikace je stále dostupná na: http://$(hostname -I | awk '{print $1}'):3000"
        echo "Apache zůstává na portu 80"
        exit 0
        ;;
    *)
        print_error "Neplatná volba!"
        exit 1
        ;;
esac

echo ""
print_info "Aktuální stav portů:"
sudo ss -tlnp | grep -E ':(80|8080|3000)' | head -10

echo ""
print_info "Status služeb:"
echo "Apache2:"
sudo systemctl status apache2 --no-pager | head -3
echo "Nginx:"
sudo systemctl status nginx --no-pager | head -3
echo "PM2:"
pm2 status | head -5
