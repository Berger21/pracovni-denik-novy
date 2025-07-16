# 🚀 Spuštění aplikace Pracovní deník na serveru

## Krok 1: Připojení k serveru
```bash
ssh root@192.168.1.251
```

## Krok 2: Přejít do adresáře projektu
```bash
cd /var/www/pracovni-denik
```

## Krok 3: Spustit aplikaci (jeden z těchto způsobů)

### Způsob A: Kompletní instalace a spuštění
```bash
chmod +x install-and-run.sh
./install-and-run.sh
```

### Způsob B: Rychlé spuštění
```bash
chmod +x quick-start.sh
./quick-start.sh
```

### Způsob C: Manuálně
```bash
# Smazat node_modules pokud existuje
rm -rf node_modules

# Smazat package-lock.json
rm -f package-lock.json

# Vyčistit cache
npm cache clean --force

# Nainstalovat závislosti
npm install

# Spustit aplikaci
npm run dev -- --hostname 0.0.0.0 --port 3000
```

## Krok 4: Otevřít aplikaci
Po spuštění bude aplikace dostupná na:
- **http://192.168.1.251:3000** (z lokální sítě)
- **http://localhost:3000** (z serveru)

## Nové funkce aplikace

### 🎨 Moderní UI/UX
- Dark mode (přepínač v pravém horním rohu)
- Responzivní design
- Animace a moderní vzhled

### 📊 Rozšířené statistiky
- Grafy a vizualizace
- Filtry podle data, technologie, směny
- Export do PDF
- Přehledové karty

### 📅 Kalendářní pohled
- Vizualizace deníků v kalendáři
- Detailní zobrazení při kliknutí
- Filtry a legenda

### 💾 Backup/Restore
- Export dat do JSON
- Import dat z JSON
- Smazání všech dat
- Přehled uložených dat

### 🔔 Toast notifikace
- Moderní notifikace místo alert dialogů
- Barevné kategorie (úspěch, chyba, varování, info)

## Troubleshooting

### Pokud aplikace nefunguje:
1. Zkontrolujte, zda běží na portu 3000:
   ```bash
   netstat -tlnp | grep :3000
   ```

2. Zkontrolujte logy:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

3. Restartujte aplikaci:
   ```bash
   pkill -f "npm run dev"
   ./quick-start.sh
   ```

### Pokud npm install selže:
```bash
# Smazat vše a začít znovu
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install --legacy-peer-deps
```

## Použité technologie
- Next.js 15.3.5
- React 18
- TypeScript
- Tailwind CSS
- Recharts (pro grafy)
- jsPDF (pro export PDF)

## Porty a služby
- **Aplikace**: Port 3000
- **SSH**: Port 22
- **Nginx**: Port 80 (pokud je nakonfigurován)

Aplikace je nyní plně modernizována a připravena k používání! 🎉
