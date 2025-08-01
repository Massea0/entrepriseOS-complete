# 🚀 MISSION COPILOT - MODULE FINANCE ENTREPRISEOS

## 📋 CONTEXTE

Vous avez accès à un projet EntrepriseOS avec un module Finance avancé qui a été développé mais qui nécessite d'être déployé sur Supabase. Le module inclut:

- **Backend complet** : Types, Services, Hooks
- **UI Quote Management** : Composants React terminés
- **Intégrations IA** : 8 Edge Functions prévues
- **Migration SQL** : Tables quotes et contracts prêtes

## 🎯 VOTRE MISSION

### PHASE 1 : ANALYSE DE L'EXISTANT SUPABASE

1. **Vérifier les tables existantes**
```sql
-- Exécuter dans SQL Editor Supabase
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

2. **Vérifier les Edge Functions existantes**
```bash
supabase functions list
```

3. **Identifier les conflits potentiels**
- Tables `quotes` ou `contracts` déjà existantes ?
- Edge Functions avec les mêmes noms ?
- Politiques RLS conflictuelles ?

### PHASE 2 : DÉPLOIEMENT DE LA MIGRATION

#### Fichier à examiner
📄 `supabase/migrations/001_create_quotes_contracts_tables.sql`

#### Actions selon le contexte

**Cas A : Tables n'existent pas**
```bash
# Exécuter directement
supabase db push
```

**Cas B : Tables existent partiellement**
```sql
-- Adapter la migration en ajoutant des checks
-- Au début du fichier SQL, ajouter:
DO $$ 
BEGIN
  -- Vérifier si la table quotes existe
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quotes') THEN
    -- Créer la table
    CREATE TABLE quotes (...);
  END IF;
END $$;
```

**Cas C : Conflit total**
- Renommer les nouvelles tables (ex: `finance_quotes`, `finance_contracts`)
- Mettre à jour les services TypeScript en conséquence

### PHASE 3 : EDGE FUNCTIONS

#### Vérifier les fonctions existantes
```bash
# Lister les fonctions
supabase functions list
```

#### Edge Functions à créer/adapter

1. **quote-generator-ai**
   - Si existe : vérifier la compatibilité
   - Sinon : créer avec le template

2. **quote-analyzer**
3. **email-generator**
4. **contract-analyzer**
5. **contract-generator**
6. **esignature-workflow**
7. **financial-predictions**
8. **generate-financial-report**

#### Template de base pour chaque fonction
```typescript
// supabase/functions/[function-name]/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Parse request
    const body = await req.json()

    // TODO: Implémenter la logique spécifique
    
    return new Response(
      JSON.stringify({ success: true, data: {} }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
```

### PHASE 4 : CONFIGURATION

#### Variables d'environnement nécessaires
```bash
# Dans Supabase Dashboard > Settings > Edge Functions
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set SENDGRID_API_KEY=SG...
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

### PHASE 5 : TESTS ET VALIDATION

#### 1. Tester les tables
```sql
-- Vérifier la structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes';

-- Tester l'insertion
INSERT INTO quotes (organization_id, quote_number, client_name, total_amount)
VALUES ('test-org', 'Q-2024-001', 'Test Client', 1000)
RETURNING *;
```

#### 2. Tester une Edge Function
```bash
curl -X POST \
  https://[PROJECT_REF].supabase.co/functions/v1/quote-generator-ai \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "projectDescription": "Site e-commerce moderne",
    "estimatedBudget": 10000
  }'
```

#### 3. Tester l'interface
```bash
# Dans le projet frontend
npm install react-hook-form @hookform/resolvers zod date-fns
npm run dev

# Accéder à
http://localhost:3000/finance/quotes
```

## 📁 FICHIERS IMPORTANTS À EXAMINER

### Backend
- `src/features/finance/services/quote.service.ts` - Service principal
- `src/features/finance/services/contract.service.ts` - Service contrats
- `src/features/finance/types/` - Tous les types TypeScript
- `src/features/finance/hooks/` - Hooks React Query

### Frontend
- `src/features/finance/components/quotes/` - Composants UI
- `src/app/finance/quotes/page.tsx` - Page principale

### Supabase
- `supabase/migrations/001_create_quotes_contracts_tables.sql` - Migration
- `supabase/functions/README.md` - Documentation Edge Functions
- `SUPABASE_DEPLOYMENT_GUIDE.md` - Guide complet

## ⚠️ POINTS D'ATTENTION

1. **RLS (Row Level Security)**
   - Les politiques utilisent `organization_id`
   - S'assurer que l'auth est configurée correctement

2. **Numérotation automatique**
   - Les devis utilisent le format `Q-YYYY-XXXX`
   - Géré par trigger SQL

3. **Colonnes calculées**
   - `subtotal`, `tax_amount`, `total_amount` sont calculées automatiquement

4. **Edge Functions et CORS**
   - Toujours inclure les headers CORS
   - Gérer le preflight OPTIONS

## 🎯 RÉSULTAT ATTENDU

Une fois terminé, vous devriez avoir :

✅ Tables créées dans Supabase
✅ Edge Functions déployées et fonctionnelles
✅ Interface utilisateur accessible
✅ Création de devis avec IA fonctionnelle
✅ Filtres et recherche opérationnels
✅ Export PDF disponible

## 💡 COMMANDES UTILES

```bash
# Connexion Supabase
supabase login
supabase link --project-ref [YOUR_PROJECT_REF]

# Migrations
supabase db push
supabase db reset (si besoin de repartir de zéro)

# Edge Functions
supabase functions new [function-name]
supabase functions deploy [function-name]
supabase functions logs [function-name]

# Secrets
supabase secrets list
supabase secrets set KEY=value
```

## 🚨 EN CAS DE PROBLÈME

1. **Erreur de migration**
   - Vérifier les logs : `supabase db logs`
   - Adapter le SQL selon l'existant

2. **Edge Function ne fonctionne pas**
   - Vérifier les logs : `supabase functions logs [name]`
   - Tester avec curl en local d'abord

3. **Erreur CORS**
   - Ajouter les headers dans chaque Edge Function
   - Vérifier la configuration du projet

---

**BONNE CHANCE ! Le code est prêt, il ne reste qu'à l'adapter à votre contexte Supabase existant.**