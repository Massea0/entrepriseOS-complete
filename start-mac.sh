#!/bin/bash

echo "🚀 Démarrage rapide Enterprise OS pour Mac"
echo ""

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
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

PORT=5173
NODE_ENV=development
EOF
    echo "✅ Fichier .env créé"
fi

# Vérifier si tsx est installé
if ! command -v tsx &> /dev/null
then
    echo "⚠️  tsx n'est pas installé. Installation en cours..."
    npm install -g tsx
fi

# Démarrer l'application
echo ""
echo "🚀 Démarrage de l'application..."
echo ""
NODE_ENV=development tsx --env-file=.env server/index.ts