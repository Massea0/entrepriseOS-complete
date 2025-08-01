#!/bin/bash

# deploy-finance-to-supabase.sh
# Script de déploiement du module Finance sur Supabase

set -e  # Exit on error

echo "🚀 DÉPLOIEMENT DU MODULE FINANCE SUR SUPABASE"
echo "============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI n'est pas installé${NC}"
    echo "Installez-le avec: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI détecté${NC}"
echo ""

# 1. Exécuter les migrations
echo -e "${YELLOW}📊 Étape 1/3: Exécution des migrations SQL${NC}"
echo "-------------------------------------------"

if [ -f "supabase/migrations/001_create_quotes_contracts_tables.sql" ]; then
    echo "Migration trouvée: 001_create_quotes_contracts_tables.sql"
    echo ""
    
    read -p "Voulez-vous exécuter la migration ? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Exécution de la migration..."
        supabase db push
        echo -e "${GREEN}✅ Migration exécutée avec succès${NC}"
    else
        echo -e "${YELLOW}⏭️  Migration ignorée${NC}"
    fi
else
    echo -e "${RED}❌ Fichier de migration non trouvé${NC}"
fi

echo ""

# 2. Créer les Edge Functions
echo -e "${YELLOW}🔧 Étape 2/3: Création des Edge Functions${NC}"
echo "----------------------------------------"

FUNCTIONS=(
    "quote-generator-ai"
    "quote-analyzer"
    "email-generator"
    "contract-analyzer"
    "contract-generator"
    "esignature-workflow"
    "financial-predictions"
    "generate-financial-report"
)

for func in "${FUNCTIONS[@]}"; do
    echo -n "Création de $func... "
    
    if [ ! -d "supabase/functions/$func" ]; then
        supabase functions new $func
        echo -e "${GREEN}✅${NC}"
        
        # Créer un template de base
        cat > "supabase/functions/$func/index.ts" << 'EOF'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body = await req.json()

    // TODO: Implement your function logic here
    
    return new Response(
      JSON.stringify({ 
        message: 'Function not implemented yet',
        received: body 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})
EOF
        
    else
        echo -e "${YELLOW}existe déjà${NC}"
    fi
done

echo ""

# 3. Configuration des variables d'environnement
echo -e "${YELLOW}🔐 Étape 3/3: Configuration des secrets${NC}"
echo "--------------------------------------"

echo "Les Edge Functions nécessitent ces variables d'environnement:"
echo ""
echo "  - OPENAI_API_KEY (pour l'IA)"
echo "  - SENDGRID_API_KEY (pour les emails)"
echo "  - STRIPE_API_KEY (pour les paiements - optionnel)"
echo ""

read -p "Voulez-vous configurer les secrets maintenant ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "OPENAI_API_KEY: " OPENAI_KEY
    if [ ! -z "$OPENAI_KEY" ]; then
        supabase secrets set OPENAI_API_KEY=$OPENAI_KEY
        echo -e "${GREEN}✅ OPENAI_API_KEY configuré${NC}"
    fi
    
    read -p "SENDGRID_API_KEY: " SENDGRID_KEY
    if [ ! -z "$SENDGRID_KEY" ]; then
        supabase secrets set SENDGRID_API_KEY=$SENDGRID_KEY
        echo -e "${GREEN}✅ SENDGRID_API_KEY configuré${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Configuration des secrets ignorée${NC}"
    echo "Vous pouvez les configurer plus tard avec:"
    echo "  supabase secrets set KEY_NAME=value"
fi

echo ""

# 4. Déploiement des Edge Functions
echo -e "${YELLOW}🚀 Déploiement des Edge Functions${NC}"
echo "---------------------------------"

read -p "Voulez-vous déployer les Edge Functions maintenant ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    for func in "${FUNCTIONS[@]}"; do
        echo -n "Déploiement de $func... "
        if [ -d "supabase/functions/$func" ]; then
            supabase functions deploy $func
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌ Dossier non trouvé${NC}"
        fi
    done
else
    echo -e "${YELLOW}⏭️  Déploiement ignoré${NC}"
    echo "Vous pouvez déployer plus tard avec:"
    echo "  supabase functions deploy <function-name>"
fi

echo ""
echo -e "${GREEN}✨ Configuration terminée !${NC}"
echo ""
echo "Prochaines étapes:"
echo "1. Implémentez la logique des Edge Functions"
echo "2. Testez les endpoints avec:"
echo "   curl -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "        https://YOUR_PROJECT.functions.supabase.co/quote-generator-ai"
echo "3. Consultez les logs avec:"
echo "   supabase functions logs <function-name>"
echo ""
echo "📚 Documentation complète dans: supabase/functions/README.md"