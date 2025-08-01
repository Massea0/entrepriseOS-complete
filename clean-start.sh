#!/bin/bash

echo "🧹 Nettoyage du cache Vite..."
rm -rf node_modules/.vite

echo "🔄 Suppression du cache npm..."
rm -rf .npm

echo "🗑️  Suppression des fichiers temporaires..."
find . -name "*.log" -type f -delete
find . -name ".DS_Store" -type f -delete

echo "✅ Nettoyage terminé!"
echo "🚀 Démarrage du serveur de développement..."
npm run dev