#!/bin/bash

# � Správa aplikace Pracovní deník na Ubuntu Server

set -e

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

show_help() {
    echo "🚀 Správa aplikace Pracovní deník"
    echo ""
    echo "Použití: $0 [PŘÍKAZ]"
    echo ""
    echo "Dostupné příkazy:"
    echo "  start       - Spustit aplikaci"
    echo "  stop        - Zastavit aplikaci"
    echo "  restart     - Restartovat aplikaci"
    echo "  status      - Zobrazit stav aplikace"
    echo "  logs        - Zobrazit logy aplikace"
    echo "  deploy      - Nasadit novou verzi"
    echo "  diagnose    - Diagnostika problémů"
    echo "  fix         - Oprava běžných problémů"
    echo "  nginx       - Konfigurovat Nginx"
    echo "  help        - Zobrazit tuto nápovědu"
    echo ""
}

start_app() {
    print_info "Spouštím aplikaci..."
    cd "$APP_DIR"
    pm2 start ecosystem.config.json
    pm2 save
    print_success "Aplikace spuštěna!"
}

stop_app() {
    print_info "Zastavuji aplikaci..."
    pm2 stop $APP_NAME 2>/dev/null || true
    print_success "Aplikace zastavena!"
}

restart_app() {
    print_info "Restartuji aplikaci..."
    cd "$APP_DIR"
    pm2 restart $APP_NAME 2>/dev/null || pm2 start ecosystem.config.json
    pm2 save
    print_success "Aplikace restartována!"
}

show_status() {
    print_info "Stav aplikace:"
    pm2 status
    echo ""
    print_info "Stav Nginx:"
    sudo systemctl status nginx --no-pager -l | head -10
    echo ""
    print_info "Testování dostupnosti:"
    curl -s -o /dev/null -w "Localhost:3000 - HTTP Status: %{http_code}\n" http://localhost:3000 || echo "Localhost:3000 - Nedostupné"
    curl -s -o /dev/null -w "Localhost:80 - HTTP Status: %{http_code}\n" http://localhost:80 || echo "Localhost:80 - Nedostupné"
}

show_logs() {
    print_info "Zobrazuji logy aplikace..."
    pm2 logs $APP_NAME --lines 20
}

deploy_app() {
    print_info "Nasazuji novou verzi..."
    cd "$APP_DIR"
    
    # Zastavit aplikaci
    pm2 stop $APP_NAME 2>/dev/null || true
    
    # Instalace závislostí
    print_info "Instaluji závislosti..."
    npm install
    
    # Build
    print_info "Buildím aplikaci..."
    npm run build
    
    # Spuštění
    print_info "Spouštím aplikaci..."
    pm2 start ecosystem.config.json
    pm2 save
    
    # Restart Nginx
    print_info "Restartuji Nginx..."
    sudo systemctl restart nginx
    
    print_success "Nasazení dokončeno!"
}

diagnose_app() {
    print_info "Spouštím diagnostiku..."
    if [ -f "$APP_DIR/diagnose.sh" ]; then
        bash "$APP_DIR/diagnose.sh"
    else
        print_error "Diagnostický skript nenalezen!"
    fi
}

fix_app() {
    print_info "Opravuji běžné problémy..."
    if [ -f "$APP_DIR/fix-app.sh" ]; then
        bash "$APP_DIR/fix-app.sh"
    else
        print_error "Opravný skript nenalezen!"
    fi
}

configure_nginx() {
    print_info "Konfiguruji Nginx..."
    if [ -f "$APP_DIR/configure-nginx.sh" ]; then
        bash "$APP_DIR/configure-nginx.sh"
    else
        print_error "Nginx konfigurační skript nenalezen!"
    fi
}

# Kontrola, zda běží jako root
if [[ $EUID -eq 0 ]]; then
   print_error "Nespouštějte tento skript jako root!"
   exit 1
fi

# Kontrola existence adresáře
if [ ! -d "$APP_DIR" ]; then
    print_error "Adresář aplikace $APP_DIR neexistuje!"
    exit 1
fi

# Zpracování argumentů
case "${1:-help}" in
    "start")
        start_app
        ;;
    "stop")
        stop_app
        ;;
    "restart")
        restart_app
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "deploy")
        deploy_app
        ;;
    "diagnose")
        diagnose_app
        ;;
    "fix")
        fix_app
        ;;
    "nginx")
        configure_nginx
        ;;
    "help"|*)
        show_help
        ;;
esac
        print_success "Aplikace spuštěna!"
        ;;
    stop)
        echo "🛑 Zastavuji aplikaci..."
        pm2 stop $APP_NAME
        print_success "Aplikace zastavena!"
        ;;
    restart)
        echo "🔄 Restartuji aplikaci..."
        pm2 restart $APP_NAME
        print_success "Aplikace restartována!"
        ;;
    status)
        echo "📊 Status aplikace:"
        pm2 status
        ;;
    logs)
        echo "📋 Logy aplikace:"
        pm2 logs $APP_NAME
        ;;
    update)
        echo "🔄 Aktualizuji aplikaci z Git..."
        cd $APP_DIR
        echo "📥 Stahuje změny z Git repository..."
        git pull origin main
        echo "📦 Instaluji závislosti..."
        npm install
        echo "🔨 Buildím aplikaci..."
        npm run build
        echo "🔄 Restartuji aplikaci..."
        pm2 restart $APP_NAME
        print_success "Aplikace aktualizována z Git!"
        ;;
    git-status)
        echo "📊 Git status:"
        cd $APP_DIR
        git status
        echo ""
        echo "📋 Poslední commity:"
        git log --oneline -5
        ;;
    nginx-restart)
        echo "🔄 Restartuji Nginx..."
        sudo systemctl restart nginx
        print_success "Nginx restartován!"
        ;;
    nginx-status)
        echo "📊 Status Nginx:"
        sudo systemctl status nginx
        ;;
    nginx-logs)
        echo "📋 Logy Nginx:"
        sudo tail -f /var/log/nginx/error.log
        ;;
    backup)
        echo "💾 Vytvářím zálohu..."
        BACKUP_DIR="/var/backups/pracovni-denik"
        sudo mkdir -p $BACKUP_DIR
        BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        cd /var/www
        sudo tar -czf $BACKUP_FILE $APP_NAME
        sudo chown $USER:$USER $BACKUP_FILE
        print_success "Záloha vytvořena: $BACKUP_FILE"
        ;;
    monitor)
        echo "📈 Monitoring aplikace:"
        pm2 monit
        ;;
    *)
        echo "🔧 Utility skripty pro správu aplikace Pracovní deník"
        echo ""
        echo "Použití: $0 {start|stop|restart|status|logs|update|git-status|nginx-restart|nginx-status|nginx-logs|backup|monitor}"
        echo ""
        echo "Příkazy:"
        echo "  start          - Spustí aplikaci"
        echo "  stop           - Zastaví aplikaci"
        echo "  restart        - Restartuje aplikaci"
        echo "  status         - Zobrazí status aplikace"
        echo "  logs           - Zobrazí logy aplikace"
        echo "  update         - Aktualizuje aplikaci z Git"
        echo "  git-status     - Zobrazí Git status a historii"
        echo "  nginx-restart  - Restartuje Nginx"
        echo "  nginx-status   - Zobrazí status Nginx"
        echo "  nginx-logs     - Zobrazí logy Nginx"
        echo "  backup         - Vytvoří zálohu aplikace"
        echo "  monitor        - Spustí monitoring PM2"
        exit 1
        ;;
esac
