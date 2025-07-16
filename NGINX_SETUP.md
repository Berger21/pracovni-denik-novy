# 🌐 Manuální nastavení Nginx

## 1. Instalace Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

## 2. Vytvoření konfigurace
```bash
sudo nano /etc/nginx/sites-available/pracovni-denik
```

Vložte tento obsah:
```nginx
server {
    listen 80;
    server_name 192.168.1.251 localhost;
    
    # Gzip komprese
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Proxy na Node.js aplikaci
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Bezpečnostní hlavičky
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logy
    access_log /var/log/nginx/pracovni-denik-access.log;
    error_log /var/log/nginx/pracovni-denik-error.log;
}
```

## 3. Aktivace konfigurace
```bash
sudo ln -s /etc/nginx/sites-available/pracovni-denik /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

## 4. Test a restart
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 5. Testování
```bash
curl http://localhost
curl http://192.168.1.251
```

## 6. Firewall (pokud je aktivní)
```bash
sudo ufw allow 'Nginx Full'
```

Po dokončení bude aplikace dostupná na:
- http://192.168.1.251
- http://localhost (na serveru)

Nginx bude přeposílat všechny požadavky z portu 80 na port 3000, kde běží vaše Node.js aplikace.
