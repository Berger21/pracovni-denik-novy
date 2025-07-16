# 🔧 Řešení problémů s aplikací na Ubuntu serveru

## Rychlé řešení problémů

### 1. Nejprve spusťte diagnostiku
```bash
cd /var/www/pracovni-denik
chmod +x diagnose.sh
./diagnose.sh
```

### 2. Pokud diagnostika neidentifikuje problém, spusťte opravu
```bash
chmod +x fix-app.sh
./fix-app.sh
```

### 3. Pokud stále nefunguje, zkonfigurojte Nginx
```bash
chmod +x configure-nginx.sh
./configure-nginx.sh
```

### 4. Použijte nový správcovský skript
```bash
chmod +x manage.sh
./manage.sh help
```

## Nejčastější problémy a řešení

### ❌ Problem: Aplikace se nespustí
**Řešení:**
```bash
cd /var/www/pracovni-denik
./manage.sh fix      # Oprava všech běžných problémů
./manage.sh start    # Spuštění aplikace
```

### ❌ Problem: Port 3000 není dostupný
**Řešení:**
```bash
# Zkontrolujte, co běží na portu 3000
sudo netstat -tlnp | grep :3000
# Nebo
sudo ss -tlnp | grep :3000

# Pokud běží jiná aplikace, ukončete ji
sudo pkill -f "node.*3000"

# Restartujte aplikaci
./manage.sh restart
```

### ❌ Problem: Nginx neproxuje požadavky
**Řešení:**
```bash
# Rekonfigurace Nginx
./manage.sh nginx

# Nebo manuálně
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx
```

### ❌ Problem: PM2 neběží
**Řešení:**
```bash
# Zkontrolujte PM2
pm2 status

# Pokud je prázdný, spusťte aplikaci
pm2 start ecosystem.config.json
pm2 save
pm2 startup
```

### ❌ Problem: Závislosti nejsou nainstalované
**Řešení:**
```bash
cd /var/www/pracovni-denik
rm -rf node_modules
npm cache clean --force
npm install
npm run build
./manage.sh restart
```

### ❌ Problem: Aplikace není buildována
**Řešení:**
```bash
cd /var/www/pracovni-denik
npm run build
./manage.sh restart
```

### ❌ Problem: Oprávnění k souborům
**Řešení:**
```bash
# Opravte oprávnění
sudo chown -R $USER:$USER /var/www/pracovni-denik
sudo chmod -R 755 /var/www/pracovni-denik
sudo chmod +x /var/www/pracovni-denik/*.sh
```

### ❌ Problem: Firewall blokuje porty
**Řešení:**
```bash
# Povolte porty
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw reload
```

## Detailní diagnostika

### Kontrola logů
```bash
# PM2 logy
pm2 logs pracovni-denik

# Nginx logy
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Systémové logy
sudo journalctl -u nginx -f
```

### Testování dostupnosti
```bash
# Test lokálně
curl -I http://localhost:3000
curl -I http://localhost:80

# Test z vnějšku (nahraďte IP_ADRESA skutečnou IP)
curl -I http://IP_ADRESA
```

### Kontrola procesů
```bash
# Všechny Node.js procesy
ps aux | grep node

# PM2 procesy
pm2 list

# Nginx procesy
ps aux | grep nginx
```

## Kompletní reinstalace

Pokud nic nepomáhá, proveďte kompletní reinstalaci:

```bash
# 1. Zastavte vše
pm2 stop pracovni-denik
pm2 delete pracovni-denik
sudo systemctl stop nginx

# 2. Vyčistěte aplikaci
cd /var/www/pracovni-denik
rm -rf node_modules .next

# 3. Reinstalujte
npm install
npm run build

# 4. Spusťte znovu
pm2 start ecosystem.config.json
pm2 save
sudo systemctl start nginx

# 5. Zkontrolujte
./manage.sh status
```

## Kontakty pro podporu

Pokud stále máte problémy, poskytněte následující informace:

```bash
# Spusťte diagnostiku a odešlete výsledky
./diagnose.sh > diagnostic-report.txt

# Přiložte také logy
pm2 logs pracovni-denik --lines 50 > pm2-logs.txt
sudo tail -50 /var/log/nginx/error.log > nginx-error.txt
```

## Užitečné příkazy

```bash
# Správa aplikace
./manage.sh start      # Spustit
./manage.sh stop       # Zastavit
./manage.sh restart    # Restartovat
./manage.sh status     # Stav
./manage.sh logs       # Logy
./manage.sh deploy     # Nasadit novou verzi
./manage.sh diagnose   # Diagnostika
./manage.sh fix        # Oprava problémů
./manage.sh nginx      # Konfigurace Nginx

# PM2 příkazy
pm2 list              # Seznam procesů
pm2 logs APP_NAME     # Logy aplikace
pm2 restart APP_NAME  # Restart aplikace
pm2 stop APP_NAME     # Zastavit aplikace
pm2 delete APP_NAME   # Smazat aplikaci

# Nginx příkazy
sudo systemctl status nginx    # Status
sudo systemctl restart nginx  # Restart
sudo nginx -t                 # Test konfigurace
sudo systemctl reload nginx   # Reload konfigurace
```
