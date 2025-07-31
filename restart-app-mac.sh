#!/bin/bash

echo "🚀 Redémarrage de Enterprise OS avec les dernières corrections"
echo ""

# Arrêter les processus en cours
echo "🛑 Arrêt des processus en cours..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

# Récupérer les dernières modifications
echo "📥 Récupération des dernières corrections..."
git pull origin main

# Redémarrer l'application
echo ""
echo "🚀 Démarrage de l'application..."
echo ""
npm run dev

# Si le port 5173 est toujours occupé, utiliser le port 5174
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Port 5173 occupé, utilisation du port 5174..."
    echo ""
    PORT=5174 npm run dev
fi