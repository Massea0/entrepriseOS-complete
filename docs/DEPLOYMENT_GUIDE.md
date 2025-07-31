# Guide de Déploiement EntrepriseOS 🚀

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase](#configuration-supabase)
3. [Configuration des Services IA](#configuration-des-services-ia)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Déploiement Local](#déploiement-local)
6. [Déploiement Production](#déploiement-production)
7. [Tests et Validation](#tests-et-validation)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

## Prérequis

### Outils requis
- Node.js 18+ et npm 9+
- Git
- Compte Supabase
- Compte Vercel (recommandé) ou autre hébergeur Next.js
- Comptes pour services IA (optionnel)

### Services tiers
- **Supabase** : Backend, Auth, Database, Storage
- **OpenAI/Google AI/Anthropic** : Features IA (optionnel)
- **Stripe** : Paiements (optionnel)
- **SendGrid/Resend** : Emails transactionnels

## Configuration Supabase

### 1. Créer un projet Supabase

```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser le projet
supabase init

# Lier au projet cloud
supabase link --project-ref your-project-ref
```

### 2. Configurer la base de données

```bash
# Appliquer les migrations
supabase db push

# Créer les tables de base
supabase db reset
```

### 3. Configurer l'authentification

Dans le dashboard Supabase :
1. **Authentication > Providers** : Activer Email/Password
2. **Authentication > Email Templates** : Personnaliser les templates
3. **Authentication > URL Configuration** :
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`

### 4. Configurer Row Level Security (RLS)

```sql
-- Exemple de politique RLS pour multi-tenant
CREATE POLICY "Users can only see their organization data"
ON public.employees
FOR ALL
USING (organization_id = auth.jwt() ->> 'organization_id');
```

### 5. Déployer les Edge Functions

```bash
# Déployer toutes les functions
supabase functions deploy

# Ou déployer une function spécifique
supabase functions deploy inventory-stock-updates
```

## Configuration des Services IA

### OpenAI
1. Créer un compte sur [platform.openai.com](https://platform.openai.com)
2. Générer une clé API
3. Configurer les limites de dépenses

### Google AI (Gemini)
1. Activer l'API sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer une clé API
3. Activer le service Generative Language API

### Anthropic (Claude)
1. S'inscrire sur [console.anthropic.com](https://console.anthropic.com)
2. Obtenir une clé API
3. Configurer les quotas

## Variables d'Environnement

### 1. Copier le fichier exemple

```bash
cp .env.example .env.local
```

### 2. Configuration minimale requise

```env
# Supabase (OBLIGATOIRE)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Application (OBLIGATOIRE)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=EntrepriseOS

# IA (Optionnel - au moins un service)
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIza...
```

### 3. Sécuriser les secrets

```bash
# Ne jamais committer .env.local
echo ".env.local" >> .gitignore

# Utiliser des secrets dans Vercel/votre hébergeur
vercel secrets add supabase-url "https://xxxxx.supabase.co"
```

## Déploiement Local

### 1. Installation

```bash
# Cloner le repository
git clone https://github.com/your-org/entrepriseos.git
cd entrepriseos

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs
```

### 2. Base de données locale

```bash
# Démarrer Supabase local
supabase start

# Appliquer les migrations
supabase db reset

# Seed data (optionnel)
npm run db:seed
```

### 3. Lancer l'application

```bash
# Mode développement
npm run dev

# Ouvrir http://localhost:3000
```

### 4. Tester les connexions

```bash
# Vérifier toutes les connexions
npm run test:connections

# Résultat attendu :
# ✅ Supabase: Connection successful
# ✅ Environment: All critical variables present
# ⚠️ OpenAI: API key not configured (si pas configuré)
```

## Déploiement Production

### Option 1: Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... ajouter toutes les variables
```

### Option 2: Docker

```dockerfile
# Dockerfile fourni
docker build -t entrepriseos .
docker run -p 3000:3000 --env-file .env.production entrepriseos
```

### Option 3: VPS traditionnel

```bash
# Sur le serveur
git clone https://github.com/your-org/entrepriseos.git
cd entrepriseos
npm install
npm run build

# Utiliser PM2 pour la gestion du processus
npm install -g pm2
pm2 start npm --name "entrepriseos" -- start
pm2 save
pm2 startup
```

### Configuration DNS

```
# Records DNS requis
A     @         YOUR_SERVER_IP
A     www       YOUR_SERVER_IP
CNAME inventory  your-app.vercel.app
```

### SSL/HTTPS

- **Vercel** : SSL automatique
- **VPS** : Utiliser Certbot/Let's Encrypt
- **Cloudflare** : Proxy avec SSL flexible

## Tests et Validation

### 1. Tests automatisés

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Tests de performance
npm run test:performance

# Tous les tests
npm run test:all
```

### 2. Checklist de validation

- [ ] **Authentification**
  - [ ] Login/Logout fonctionne
  - [ ] Création de compte
  - [ ] Reset password
  - [ ] Sessions persistantes

- [ ] **Modules métier**
  - [ ] CRUD operations (Create, Read, Update, Delete)
  - [ ] Recherche et filtres
  - [ ] Export de données
  - [ ] Real-time updates

- [ ] **Features IA** (si activées)
  - [ ] Auto-assignment
  - [ ] Prédictions
  - [ ] Génération d'emails
  - [ ] Analytics IA

- [ ] **Performance**
  - [ ] Lighthouse score > 90
  - [ ] Time to Interactive < 3s
  - [ ] Mobile responsive
  - [ ] Offline capabilities

### 3. Tests de charge

```bash
# Utiliser k6 pour les tests de charge
k6 run scripts/load-test.js

# Métriques cibles :
# - 95th percentile < 500ms
# - 0% error rate sous 100 users/sec
# - Memory stable après 1h
```

## Monitoring

### 1. Application Performance Monitoring (APM)

```javascript
// Sentry pour error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 2. Analytics

```javascript
// PostHog pour analytics
import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST
});
```

### 3. Logs

```bash
# Vercel logs
vercel logs --follow

# PM2 logs
pm2 logs entrepriseos

# Supabase logs
supabase logs --follow
```

### 4. Alertes

Configurer des alertes pour :
- Erreurs 5xx > 1% 
- Response time > 1s
- Memory usage > 80%
- Failed auth attempts > 10/min

## Troubleshooting

### Problèmes courants

#### 1. "Supabase connection failed"
```bash
# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_SUPABASE_URL

# Tester la connexion directe
curl https://xxxxx.supabase.co/rest/v1/

# Vérifier les CORS
# Dashboard Supabase > Settings > API > CORS
```

#### 2. "Features IA non disponibles"
```bash
# Vérifier les clés API
npm run test:connections

# Vérifier les feature flags
# Dashboard > Organization Settings > Features
```

#### 3. "Performance dégradée"
```bash
# Analyser le bundle
npm run analyze

# Optimiser les images
npm run optimize:images

# Activer le cache CDN
# Cloudflare/Vercel Edge Config
```

#### 4. "Erreurs de permission"
```sql
-- Vérifier les RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Tester avec le service role (bypass RLS)
-- Si ça marche, c'est un problème RLS
```

### Support

- Documentation : [docs.entrepriseos.com](https://docs.entrepriseos.com)
- Discord : [discord.gg/entrepriseos](https://discord.gg/entrepriseos)
- Email : support@entrepriseos.com
- Issues : [GitHub Issues](https://github.com/your-org/entrepriseos/issues)

## Prochaines étapes

1. **Configurer les backups** automatiques dans Supabase
2. **Implémenter le CI/CD** avec GitHub Actions
3. **Configurer le monitoring** avec Datadog/New Relic
4. **Plan de disaster recovery**
5. **Documentation API** avec Swagger/OpenAPI

---

🎉 **Félicitations !** Votre instance EntrepriseOS est maintenant en production !

Pour toute question, consultez notre [documentation complète](https://docs.entrepriseos.com) ou contactez le support.