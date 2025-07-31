# 🚀 Guide de Déploiement GitHub - EntrepriseOS Complete

## 📋 **Étapes Obligatoires**

### **1. Créer le Repository GitHub**

#### **Option A : Via GitHub Web Interface**
```bash
# 1. Aller sur https://github.com/new
# 2. Repository name: entrepriseOS-complete
# 3. Description: "🚀 Enterprise SaaS CRM/ERP - Modern React Frontend + Complete Supabase Backend with AI Features"
# 4. Visibilité: Public (ou Private selon votre préférence)
# 5. Ne pas cocher "Add a README file" (on a déjà le nôtre)
# 6. Cliquer "Create repository"
```

#### **Option B : Via GitHub CLI (si installé)**
```bash
gh repo create entrepriseOS-complete --public --description "🚀 Enterprise SaaS CRM/ERP - Modern React Frontend + Complete Supabase Backend with AI Features"
```

### **2. Configurer Git Remote et Push**

```bash
# Naviguer vers le repository
cd /workspace/entrepriseOS-complete

# Configurer l'origine (remplacer YOUR_USERNAME par votre username GitHub)
git remote add origin https://github.com/YOUR_USERNAME/entrepriseOS-complete.git

# Vérifier la configuration
git remote -v

# Pousser vers GitHub
git push -u origin main
```

### **3. Configuration des Secrets GitHub (Optionnel)**

Si vous voulez setup le CI/CD immédiatement :

```bash
# Aller dans Settings > Secrets and variables > Actions
# Ajouter ces secrets :

SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
VERCEL_TOKEN=your-vercel-token (pour déploiement auto)
```

## 🔧 **Configuration Locale**

### **1. Cloner le Repository Localement**

```bash
# Cloner votre nouveau repository
git clone https://github.com/YOUR_USERNAME/entrepriseOS-complete.git
cd entrepriseOS-complete

# Installer les dépendances
npm install

# Créer le fichier d'environnement
cp .env.example .env.local
```

### **2. Configuration Environnement**

Éditer `.env.local` avec vos vraies clés :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=EntrepriseOS
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_MODE=true
VITE_DEBUG=true
```

### **3. Lancer en Développement**

```bash
# Démarrer Supabase local (optionnel)
npx supabase start

# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:5173
```

## 🗄️ **Configuration Supabase**

### **Option A : Utiliser Supabase Existant**

Si vous avez déjà un projet Supabase configuré :

```bash
# 1. Mettre vos clés dans .env.local
# 2. Vérifier que les tables existent
# 3. Appliquer les nouvelles migrations si nécessaire
```

### **Option B : Nouveau Projet Supabase**

```bash
# 1. Créer un nouveau projet sur https://supabase.com
# 2. Mettre les clés dans .env.local
# 3. Appliquer toutes les migrations
npx supabase db push

# 4. Déployer les Edge Functions
npx supabase functions deploy ai-business-analyzer
npx supabase functions deploy ai-financial-predictions
# ... (déployer toutes les functions)

# Ou déployer toutes d'un coup
npx supabase functions deploy --no-verify-jwt
```

## 🚀 **Déploiement Production**

### **Vercel (Recommandé)**

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement sur Vercel Dashboard
# Settings > Environment Variables
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### **Netlify**

```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Build le projet
npm run build

# Déployer
netlify deploy --prod --dir=dist
```

### **Traditional Hosting**

```bash
# Build pour production
npm run build

# Le dossier dist/ contient tous les fichiers statiques
# Uploader le contenu de dist/ vers votre serveur web
```

## 🔒 **Sécurité & Configuration**

### **1. Variables d'Environnement de Production**

```env
# Production .env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_APP_URL=https://your-domain.com
VITE_DEV_MODE=false
VITE_DEBUG=false
```

### **2. Configuration Supabase RLS**

Vérifier que toutes les Row Level Security policies sont actives :

```sql
-- Vérifier les policies actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Activer RLS sur toutes les tables si nécessaire
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ... pour toutes les tables
```

### **3. Configuration CORS**

Dans Supabase Dashboard > Settings > API :

```json
{
  "allowed_origins": [
    "http://localhost:5173",
    "https://your-domain.com",
    "https://your-staging-domain.vercel.app"
  ]
}
```

## 📊 **Monitoring & Analytics**

### **1. Vercel Analytics**

```typescript
// Ajouter dans main.tsx
import { Analytics } from '@vercel/analytics/react'

// Dans le render
<Analytics />
```

### **2. Supabase Monitoring**

```typescript
// Dashboard Supabase pour monitoring :
// - Usage API
// - Performance queries
// - Error logs
// - Usage bandwidth
```

## 🤝 **Workflow de Développement**

### **Branches Recommandées**

```bash
main          # Production
develop       # Development
feature/*     # Features
hotfix/*      # Fixes urgents
release/*     # Releases
```

### **Workflow Git**

```bash
# Nouvelle feature
git checkout -b feature/inventory-warehouse-manager
git add .
git commit -m "feat: add WarehouseManager component"
git push origin feature/inventory-warehouse-manager

# Créer Pull Request vers develop
# Après merge, deploy automatique staging

# Release vers production
git checkout main
git merge develop
git push origin main
# Deploy automatique production
```

## 🆘 **Troubleshooting**

### **Erreurs Communes**

#### **1. Build Errors**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### **2. Supabase Connection**
```bash
# Vérifier les clés
npx supabase status
# Ou tester la connexion :
curl https://your-project.supabase.co/rest/v1/profiles \
  -H "apikey: your-anon-key"
```

#### **3. Environment Variables**
```bash
# Vérifier que les variables sont loadées
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```

### **Performance Issues**

```bash
# Analyser le bundle
npm run build
npm run preview
# Vérifier bundle size in Network tab

# Lighthouse audit
npx lighthouse http://localhost:4173 --output=html
```

## 📞 **Support**

Si vous rencontrez des problèmes :

1. **Documentation** : Vérifier `docs/` et `docs/legacy-docs/`
2. **Issues GitHub** : Créer une issue avec détails
3. **Logs** : Vérifier console browser + Supabase logs
4. **Community** : Discord/forums Supabase/React

---

**🎉 Votre repository EntrepriseOS Complete est maintenant prêt pour le développement et la production !**