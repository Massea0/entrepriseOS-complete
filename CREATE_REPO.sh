#!/bin/bash

echo "🚀 Création du Repository GitHub pour Massea0"
echo "============================================="

# Couleurs pour le terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Étapes à suivre:${NC}"
echo ""

echo -e "${YELLOW}1. Créer le repository GitHub:${NC}"
echo "   🌐 Aller sur: https://github.com/new"
echo "   📝 Repository name: entrepriseOS-complete"
echo "   📄 Description: 🚀 Enterprise SaaS CRM/ERP - Modern React Frontend + Complete Supabase Backend with AI Features"
echo "   👁️  Visibilité: Public ✅"
echo "   📄 Ne PAS cocher 'Add README file' ❌"
echo "   🔲 Cliquer 'Create repository'"
echo ""

echo -e "${YELLOW}2. Une fois créé, appuyer sur ENTRÉE pour continuer...${NC}"
read -p ""

echo -e "${BLUE}🔄 Tentative de push vers GitHub...${NC}"

# Vérifier qu'on est dans le bon répertoire
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erreur: Pas dans un repository Git!${NC}"
    exit 1
fi

# Vérifier le remote
echo -e "${BLUE}🔍 Vérification du remote...${NC}"
git remote -v

# Essayer de pousser
echo -e "${BLUE}📤 Push vers GitHub...${NC}"
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}🎉 SUCCÈS! Repository créé et code poussé!${NC}"
    echo ""
    echo -e "${GREEN}📍 URL du repository:${NC}"
    echo -e "${BLUE}   https://github.com/Massea0/entrepriseOS-complete${NC}"
    echo ""
    echo -e "${GREEN}📊 Contenu poussé:${NC}"
    echo "   📁 354 fichiers"
    echo "   📝 100,185+ lignes de code"
    echo "   🎨 Frontend React complet"
    echo "   🗄️  Backend Supabase complet"
    echo "   📚 Documentation complète"
    echo "   🤖 Guide de passation IA"
    echo ""
    echo -e "${GREEN}✅ Prêt pour continuation par AI Agent!${NC}"
else
    echo ""
    echo -e "${RED}❌ Erreur lors du push!${NC}"
    echo -e "${YELLOW}💡 Vérifications:${NC}"
    echo "   1. Le repository GitHub a-t-il été créé?"
    echo "   2. Le nom est-il exactement 'entrepriseOS-complete'?"
    echo "   3. Essayer manuellement:"
    echo "      git push -u origin main"
fi

echo ""
echo -e "${BLUE}📋 Fichiers de passation créés:${NC}"
echo "   🤖 PASSATION_AI_AGENT.md (guide complet)"
echo "   🚀 DEPLOYMENT_GUIDE.md (guide technique)"
echo "   📋 GITHUB_SETUP.md (instructions GitHub)"
echo ""
echo -e "${GREEN}🎯 Mission pour l'AI Agent: Terminer le module Supply Chain & Inventory!${NC}"