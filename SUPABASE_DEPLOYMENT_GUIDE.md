# 🚀 GUIDE DE DÉPLOIEMENT SUPABASE - MODULE FINANCE

## 📋 CE QUI A ÉTÉ CRÉÉ LOCALEMENT

### ✅ 1. Migration SQL complète
**Fichier**: `supabase/migrations/001_create_quotes_contracts_tables.sql`

Ce fichier contient:
- **Tables principales**:
  - `quotes` - Devis avec colonnes calculées
  - `quote_items` - Articles des devis
  - `contracts` - Contrats avec versioning
  - `contract_templates` - Templates réutilisables
  
- **Sécurité RLS** (Row Level Security):
  - Politiques pour lecture/écriture par organisation
  - Isolation des données entre tenants
  
- **Automatisations**:
  - Triggers `updated_at`
  - Numérotation automatique des devis
  - Calculs automatiques des totaux

### ✅ 2. Services TypeScript
- **QuoteService** (`src/features/finance/services/quote.service.ts`)
- **ContractService** (`src/features/finance/services/contract.service.ts`)

Ces services sont **prêts à utiliser** avec Supabase et appellent les Edge Functions.

### ✅ 3. Types synchronisés
- Types TypeScript alignés avec la structure SQL
- Types de base de données générés

## 🔧 CE QUI RESTE À FAIRE SUR SUPABASE

### 📊 1. Exécuter la migration SQL

#### Option A: Via Supabase CLI (recommandé)
```bash
# Si vous n'avez pas initialisé Supabase
supabase init

# Lier à votre projet
supabase link --project-ref YOUR_PROJECT_REF

# Exécuter la migration
supabase db push
```

#### Option B: Via le Dashboard Supabase
1. Connectez-vous à [app.supabase.com](https://app.supabase.com)
2. Allez dans **SQL Editor**
3. Cliquez sur **New Query**
4. Copiez/collez le contenu de `supabase/migrations/001_create_quotes_contracts_tables.sql`
5. Cliquez sur **Run**

### 🔌 2. Créer les Edge Functions

#### Méthode automatique (script fourni)
```bash
# Exécuter le script de déploiement
./scripts/deploy-finance-to-supabase.sh
```

#### Méthode manuelle
```bash
# Créer chaque fonction
supabase functions new quote-generator-ai
supabase functions new quote-analyzer
supabase functions new email-generator
supabase functions new contract-analyzer
supabase functions new contract-generator
supabase functions new esignature-workflow
supabase functions new financial-predictions
supabase functions new generate-financial-report

# Déployer
supabase functions deploy quote-generator-ai
# Répéter pour chaque fonction...
```

### 🔐 3. Configurer les variables d'environnement

```bash
# Secrets nécessaires
supabase secrets set OPENAI_API_KEY=your_openai_key
supabase secrets set SENDGRID_API_KEY=your_sendgrid_key
supabase secrets set STRIPE_API_KEY=your_stripe_key # Optionnel
```

### 🌐 4. Configurer les CORS (si nécessaire)

Dans chaque Edge Function, ajoutez les headers CORS:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

## 🧪 TESTER L'INTÉGRATION

### 1. Vérifier les tables
```sql
-- Dans SQL Editor
SELECT * FROM quotes LIMIT 1;
SELECT * FROM contracts LIMIT 1;
```

### 2. Tester une Edge Function
```bash
curl -X POST \
  https://YOUR_PROJECT.functions.supabase.co/quote-generator-ai \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "projectDescription": "Site e-commerce",
    "estimatedBudget": 10000
  }'
```

### 3. Vérifier les logs
```bash
supabase functions logs quote-generator-ai
```

## 📱 CONFIGURATION FRONTEND

### 1. Variables d'environnement
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key # Ne jamais exposer côté client!
```

### 2. Initialisation Supabase
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Migration SQL exécutée
- [ ] Tables créées et vérifiées
- [ ] Edge Functions créées
- [ ] Secrets configurés
- [ ] Edge Functions déployées
- [ ] Variables d'environnement frontend configurées
- [ ] Tests de connexion réussis

## 🆘 DÉPANNAGE

### Erreur: "relation quotes does not exist"
→ La migration n'a pas été exécutée. Lancez `supabase db push`

### Erreur: "No authorization header"
→ Ajoutez le header Authorization avec votre clé anon

### Erreur: Edge Function timeout
→ Augmentez le timeout dans la configuration de la fonction

### Erreur: CORS
→ Ajoutez les headers CORS dans vos Edge Functions

## 📚 RESSOURCES

- [Documentation Edge Functions](https://supabase.com/docs/guides/functions)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

---

**Note**: Les Edge Functions du module Finance utilisent l'IA (OpenAI) pour fournir des fonctionnalités avancées. Assurez-vous d'avoir un compte OpenAI avec des crédits suffisants.