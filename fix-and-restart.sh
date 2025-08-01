#!/bin/bash

echo "🛑 Arrêt des processus node..."
pkill -f "node.*vite" || true

echo "🧹 Nettoyage complet..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf .parcel-cache
find . -name "*.log" -type f -delete

echo "📦 Vérification des dépendances..."
npm install

echo "✅ Nettoyage terminé!"
echo "🚀 Démarrage du serveur..."
npm run dev
