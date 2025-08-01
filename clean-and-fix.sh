#!/bin/bash

echo "🛑 Arrêt complet des processus..."
pkill -f node || true
pkill -f vite || true

echo "🧹 Nettoyage profond..."
rm -rf node_modules
rm -rf .vite
rm -rf dist
rm -rf .parcel-cache
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

echo "📦 Réinstallation complète..."
npm install

echo "🔍 Vérification des versions React..."
npm ls react react-dom

echo "✅ Nettoyage terminé!"
echo "�� Démarrage du serveur..."
npm run dev
