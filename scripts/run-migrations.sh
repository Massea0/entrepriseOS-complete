#!/bin/bash
# run-migrations.sh
# Script pour exécuter les migrations Supabase

# Configuration
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Exécution des migrations Supabase...${NC}"

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de Supabase CLI...${NC}"
    npm install -g supabase
fi

# Appliquer les migrations
echo -e "\n${YELLOW}📄 Application de la migration 001_create_quotes_contracts_tables.sql...${NC}"

# Utiliser Supabase CLI pour appliquer la migration
if npx supabase db push; then
    success "Migration appliquée avec succès"
else
    error "Erreur lors de l'application de la migration"
    echo -e "${YELLOW}💡 Essai avec psql direct...${NC}"
    
    # Essayer avec psql si Supabase CLI échoue
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -f supabase/migrations/001_create_quotes_contracts_tables.sql
        if [ $? -eq 0 ]; then
            success "Migration appliquée via psql"
        else
            error "Échec de la migration via psql"
            exit 1
        fi
    else
        error "DATABASE_URL non définie. Veuillez la configurer dans .env"
        exit 1
    fi
fi

# Générer les types TypeScript
echo -e "\n${YELLOW}🔧 Génération des types TypeScript...${NC}"
if npx supabase gen types typescript --local > src/types/supabase.ts; then
    success "Types générés avec succès"
else
    error "Erreur lors de la génération des types"
fi

echo -e "\n${GREEN}✨ Migrations terminées !${NC}"