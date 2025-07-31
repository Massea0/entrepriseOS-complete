#!/bin/bash

echo "🔧 Configuration de l'environnement Enterprise OS pour Mac"
echo ""

# 1. Pull latest changes
echo "📥 Récupération des dernières modifications..."
git fetch origin main
git reset --hard origin/main

# 2. Créer le fichier .env avec les bonnes clés
echo "📝 Création du fichier .env..."
cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc

# Legacy support
DATABASE_URL=postgresql://supabase:supabase@localhost:54322/postgres
NEXT_PUBLIC_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE

# Optional
PORT=5173
NODE_ENV=development
EOF

echo "✅ Fichier .env créé"

# 3. Nettoyer node_modules et réinstaller
echo ""
echo "🧹 Nettoyage et réinstallation des dépendances..."
rm -rf node_modules package-lock.json
npm install

# 4. Afficher les instructions
echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Pour démarrer l'application :"
echo "   npm run dev"
echo ""
echo "🔐 Identifiants de connexion :"
echo "   Email: admin@entreprise-os.com"
echo "   Password: Admin123!@#"
echo ""