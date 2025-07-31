# 🚀 GUIDE FINAL - MIGRATION VERS SUPABASE

## 📊 RÉSUMÉ DE VOTRE SITUATION

### ✅ Ce que vous avez déjà dans Supabase :
- **50+ tables** incluant toute la structure business
- Tables core : `companies`, `users`, `employees`, `projects`, `tasks`
- Tables business : `invoices`, `devis`, `contracts`
- Infrastructure AI complète : `ai_agents`, `ai_agent_actions`, etc.
- Support & Workflows : `tickets`, `workflows`, etc.

### ❌ Ce qui manque :
- Quelques colonnes dans `companies` (siret, website, etc.)
- Quelques colonnes dans `users` (avatar_url, updated_at)
- Tables RH : `leave_types`, `leave_requests`, `leave_balances`
- Vue `profiles` pour compatibilité avec le code existant
- Policies RLS

## 🔧 ÉTAPES DE MIGRATION

### ÉTAPE 1 : VÉRIFIER VOS DONNÉES

```bash
# Ajouter dans .env si pas déjà fait :
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role

# Vérifier les données existantes :
node scripts/check-supabase-data.mjs
```

### ÉTAPE 2 : MIGRATION COMPLÉMENTAIRE

Dans **Supabase SQL Editor**, exécutez :

```sql
-- Copier le contenu de :
supabase/migrations/20250729_complement_only.sql
```

Cette migration :
- ✅ Ajoute les colonnes manquantes
- ✅ Crée les 3 tables RH manquantes
- ✅ Crée une vue `profiles` → `users`
- ✅ Ne touche PAS à vos tables existantes

### ÉTAPE 3 : ACTIVER RLS

Si pas déjà activé, dans SQL Editor :

```sql
-- Activer RLS sur toutes les tables principales
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
```

### ÉTAPE 4 : AJOUTER LES POLICIES RLS

```sql
-- Copier le contenu de :
supabase/migrations/20250729_rls_policies_adapted.sql
```

### ÉTAPE 5 : ADAPTER LE CODE

#### A. Backend - Remplacer Neon par Supabase

**Fichier : `server/db.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
```

#### B. Adapter `storage.ts` pour Supabase

**Remplacer les requêtes Drizzle par Supabase**

Exemple :
```typescript
// Avant (Drizzle)
const result = await db.select().from(companies);

// Après (Supabase)
const { data, error } = await supabase
  .from('companies')
  .select('*');
```

#### C. Frontend - Utiliser le client Supabase existant

Le fichier `client/src/lib/supabase.ts` est déjà créé ✅

### ÉTAPE 6 : MIGRATION DES DONNÉES (si nécessaire)

Si vous avez des données dans Neon à migrer :

```bash
node scripts/migrate-neon-to-supabase.mjs
```

### ÉTAPE 7 : VÉRIFICATION

1. **Tester l'authentification** :
   - Login/Logout
   - Création de compte

2. **Tester les opérations CRUD** :
   - Créer une facture
   - Modifier un projet
   - Consulter les données

3. **Vérifier les Edge Functions** :
   - Les fonctions AI
   - Les webhooks

## 📝 NOTES IMPORTANTES

### 1. Table `users` vs `profiles`
- Votre DB utilise `users` (pas `profiles`)
- La vue `profiles` créée assure la compatibilité
- Le code peut utiliser l'un ou l'autre

### 2. Clés API
- **Anon Key** : Pour le frontend (lecture publique)
- **Service Role Key** : Pour le backend (tous droits)
- Ne JAMAIS exposer la Service Role Key côté client

### 3. RLS (Row Level Security)
- Activé = Sécurité renforcée
- Les policies définissent qui peut faire quoi
- Commencez simple, affinez ensuite

## 🎯 RÉSULTAT ATTENDU

Après ces étapes :
- ✅ 100% sur Supabase (plus de Neon)
- ✅ Authentification Supabase
- ✅ RLS activé et sécurisé
- ✅ Toutes les fonctionnalités opérationnelles
- ✅ Edge Functions intégrées

## 🆘 EN CAS DE PROBLÈME

1. **"Invalid API key"** → Vérifiez les clés dans .env
2. **"permission denied"** → Vérifiez les policies RLS
3. **"relation does not exist"** → La migration n'est pas passée
4. **Données manquantes** → Lancer la migration depuis Neon

## 🚀 PROCHAINES ÉTAPES

1. Optimiser les policies RLS par rôle
2. Ajouter des indexes pour les performances
3. Configurer les backups automatiques
4. Monitoring avec Supabase Dashboard

---

**C'est parti ! Commencez par l'ÉTAPE 1** 🎉