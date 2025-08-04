#!/bin/bash

echo "🧹 Nettoyage complet de l'environnement de développement..."

# Arrêter tous les processus npm
echo "Arrêt des processus npm..."
pkill -f "npm run dev" || true

# Supprimer les caches et dépendances
echo "Suppression des caches et dépendances..."
rm -rf node_modules
rm -rf .vite
rm -rf node_modules/.vite
rm -rf dist
rm -f package-lock.json

# Nettoyer le cache npm
echo "Nettoyage du cache npm..."
npm cache clean --force

# Réinstaller les dépendances
echo "Réinstallation des dépendances..."
npm install --legacy-peer-deps

echo "✅ Nettoyage terminé ! Vous pouvez maintenant lancer 'npm run dev'"