#!/bin/bash

# 🚀 Rychlé spuštění aplikace Pracovní deník

cd /var/www/pracovni-denik

echo "🚀 Spouštím aplikaci Pracovní deník..."
echo "📍 Aplikace bude dostupná na: http://192.168.1.251:3000"
echo "⏹️  Pro zastavení použijte Ctrl+C"
echo ""

# Zkontrolovat, zda existují node_modules
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules neexistuje, spouštím instalaci..."
    npm install
fi

# Spustit aplikaci
npm run dev -- --hostname 0.0.0.0 --port 3000
